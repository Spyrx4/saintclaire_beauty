"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { api, getBaseApiUrl } from '@/lib/api';
import { getUser } from '@/lib/auth';
import AuthGuard from '@/components/AuthGuard';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:    { label: 'Menunggu',  color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200' },
  processing: { label: 'Diproses', color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200'  },
  shipped:    { label: 'Dikirim',   color: 'text-indigo-700', bg: 'bg-indigo-50',  border: 'border-indigo-200'},
  completed:  { label: 'Selesai',   color: 'text-green-700',  bg: 'bg-green-50',   border: 'border-green-200' },
  cancelled:  { label: 'Dibatal',  color: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-200'   },
};

const NEXT_STATUS: Record<string, { label: string; next: string }> = {
  pending:    { label: '▶ Proses',  next: 'processing' },
  processing: { label: '📦 Kirim',  next: 'shipped'    },
  shipped:    { label: '✓ Selesai', next: 'completed'  },
};

function KasirDashboardContent() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);
  const [tracking, setTracking] = useState<Record<number, string>>({});
  const [showTracking, setShowTracking] = useState<number | null>(null);
  const [codConfirming, setCodConfirming] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);
  const user = getUser();

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

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const data = await api.get(`/kasir/orders${params}`);
      setOrders(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId: number, nextStatus: string) => {
    setUpdating(orderId);
    try {
      const payload: any = { status: nextStatus };
      if (nextStatus === 'shipped' && tracking[orderId]) {
        payload.tracking_number = tracking[orderId];
      }
      await api.put(`/kasir/orders/${orderId}/status`, payload);
      await fetchOrders();
      setShowTracking(null);
    } catch (err: any) {
      alert(err.message || 'Gagal update status.');
    } finally {
      setUpdating(null);
    }
  };

  const confirmCod = async (orderId: number) => {
    if (!confirm('Konfirmasi bahwa pembayaran COD telah diterima?')) return;
    setCodConfirming(orderId);
    try {
      await api.post(`/kasir/orders/${orderId}/cod`, {});
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Gagal konfirmasi COD.');
    } finally {
      setCodConfirming(null);
    }
  };

  const counts = {
    pending:    orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped:    orders.filter(o => o.status === 'shipped').length,
  };

  return (
    <div className="flex min-h-screen bg-slate-50 pt-24">
      {/* Sidebar */}
      <aside className="w-72 glass border-r border-gray-200 p-8 flex flex-col gap-6 min-h-screen">
        <div>
          <a href="/" className="text-xs uppercase tracking-widest font-bold text-secondary flex items-center gap-2 hover:translate-x-1 transition-transform mb-8">
            ← Back to Home
          </a>
          <img src="/logo.png" alt="Saint Claire Logo" className="h-12 w-auto rounded-lg mb-6 shadow-sm" />
        </div>

        <div className="bg-primary/5 rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-text-muted font-bold mb-1">Logged in as</p>
          <p className="text-primary font-bold">{user?.name}</p>
          <span className="inline-block mt-2 text-[10px] uppercase tracking-widest bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
            Kasir
          </span>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <h3 className="uppercase tracking-widest text-xs font-bold text-primary">Status Pesanan</h3>
          {[
            { key: '',           label: 'Semua',     count: orders.length },
            { key: 'pending',    label: 'Menunggu',  count: counts.pending    },
            { key: 'processing', label: 'Diproses',  count: counts.processing },
            { key: 'shipped',    label: 'Dikirim',   count: counts.shipped    },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition-all text-sm ${
                statusFilter === f.key
                  ? 'bg-primary text-white shadow'
                  : 'text-text-muted hover:bg-white hover:text-primary'
              }`}
            >
              <span>{f.label}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                statusFilter === f.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-primary'
              }`}>{f.count}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-10">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">Kasir Panel</span>
            <h1 className="text-4xl font-bold text-primary mt-1">Manajemen Pesanan</h1>
          </div>
          <button onClick={() => fetchOrders()} className="bg-white border border-gray-200 px-5 py-2 rounded-lg text-sm font-medium hover:shadow-md transition-all">
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-secondary rounded-full animate-spin"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 text-text-muted">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-lg font-medium">Tidak ada pesanan ditemukan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const nextAction = NEXT_STATUS[order.status];
              const isCodShipped = order.payment_method === 'cod' && order.status === 'shipped';

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-bold text-primary">{order.order_number}</p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {order.user?.name} · {new Date(order.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Payment Method Badge */}
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                        order.payment_method === 'cod'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {order.payment_method === 'cod' ? '💵 COD' : '💳 Midtrans'}
                      </span>
                      {/* Payment Status */}
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                        order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {order.payment_status === 'paid' ? '✓ Lunas' : 'Belum Bayar'}
                      </span>
                      {/* Order Status */}
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${s.bg} ${s.color} ${s.border}`}>
                        {s.label}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0"></div>
                          <span className="text-primary font-medium truncate">{item.product?.name}</span>
                          <span className="text-text-muted flex-shrink-0">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-6 text-xs text-text-muted pt-2 border-t border-gray-50">
                      <span>📍 {order.shipping_address?.substring(0, 60)}...</span>
                      <span>🚚 {order.courier}</span>
                      {order.tracking_number && <span>📌 {order.tracking_number}</span>}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50">
                    <p className="font-bold text-primary text-lg">
                      Rp {parseFloat(order.total_price).toLocaleString('id-ID')}
                      <span className="text-xs text-text-muted font-normal ml-2">
                        (ongkir Rp {parseFloat(order.shipping_cost || 0).toLocaleString('id-ID')})
                      </span>
                    </p>

                    <div className="flex gap-2">
                      {/* Invoice Button */}
                      {order.status !== 'cancelled' && (
                        <button
                          onClick={() => handleDownloadInvoice(order.id, order.order_number)}
                          disabled={downloading === order.id}
                          className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {downloading === order.id ? (
                            <div className="w-3 h-3 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                          ) : '📄 Invoice'}
                        </button>
                      )}

                      {/* COD Confirm Button — only when shipped */}
                      {isCodShipped && order.payment_status !== 'paid' && (
                        <button
                          onClick={() => confirmCod(order.id)}
                          disabled={codConfirming === order.id}
                          className="bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-all disabled:opacity-50"
                        >
                          {codConfirming === order.id ? '...' : '💵 Konfirmasi COD'}
                        </button>
                      )}

                      {/* Next Status Button */}
                      {nextAction && order.status !== 'shipped' && (
                        <button
                          onClick={() => updateStatus(order.id, nextAction.next)}
                          disabled={updating === order.id}
                          className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-secondary transition-all disabled:opacity-50"
                        >
                          {updating === order.id ? '...' : nextAction.label}
                        </button>
                      )}

                      {/* Ship with tracking number */}
                      {order.status === 'processing' && (
                        <div className="flex gap-2">
                          {showTracking === order.id ? (
                            <>
                              <input
                                type="text"
                                placeholder="No. Resi"
                                value={tracking[order.id] || ''}
                                onChange={e => setTracking(t => ({ ...t, [order.id]: e.target.value }))}
                                className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-secondary/20"
                              />
                              <button
                                onClick={() => updateStatus(order.id, 'shipped')}
                                disabled={updating === order.id}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                              >
                                {updating === order.id ? '...' : '📦 Kirim'}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setShowTracking(order.id)}
                              className="border border-indigo-200 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all"
                            >
                              📦 Kirim + Resi
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function KasirDashboardPage() {
  return (
    <AuthGuard requireRole="kasir">
      <KasirDashboardContent />
    </AuthGuard>
  );
}
