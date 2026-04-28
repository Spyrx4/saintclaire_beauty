<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $cart = Cart::with('items.product')->firstOrCreate(['user_id' => $request->user()->id]);
        return response()->json($cart);
    }

    public function addItem(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);
        
        $item = $cart->items()->where('product_id', $request->product_id)->first();
        if ($item) {
            $item->update(['quantity' => $item->quantity + $request->quantity]);
        } else {
            $cart->items()->create([
                'product_id' => $request->product_id,
                'quantity' => $request->quantity
            ]);
        }

        return response()->json($cart->load('items.product'));
    }

    public function updateItem(Request $request, $itemId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $item = CartItem::whereHas('cart', function($q) use ($request) {
            $q->where('user_id', $request->user()->id);
        })->findOrFail($itemId);

        $item->update(['quantity' => $request->quantity]);

        return response()->json($item->load('product'));
    }

    public function removeItem(Request $request, $itemId)
    {
        $item = CartItem::whereHas('cart', function($q) use ($request) {
            $q->where('user_id', $request->user()->id);
        })->findOrFail($itemId);

        $item->delete();

        return response()->json(['message' => 'Item removed']);
    }

    public function clear(Request $request)
    {
        $cart = Cart::where('user_id', $request->user()->id)->first();
        if ($cart) {
            $cart->items()->delete();
        }

        return response()->json(['message' => 'Cart cleared']);
    }
}
