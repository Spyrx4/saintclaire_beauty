<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Midtrans\Config as MidtransConfig;
use Midtrans\Snap;
use Midtrans\Notification;

class PaymentController extends Controller
{
    public function __construct()
    {
        MidtransConfig::$serverKey    = env('MIDTRANS_SERVER_KEY', '');
        MidtransConfig::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        MidtransConfig::$isSanitized  = true;
        MidtransConfig::$is3ds        = true;
    }

    /**
     * Buat Midtrans Snap Token untuk order tertentu.
     * Customer hanya boleh buat token untuk pesanan miliknya.
     */
    public function createSnapToken(Request $request)
    {
        $request->validate(['order_id' => 'required|exists:orders,id']);

        $user  = $request->user();
        $order = Order::with(['user', 'items.product'])
            ->where('id', $request->order_id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'Pesanan sudah dibayar.'], 400);
        }

        $serverKey = env('MIDTRANS_SERVER_KEY', '');
        if (empty($serverKey) || $serverKey === 'YOUR_MIDTRANS_SERVER_KEY') {
            return response()->json([
                'message'    => 'Midtrans belum dikonfigurasi. Hubungi admin.',
                'configured' => false,
            ], 503);
        }

        try {
            $params = [
                'transaction_details' => [
                    'order_id'     => $order->order_number,
                    'gross_amount' => (int) ($order->total_price + $order->shipping_cost),
                ],
                'customer_details' => [
                    'first_name' => $order->user->name,
                    'email'      => $order->user->email,
                ],
                'item_details' => $order->items->map(fn($item) => [
                    'id'       => (string) $item->product_id,
                    'price'    => (int) $item->price,
                    'quantity' => $item->quantity,
                    'name'     => substr($item->product->name, 0, 50),
                ])->push([
                    'id'       => 'SHIPPING',
                    'price'    => (int) $order->shipping_cost,
                    'quantity' => 1,
                    'name'     => 'Ongkos Kirim (' . $order->courier . ')',
                ])->toArray(),
            ];

            $snapToken = Snap::getSnapToken($params);

            // Simpan token ke order
            $order->update(['payment_token' => $snapToken]);

            return response()->json([
                'snap_token'  => $snapToken,
                'client_key'  => env('MIDTRANS_CLIENT_KEY', ''),
                'order_number' => $order->order_number,
                'configured'  => true,
            ]);

        } catch (\Exception $e) {
            Log::error('Midtrans snap token error: ' . $e->getMessage());
            return response()->json([
                'message'    => 'Gagal membuat token pembayaran: ' . $e->getMessage(),
                'configured' => true,
            ], 500);
        }
    }

    /**
     * Webhook dari Midtrans — notifikasi status pembayaran.
     * Endpoint ini PUBLIC (tidak perlu auth).
     */
    public function webhook(Request $request)
    {
        $serverKey = env('MIDTRANS_SERVER_KEY', '');
        if (empty($serverKey) || $serverKey === 'YOUR_MIDTRANS_SERVER_KEY') {
            return response()->json(['message' => 'Not configured'], 200);
        }

        try {
            $notification = new Notification();
            $transactionStatus = $notification->transaction_status;
            $orderId           = $notification->order_id; // ini order_number kita
            $fraudStatus       = $notification->fraud_status;
            $transactionId     = $notification->transaction_id;

            $order = Order::where('order_number', $orderId)->firstOrFail();

            if ($transactionStatus == 'capture') {
                if ($fraudStatus == 'challenge') {
                    $order->update(['payment_status' => 'challenge']);
                } else if ($fraudStatus == 'accept') {
                    $order->update([
                        'payment_status'          => 'paid',
                        'status'                  => 'processing',
                        'midtrans_transaction_id' => $transactionId,
                    ]);
                }
            } else if ($transactionStatus == 'settlement') {
                $order->update([
                    'payment_status'          => 'paid',
                    'status'                  => 'processing',
                    'midtrans_transaction_id' => $transactionId,
                ]);
            } else if (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                $order->update(['payment_status' => 'failed', 'status' => 'cancelled']);
            } else if ($transactionStatus == 'pending') {
                $order->update(['payment_status' => 'pending']);
            }

            return response()->json(['message' => 'OK']);

        } catch (\Exception $e) {
            Log::error('Midtrans webhook error: ' . $e->getMessage());
            return response()->json(['message' => 'Error'], 500);
        }
    }

    /**
     * Kasir mengkonfirmasi pembayaran COD saat barang diterima.
     */
    public function confirmCod(Request $request, string $id)
    {
        $order = Order::findOrFail($id);

        if ($order->payment_method !== 'cod') {
            return response()->json(['message' => 'Pesanan ini bukan metode COD.'], 400);
        }

        $order->update([
            'payment_status' => 'paid',
            'status'         => 'completed',
        ]);

        return response()->json(['message' => 'COD dikonfirmasi. Pesanan selesai.', 'order' => $order]);
    }
}
