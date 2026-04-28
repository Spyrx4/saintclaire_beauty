"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { isLoggedIn } from '@/lib/auth';
import AuthGuard from '@/components/AuthGuard';

function CartContent() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    try {
      const data = await api.get('/cart');
      setCart(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateQty = async (itemId: number, qty: number) => {
    if (qty < 1) return;
    setUpdating(itemId);
    try {
      await api.put(`/cart/items/${itemId}`, { quantity: qty });
      await fetchCart();
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: number) => {
    setUpdating(itemId);
    try {
      await api.delete(`/cart/items/${itemId}`);
      await fetchCart();
    } finally {
      setUpdating(null);
    }
  };

  const total = cart?.items?.reduce((sum: number, item: any) =>
    sum + (parseFloat(item.product?.selling_price) * item.quantity), 0) || 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-secondary rounded-full animate-spin"></div>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="pt-32 pb-20 min-h-screen bg-accent">
      <div className="container">
        <div className="mb-10">
          <a href="/" className="text-secondary text-xs uppercase tracking-widest font-bold hover:translate-x-1 transition-transform inline-flex items-center gap-2">
            ← Continue Shopping
          </a>
          <h1 className="text-5xl font-bold text-primary mt-4">Your Cart</h1>
          <div className="h-1 w-16 bg-secondary mt-3"></div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-6xl mb-6">🛒</p>
            <h2 className="text-2xl font-bold text-primary mb-3">Your cart is empty</h2>
            <p className="text-text-muted mb-8">Discover our curated skincare collection</p>
            <a href="/" className="bg-primary text-white px-10 py-4 rounded-full font-bold hover:bg-secondary transition-all">
              Shop Now
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item: any) => (
                <div key={item.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex gap-6 items-center">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-accent flex-shrink-0">
                    <img src="/product.png" alt={item.product?.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-secondary font-bold mb-1">
                      {item.product?.category?.name || 'Skincare'}
                    </p>
                    <h3 className="font-bold text-primary text-lg leading-tight truncate">{item.product?.name}</h3>
                    <p className="text-text-muted text-sm mt-1">pH {item.product?.ph_level || '-'} · {item.product?.texture || '-'}</p>
                    <p className="font-bold text-primary mt-2">
                      Rp {parseFloat(item.product?.selling_price || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-4">
                    <div className="flex items-center gap-3 bg-accent rounded-full px-2 py-1">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        disabled={updating === item.id}
                        className="w-8 h-8 rounded-full bg-white shadow text-primary font-bold hover:bg-primary hover:text-white transition-all text-lg leading-none"
                      >−</button>
                      <span className="w-8 text-center font-bold text-primary">
                        {updating === item.id ? '...' : item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        disabled={updating === item.id}
                        className="w-8 h-8 rounded-full bg-white shadow text-primary font-bold hover:bg-primary hover:text-white transition-all text-lg leading-none"
                      >+</button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={updating === item.id}
                      className="text-red-400 hover:text-red-600 text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-28">
                <h2 className="text-xl font-bold text-primary mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  {items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-text-muted truncate pr-4">{item.product?.name} ×{item.quantity}</span>
                      <span className="font-medium text-primary flex-shrink-0">
                        Rp {(parseFloat(item.product?.selling_price || 0) * item.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-primary">Total</span>
                    <span className="text-primary">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">Belum termasuk ongkos kirim</p>
                </div>
                <a
                  href="/checkout"
                  className="block w-full bg-primary text-white text-center py-4 rounded-2xl font-bold hover:bg-secondary transition-all shadow-lg hover:shadow-secondary/20"
                >
                  Proceed to Checkout →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <AuthGuard requireRole="customer">
      <CartContent />
    </AuthGuard>
  );
}
