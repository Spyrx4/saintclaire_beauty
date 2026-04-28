<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class KasirController extends Controller
{
    /**
     * Kasir: Lihat semua pesanan (fokus: pending & processing)
     */
    public function index(Request $request)
    {
        $status = $request->input('status', null);

        $query = Order::with(['user', 'items.product'])->latest();

        if ($status) {
            $query->where('status', $status);
        }

        $orders = $query->paginate(20);

        return response()->json($orders);
    }

    /**
     * Kasir: Lihat detail satu pesanan
     */
    public function show(string $id)
    {
        $order = Order::with(['user', 'items.product'])->findOrFail($id);
        return response()->json($order);
    }

    /**
     * Kasir: Update status pesanan
     * Alur: pending → processing → shipped → completed
     */
    public function updateStatus(Request $request, string $id)
    {
        $request->validate([
            'status'          => 'required|in:processing,shipped,completed',
            'tracking_number' => 'nullable|string',
        ]);

        $order = Order::findOrFail($id);

        // Validasi alur status
        $allowedTransitions = [
            'pending'    => ['processing'],
            'processing' => ['shipped'],
            'shipped'    => ['completed'],
        ];

        if (!in_array($request->status, $allowedTransitions[$order->status] ?? [])) {
            return response()->json([
                'message' => "Tidak bisa mengubah status dari '{$order->status}' ke '{$request->status}'.",
            ], 400);
        }

        $updateData = ['status' => $request->status];
        if ($request->tracking_number) {
            $updateData['tracking_number'] = $request->tracking_number;
        }

        $order->update($updateData);

        return response()->json([
            'message' => 'Status pesanan diperbarui.',
            'order'   => $order->load(['user', 'items.product']),
        ]);
    }
}
