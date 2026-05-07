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

    /**
     * Export Order to PDF Invoice
     */
    public function downloadInvoice(Request $request, string $id)
    {
        $order = Order::with(['items.product', 'user'])
            ->where('id', $id)
            ->firstOrFail();

        // Security: only owner, admin, or the owner of the order can download
        if ($request->user()->role !== 'admin' && $request->user()->role !== 'owner' && $request->user()->id !== $order->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        require_once app_path('Libraries/fpdf.php');

        $pdf = new \FPDF('P', 'mm', 'A4');
        $pdf->AddPage();
        
        // Logo
        $logoPath = public_path('logo.png');
        if (file_exists($logoPath)) {
            $imgData = file_get_contents($logoPath, false, null, 0, 4);
            $type = '';
            if (strpos($imgData, "\x89PNG") === 0) $type = 'PNG';
            elseif (strpos($imgData, "\xff\xd8") === 0) $type = 'JPG';
            
            try {
                if ($type) $pdf->Image($logoPath, 10, 10, 25, 0, $type);
                else $pdf->Image($logoPath, 10, 10, 25);
            } catch (\Exception $e) {}
        }

        // Header
        $pdf->SetFont('Arial', 'B', 20);
        $pdf->Cell(0, 10, 'INVOICE', 0, 1, 'R');
        $pdf->SetFont('Arial', '', 10);
        $pdf->Cell(0, 5, $order->order_number, 0, 1, 'R');
        $pdf->Cell(0, 5, 'Date: ' . $order->created_at->format('d M Y'), 0, 1, 'R');
        
        $pdf->Ln(15);

        // Company vs Customer Info
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(95, 7, 'SAINT CLAIRE BEAUTY', 0, 0);
        $pdf->Cell(95, 7, 'BILL TO:', 0, 1);
        
        $pdf->SetFont('Arial', '', 10);
        $pdf->Cell(95, 5, 'Banjarmasin, Indonesia', 0, 0);
        $pdf->Cell(95, 5, $order->user->name, 0, 1);
        
        $pdf->Cell(95, 5, 'Phone: +62 812 3456 7890', 0, 0);
        $pdf->Cell(95, 5, $order->user->email, 0, 1);
        
        $pdf->Cell(95, 5, 'Email: hi@saintclaire.com', 0, 0);
        $pdf->SetFont('Arial', 'I', 9);
        $pdf->MultiCell(95, 5, $order->shipping_address, 0, 'L');
        
        $pdf->Ln(10);

        // Table Header
        $pdf->SetFillColor(240, 240, 240);
        $pdf->SetFont('Arial', 'B', 10);
        $pdf->Cell(10, 10, 'No', 1, 0, 'C', true);
        $pdf->Cell(100, 10, 'Product Description', 1, 0, 'C', true);
        $pdf->Cell(25, 10, 'Qty', 1, 0, 'C', true);
        $pdf->Cell(25, 10, 'Price', 1, 0, 'C', true);
        $pdf->Cell(30, 10, 'Total', 1, 1, 'C', true);

        // Table Content
        $pdf->SetFont('Arial', '', 10);
        $subtotal = 0;
        foreach ($order->items as $idx => $item) {
            $total = (float)$item->price * $item->quantity;
            $subtotal += $total;
            
            $pdf->Cell(10, 8, $idx + 1, 1, 0, 'C');
            $pdf->Cell(100, 8, $item->product->name, 1, 0, 'L');
            $pdf->Cell(25, 8, $item->quantity, 1, 0, 'C');
            $pdf->Cell(25, 8, 'Rp ' . number_format((float)$item->price, 0, ',', '.'), 1, 0, 'R');
            $pdf->Cell(30, 8, 'Rp ' . number_format($total, 0, ',', '.'), 1, 1, 'R');
        }

        // Totals
        $pdf->Ln(5);
        $pdf->SetFont('Arial', 'B', 10);
        $pdf->Cell(135);
        $pdf->Cell(25, 7, 'Subtotal', 0, 0, 'L');
        $pdf->Cell(30, 7, 'Rp ' . number_format((float)$subtotal, 0, ',', '.'), 0, 1, 'R');
        
        $pdf->Cell(135);
        $pdf->Cell(25, 7, 'Shipping (' . strtoupper($order->courier) . ')', 0, 0, 'L');
        $pdf->Cell(30, 7, 'Rp ' . number_format((float)$order->shipping_cost, 0, ',', '.'), 0, 1, 'R');
        
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->SetTextColor(155, 118, 83); // Secondary color
        $pdf->Cell(135);
        $pdf->Cell(25, 10, 'TOTAL', 0, 0, 'L');
        $pdf->Cell(30, 10, 'Rp ' . number_format((float)$order->total_price, 0, ',', '.'), 0, 1, 'R');
        
        $pdf->Ln(20);
        $pdf->SetTextColor(0);
        $pdf->SetFont('Arial', 'I', 10);
        $pdf->Cell(0, 10, 'Thank you for choosing Saint Claire Beauty for your skincare routine!', 0, 1, 'C');
        
        return response($pdf->Output('S'), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="Invoice-' . $order->order_number . '.pdf"',
        ]);
    }
}
