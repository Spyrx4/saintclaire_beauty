<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Customer: List own orders only
     */
    public function index(Request $request)
    {
        $orders = Order::with('items.product')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);
        return response()->json($orders);
    }

    /**
     * Admin: List ALL orders (for admin panel)
     */
    public function allOrders(Request $request)
    {
        $orders = Order::with(['items.product', 'user'])
            ->latest()
            ->paginate(20);
        return response()->json($orders);
    }

    /**
     * Customer: Checkout from cart
     */
    public function store(Request $request)
    {
        $request->validate([
            'shipping_address'  => 'required|string',
            'courier'           => 'required|string',
            'payment_method'    => 'required|in:cod,midtrans',
            'shipping_cost'     => 'required|numeric|min:0',
            'city_destination'  => 'nullable|string',
        ]);

        $user = $request->user();
        $cart = Cart::with('items.product')->where('user_id', $user->id)->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        return DB::transaction(function () use ($cart, $user, $request) {
            $subtotal = $cart->items->sum(function($item) {
                return $item->product->selling_price * $item->quantity;
            });

            $totalPrice = $subtotal + $request->shipping_cost;

            $order = Order::create([
                'user_id'          => $user->id,
                'order_number'     => 'TRX-' . strtoupper(bin2hex(random_bytes(4))),
                'total_price'      => $totalPrice,
                'status'           => 'pending',
                'payment_status'   => 'unpaid',
                'payment_method'   => $request->payment_method,
                'shipping_address' => $request->shipping_address,
                'courier'          => $request->courier,
                'shipping_cost'    => $request->shipping_cost,
                'city_destination' => $request->city_destination,
            ]);

            foreach ($cart->items as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->product->selling_price,
                ]);
                
                // Reduce stock
                $item->product->decrement('stock', $item->quantity);
            }

            // Clear cart
            $cart->items()->delete();

            return response()->json($order->load('items.product'), 201);
        });
    }

    /**
     * Customer: Show own order only
     */
    public function show(Request $request, string $id)
    {
        $order = Order::with('items.product')
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);
        return response()->json($order);
    }

    /**
     * Customer: Cancel own pending order
     */
    public function cancel(Request $request, string $id)
    {
        $order = Order::where('user_id', $request->user()->id)->findOrFail($id);

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Order cannot be cancelled'], 400);
        }

        DB::transaction(function () use ($order) {
            $order->update(['status' => 'cancelled']);

            // Restore stock
            foreach ($order->items as $item) {
                $item->product->increment('stock', $item->quantity);
            }
        });

        return response()->json(['message' => 'Order cancelled']);
    }

    /**
     * Admin: Update order status (processing, shipped, completed)
     */
    public function updateStatus(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,completed,cancelled',
        ]);

        $order = Order::findOrFail($id);

        // If cancelling, restore stock
        if ($request->status === 'cancelled' && $order->status !== 'cancelled') {
            DB::transaction(function () use ($order, $request) {
                $order->update(['status' => $request->status]);
                foreach ($order->items as $item) {
                    $item->product->increment('stock', $item->quantity);
                }
            });
        } else {
            $order->update(['status' => $request->status]);
        }

        return response()->json($order->load(['items.product', 'user']));
    }
}
