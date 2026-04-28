"use client";

import React, { use, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { isLoggedIn, getUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  code: string;
  name: string;
  description: string;
  ph_level: string;
  texture: string;
  selling_price: string;
  cost_price: string;
  stock: number;
  threshold: number;
  supplier: string;
  category: { name: string };
  ingredients: { id: number; name: string; description: string }[];
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(data => setProduct(data))
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    if (user?.role !== 'customer') {
      setCartMessage('Hanya customer yang dapat menambahkan produk ke keranjang.');
      return;
    }
    setAddingToCart(true);
    setCartMessage('');
    try {
      await api.post('/cart/add', { product_id: product?.id, quantity });
      setCartMessage('✓ Produk berhasil ditambahkan ke keranjang!');
    } catch (err: any) {
      setCartMessage(err.message || 'Gagal menambahkan ke keranjang.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-secondary rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return null;

  const isLowStock = product.stock <= product.threshold;

  return (
    <div className="pt-32 pb-20 min-h-screen bg-accent">
      <div className="container">
        {/* Breadcrumb */}
        <div className="mb-10 flex items-center gap-3 text-sm">
          <a href="/" className="text-secondary font-bold uppercase tracking-widest text-xs hover:underline">Home</a>
          <span className="text-gray-300">/</span>
          <span className="text-text-muted uppercase tracking-wider text-xs">{product.category?.name}</span>
          <span className="text-gray-300">/</span>
          <span className="text-primary font-medium text-xs uppercase tracking-wider truncate">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: Product Image */}
          <div>
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl aspect-square flex items-center justify-center relative">
              <img src="/product.png" alt={product.name} className="w-full h-full object-cover" />
              {isLowStock && (
                <div className="absolute top-6 right-6 bg-amber-400 text-white text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-full">
                  Low Stock
                </div>
              )}
            </div>
            {/* Technical Data Cards */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              {[
                { label: 'pH Level', value: product.ph_level ? `${product.ph_level}` : '—' },
                { label: 'Texture', value: product.texture || '—' },
                { label: 'Stock', value: `${product.stock} pcs` },
              ].map(d => (
                <div key={d.label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
                  <p className="text-[9px] uppercase tracking-widest text-text-muted font-bold mb-1">{d.label}</p>
                  <p className="font-bold text-primary text-sm">{d.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            <p className="text-secondary font-bold uppercase tracking-[0.4em] text-xs mb-3">
              {product.category?.name}
            </p>
            <h1 className="text-4xl font-bold text-primary leading-tight mb-2">{product.name}</h1>
            <p className="text-xs text-text-muted uppercase tracking-widest mb-6">SKU: {product.code}</p>

            <p className="text-text-muted leading-relaxed mb-8">
              {product.description || 'Produk skincare premium dari Saint Claire Beauty dengan formulasi teknis yang telah teruji.'}
            </p>

            <div className="text-4xl font-bold text-primary mb-8">
              Rp {parseFloat(product.selling_price).toLocaleString('id-ID')}
            </div>

            {/* Qty + Add to Cart */}
            {user?.role === 'customer' || !isLoggedIn() ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-white rounded-full px-3 py-2 shadow-sm border border-gray-100">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-9 h-9 rounded-full bg-accent text-primary font-bold hover:bg-primary hover:text-white transition-all text-xl leading-none"
                    >−</button>
                    <span className="w-10 text-center font-bold text-primary text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="w-9 h-9 rounded-full bg-accent text-primary font-bold hover:bg-primary hover:text-white transition-all text-xl leading-none"
                    >+</button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart || product.stock === 0}
                    className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold hover:bg-secondary transition-all shadow-lg hover:shadow-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingToCart ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Adding...</span>
                      </div>
                    ) : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>

                {cartMessage && (
                  <div className={`p-4 rounded-2xl text-sm font-medium ${
                    cartMessage.startsWith('✓')
                      ? 'bg-green-50 text-green-700 border border-green-100'
                      : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {cartMessage}
                    {cartMessage.startsWith('✓') && (
                      <a href="/cart" className="ml-3 underline font-bold">Lihat Keranjang →</a>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-accent/50 rounded-2xl p-4 text-sm text-text-muted text-center">
                Role <strong className="text-primary">{user?.role}</strong> tidak dapat berbelanja.
              </div>
            )}

            {/* Active Ingredients */}
            {product.ingredients?.length > 0 && (
              <div className="mt-10">
                <h3 className="font-bold text-primary uppercase tracking-widest text-xs mb-5">
                  Active Ingredients ({product.ingredients.length})
                </h3>
                <div className="space-y-3">
                  {product.ingredients.map(ing => (
                    <div key={ing.id} className="flex items-start gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0 mt-2"></div>
                      <div>
                        <p className="font-bold text-primary text-sm">{ing.name}</p>
                        {ing.description && (
                          <p className="text-text-muted text-xs mt-1 leading-relaxed">{ing.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supplier */}
            {product.supplier && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-text-muted uppercase tracking-widest">
                  Supplied by: <span className="text-primary font-bold">{product.supplier}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
