"use client";

import React, { useState, useEffect } from 'react';
import { api, getBaseApiUrl } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Menunggu',    color: 'text-amber-600',  bg: 'bg-amber-50'   },
  processing: { label: 'Diproses',   color: 'text-blue-600',   bg: 'bg-blue-50'    },
  shipped:    { label: 'Dikirim',     color: 'text-indigo-600', bg: 'bg-indigo-50'  },
  completed:  { label: 'Selesai',     color: 'text-green-600',  bg: 'bg-green-50'   },
  cancelled:  { label: 'Dibatalkan', color: 'text-red-600',    bg: 'bg-red-50'     },
};

function OrdersContent() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.get('/orders');
      setOrders(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (id: number, orderNumber: string) => {
    try {
      setDownloading(id);
      const token = localStorage.getItem('auth_token');
      const API_URL = getBaseApiUrl();
      
      const response = await fetch(`${API_URL}/orders/${id}/invoice`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to download invoice');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Error downloading invoice');
    } finally {
      setDownloading(null);
    }
  };

  const cancelOrder = async (id: number) => {
    if (!confirm('Batalkan pesanan ini?')) return;
    setCancelling(id);
    try {
      await api.post(`/orders/${id}/cancel`, {});
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Gagal membatalkan pesanan.');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-secondary rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="pt-32 pb-20 min-h-screen bg-accent">
      <div className="container">
        <div className="mb-10">
          <a href="/" className="text-secondary text-xs uppercase tracking-widest font-bold hover:translate-x-1 transition-transform inline-flex items-center gap-2">
            ← Back to Shop
          </a>
          <h1 className="text-5xl font-bold text-primary mt-4">My Orders</h1>
          <div className="h-1 w-16 bg-secondary mt-3"></div>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-5 rounded-2xl mb-8 flex items-center gap-4 fade-in">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold">Pesanan berhasil dibuat!</p>
              <p className="text-sm mt-0.5">Tim kami akan segera memproses pesanan Anda.</p>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-6xl mb-6">📦</p>
            <h2 className="text-2xl font-bold text-primary mb-3">Belum ada pesanan</h2>
            <p className="text-text-muted mb-8">Mulai belanja untuk membuat pesanan pertama Anda</p>
            <a href="/" className="bg-primary text-white px-10 py-4 rounded-full font-bold hover:bg-secondary transition-all">
              Shop Now
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              return (
                <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-8 py-5 border-b border-gray-50">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-text-muted font-bold mb-1">Order Number</p>
                      <p className="font-bold text-primary">{order.order_number}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                      <p className="text-xs text-text-muted mt-2">
                        {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-8 py-5">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center py-2 text-sm border-b border-gray-50 last:border-0">
                        <div>
                          <p className="font-medium text-primary">{item.product?.name}</p>
                          <p className="text-text-muted">Qty: {item.quantity} × Rp {parseFloat(item.price).toLocaleString('id-ID')}</p>
                        </div>
                        <p className="font-bold text-primary">
                          Rp {(parseFloat(item.price) * item.quantity).toLocaleString('id-ID')}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-8 py-5 bg-accent/30">
                    <div>
                      <p className="text-xs text-text-muted">Kurir: <span className="font-medium text-primary">{order.courier}</span></p>
                      <p className="text-xs text-text-muted mt-0.5 max-w-xs truncate">Alamat: {order.shipping_address}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-text-muted">Total</p>
                        <p className="font-bold text-primary text-lg">Rp {parseFloat(order.total_price).toLocaleString('id-ID')}</p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {order.status !== 'cancelled' && (
                          <button
                            onClick={() => handleDownloadInvoice(order.id, order.order_number)}
                            disabled={downloading === order.id}
                            className="bg-primary text-white hover:bg-secondary px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {downloading === order.id ? (
                              <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : '📄 Invoice'}
                          </button>
                        )}
                        
                        {order.status === 'pending' && (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            disabled={cancelling === order.id}
                            className="border border-red-200 text-red-500 hover:bg-red-500 hover:text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                          >
                            {cancelling === order.id ? '...' : 'Batalkan'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard requireRole="customer">
      <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-t-secondary rounded-full animate-spin"></div></div>}>
        <OrdersContent />
      </React.Suspense>
    </AuthGuard>
  );
}
