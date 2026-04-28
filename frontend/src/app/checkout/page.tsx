"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';

declare global {
  interface Window { snap: any; }
}

const DEFAULT_WEIGHT = 500; // gram

function CheckoutContent() {
  const [cart, setCart] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'midtrans'>('cod');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Shipping state
  const [cities, setCities] = useState<any[]>([]);
  const [citySearch, setCitySearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [selectedCourier, setSelectedCourier] = useState('jne');
  const [shippingCosts, setShippingCosts] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [checkingOngkir, setCheckingOngkir] = useState(false);
  const [midtransClientKey, setMidtransClientKey] = useState('');

  const router = useRouter();

  useEffect(() => {
    // Load cart + cities in parallel
    Promise.all([
      api.get('/cart'),
      api.get('/shipping/cities'),
    ]).then(([cartData, cityData]) => {
      setCart(cartData);
      setCities(cityData.cities || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleCekOngkir = async () => {
    if (!selectedCity) { setError('Pilih kota tujuan terlebih dahulu.'); return; }
    setCheckingOngkir(true);
    setError('');
    setShippingCosts([]);
    setSelectedService(null);
    try {
      const params = new URLSearchParams({
        destination: selectedCity.city_id,
        weight: String(DEFAULT_WEIGHT),
        courier: selectedCourier,
      });
      const data = await api.get(`/shipping/costs?${params}`);
      const costs = data.costs || [];
      setShippingCosts(costs);
      if (costs[0]?.costs?.[0]) {
        setSelectedService(costs[0].costs[0]);
      }
    } catch (err: any) {
      setError('Gagal cek ongkir. Coba lagi.');
    } finally {
      setCheckingOngkir(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) { setError('Alamat pengiriman wajib diisi.'); return; }
    if (!selectedService) { setError('Pilih layanan pengiriman terlebih dahulu.'); return; }

    setSubmitting(true);
    setError('');

    const payload = {
      shipping_address: address,
      courier: `${selectedCourier.toUpperCase()} ${selectedService.service}`,
      payment_method: paymentMethod,
      shipping_cost: selectedService.cost[0]?.value || 0,
      city_destination: selectedCity?.city_id || '',
    };

    try {
      if (paymentMethod === 'cod') {
        await api.post('/orders/checkout', payload);
        router.push('/orders?success=1');
      } else {
        // Midtrans: buat order dulu, lalu minta snap token
        const orderData = await api.post('/orders/checkout', payload);
        const snapData = await api.post('/payment/snap-token', { order_id: orderData.order?.id });

        if (!snapData.configured) {
          setError('Midtrans belum dikonfigurasi. Silakan gunakan COD atau hubungi admin.');
          setSubmitting(false);
          return;
        }

        // Load Midtrans snap.js
        if (!window.snap) {
          const script = document.createElement('script');
          script.src = snapData.is_production
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';
          script.setAttribute('data-client-key', snapData.client_key);
          document.head.appendChild(script);
          await new Promise(res => script.onload = res);
        }

        window.snap.pay(snapData.snap_token, {
          onSuccess: () => router.push('/orders?success=1&payment=midtrans'),
          onPending: () => router.push('/orders?pending=1'),
          onError: () => setError('Pembayaran gagal. Silakan coba lagi.'),
          onClose: () => { setError('Pembayaran dibatalkan.'); setSubmitting(false); },
        });
      }
    } catch (err: any) {
      setError(err.message || 'Checkout gagal. Coba lagi.');
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-secondary rounded-full animate-spin"></div>
    </div>
  );

  const items = cart?.items || [];
  if (items.length === 0) { router.push('/cart'); return null; }

  const subtotal = items.reduce((sum: number, item: any) =>
    sum + parseFloat(item.product?.selling_price || 0) * item.quantity, 0);
  const shippingCost = selectedService?.cost?.[0]?.value || 0;
  const total = subtotal + shippingCost;

  const filteredCities = cities.filter(c =>
    c.city_name.toLowerCase().includes(citySearch.toLowerCase())
  ).slice(0, 8);

  return (
    <div className="pt-32 pb-20 min-h-screen bg-accent">
      <div className="container">
        <div className="mb-10">
          <a href="/cart" className="text-secondary text-xs uppercase tracking-widest font-bold inline-flex items-center gap-2">
            ← Back to Cart
          </a>
          <h1 className="text-5xl font-bold text-primary mt-4">Checkout</h1>
          <div className="h-1 w-16 bg-secondary mt-3"></div>
        </div>

        <form onSubmit={handleCheckout}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">

              {/* 1. Shipping Address */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="font-bold text-primary text-xl mb-6">1. Alamat Pengiriman</h2>
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos"
                  rows={3}
                  required
                  className="w-full bg-accent/50 border border-gray-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all placeholder:text-gray-400 resize-none"
                />
              </div>

              {/* 2. Shipping Courier (RajaOngkir) */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="font-bold text-primary text-xl mb-6">2. Pilih Pengiriman</h2>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  {/* Kota Tujuan */}
                  <div className="relative col-span-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted mb-2 block">Kota Tujuan</label>
                    <input
                      type="text"
                      placeholder="Cari kota..."
                      value={citySearch || selectedCity?.city_name || ''}
                      onChange={e => { setCitySearch(e.target.value); setSelectedCity(null); }}
                      className="w-full bg-accent/50 border border-gray-100 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
                    />
                    {citySearch && !selectedCity && filteredCities.length > 0 && (
                      <div className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                        {filteredCities.map(c => (
                          <button key={c.city_id} type="button" onClick={() => { setSelectedCity(c); setCitySearch(''); }}
                            className="w-full text-left px-4 py-3 hover:bg-accent text-sm border-b border-gray-50 last:border-0">
                            <span className="font-medium text-primary">{c.city_name}</span>
                            <span className="text-text-muted ml-2 text-xs">{c.province}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Kurir */}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted mb-2 block">Kurir</label>
                    <select
                      value={selectedCourier}
                      onChange={e => setSelectedCourier(e.target.value)}
                      className="w-full bg-accent/50 border border-gray-100 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
                    >
                      <option value="jne">JNE</option>
                      <option value="tiki">TIKI</option>
                      <option value="pos">POS Indonesia</option>
                      <option value="sicepat">SiCepat</option>
                      <option value="jnt">J&T Express</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCekOngkir}
                  disabled={checkingOngkir || !selectedCity}
                  className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-secondary transition-all disabled:opacity-50 w-full mb-5"
                >
                  {checkingOngkir ? '⏳ Mengecek ongkir...' : '🔍 Cek Ongkos Kirim'}
                </button>

                {/* Shipping Services */}
                {shippingCosts.length > 0 && (
                  <div className="space-y-2">
                    {shippingCosts.map((courier: any) =>
                      courier.costs?.map((svc: any) => (
                        <label
                          key={`${courier.code}-${svc.service}`}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedService?.service === svc.service && selectedService?.cost?.[0]?.value === svc.cost?.[0]?.value
                              ? 'border-secondary bg-secondary/5'
                              : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="service"
                            checked={selectedService?.service === svc.service && selectedService?.cost?.[0]?.value === svc.cost?.[0]?.value}
                            onChange={() => setSelectedService(svc)}
                            className="accent-secondary"
                          />
                          <div className="flex-1">
                            <p className="font-bold text-primary text-sm">{courier.code} {svc.service}</p>
                            <p className="text-xs text-text-muted">{svc.description} · {svc.cost?.[0]?.etd}</p>
                          </div>
                          <span className="font-bold text-primary">
                            Rp {(svc.cost?.[0]?.value || 0).toLocaleString('id-ID')}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* 3. Payment Method */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="font-bold text-primary text-xl mb-6">3. Metode Pembayaran</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'cod',      icon: '💵', label: 'COD',       desc: 'Bayar saat barang tiba' },
                    { id: 'midtrans', icon: '💳', label: 'Midtrans',  desc: 'Transfer / E-Wallet / Kartu' },
                  ].map(pm => (
                    <label
                      key={pm.id}
                      className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === pm.id
                          ? 'border-secondary bg-secondary/5'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={pm.id}
                        checked={paymentMethod === pm.id}
                        onChange={() => setPaymentMethod(pm.id as 'cod' | 'midtrans')}
                        className="accent-secondary"
                      />
                      <div>
                        <p className="font-bold text-primary text-sm">{pm.icon} {pm.label}</p>
                        <p className="text-xs text-text-muted mt-0.5">{pm.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {paymentMethod === 'midtrans' && (
                  <div className="mt-4 bg-purple-50 border border-purple-100 rounded-2xl p-4 text-sm text-purple-700">
                    💡 Anda akan diarahkan ke halaman pembayaran Midtrans setelah konfirmasi.
                  </div>
                )}
                {paymentMethod === 'cod' && (
                  <div className="mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700">
                    💡 Siapkan uang tunai saat kurir tiba. Kasir akan mengkonfirmasi pembayaran.
                  </div>
                )}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div>
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-28">
                <h2 className="text-xl font-bold text-primary mb-6">Ringkasan</h2>

                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
                  {items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-text-muted truncate pr-2">{item.product?.name} ×{item.quantity}</span>
                      <span className="font-medium text-primary flex-shrink-0">
                        Rp {(parseFloat(item.product?.selling_price || 0) * item.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Subtotal</span>
                    <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Ongkir {selectedService ? `(${selectedCourier.toUpperCase()} ${selectedService.service})` : ''}</span>
                    <span className="font-medium">Rp {shippingCost.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Pembayaran</span>
                    <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${
                      paymentMethod === 'cod' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {paymentMethod === 'cod' ? '💵 COD' : '💳 Midtrans'}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
                    <span className="text-primary">Total</span>
                    <span className="text-primary">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-4 text-sm border border-red-100">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !selectedService}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-secondary transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : paymentMethod === 'midtrans' ? 'Bayar Sekarang →' : 'Konfirmasi Pesanan →'}
                </button>
                {!selectedService && (
                  <p className="text-xs text-text-muted text-center mt-3">Cek ongkir terlebih dahulu untuk melanjutkan</p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard requireRole="customer">
      <CheckoutContent />
    </AuthGuard>
  );
}
