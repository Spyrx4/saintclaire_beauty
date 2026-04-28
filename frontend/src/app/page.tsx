"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { isLoggedIn, getUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingCart, setAddingCart] = useState<number | null>(null);
  const [cartMsg, setCartMsg] = useState<{ id: number; msg: string; ok: boolean } | null>(null);
  const router = useRouter();

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const data = await api.get('/products');
      setProducts(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, product: any) => {
    e.preventDefault(); // don't navigate to detail
    if (!isLoggedIn()) { router.push('/login'); return; }
    const user = getUser();
    if (user?.role !== 'customer') {
      setCartMsg({ id: product.id, msg: 'Hanya customer yang dapat berbelanja.', ok: false });
      setTimeout(() => setCartMsg(null), 3000);
      return;
    }
    setAddingCart(product.id);
    try {
      await api.post('/cart/add', { product_id: product.id, quantity: 1 });
      setCartMsg({ id: product.id, msg: '✓ Ditambahkan ke keranjang!', ok: true });
    } catch (err: any) {
      setCartMsg({ id: product.id, msg: err.message || 'Gagal menambahkan.', ok: false });
    } finally {
      setAddingCart(null);
      setTimeout(() => setCartMsg(null), 3000);
    }
  };

  return (
    <div className="pt-32">
      {/* Hero Section */}
      <section className="container py-20 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 fade-in">
          <h2 className="text-6xl md:text-8xl font-bold leading-tight mb-8 text-primary">
            Technical <br />
            <span className="italic font-normal text-secondary">Transparency.</span>
          </h2>
          <p className="text-lg text-text-muted max-w-md mb-10 leading-relaxed">
            Reject conventional recommendation algorithms. We provide the data, you choose the results. Filter by pH Level, Active Ingredients, and Texture.
          </p>
          <div className="flex gap-4">
            <a href="#collection" className="bg-primary text-white px-10 py-4 rounded-full font-bold hover:scale-105 transition-all shadow-lg">
              Shop the Collection
            </a>
            <button className="border border-primary text-primary px-10 py-4 rounded-full font-bold hover:bg-primary hover:text-white transition-all">
              Ingredients Bible
            </button>
          </div>
        </div>
        <div className="flex-1 relative h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl fade-in" style={{animationDelay: '0.2s'}}>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent z-10"></div>
          <img src="/hero.png" alt="Saint Claire Banner" className="w-full h-full object-cover" />
          <div className="absolute bottom-12 left-12 z-20 text-white">
            <span className="uppercase tracking-widest text-xs font-bold mb-4 block">Summer 2026 Collection</span>
            <h3 className="text-5xl font-bold mb-4">Midnight Renewal</h3>
            <p className="text-lg opacity-90 max-w-sm">Experience the pinnacle of nighttime recovery with pure retinol and hydration.</p>
          </div>
        </div>
      </section>

      {/* Technical Filter Section */}
      <section className="bg-white py-24">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <span className="text-secondary font-bold uppercase tracking-widest text-sm mb-2 block">The Science</span>
              <h2 className="text-4xl font-bold text-primary">Technical Filter</h2>
            </div>
            <p className="text-text-muted max-w-sm mt-4 md:mt-0">
              Precise control over your routine. Find the perfect match for your skin's unique chemistry.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: 'pH Level',          value: '4.5 – 6.5',                     accent: true  },
              { title: 'Active Ingredients', value: 'Retinol, Vitamin C, Niacinamide', accent: false },
              { title: 'Texture',            value: 'Lightweight Gel, Rich Cream',    accent: false },
              { title: 'Benefit',            value: 'Anti-Aging, Brightening',        accent: false },
            ].map(f => (
              <div key={f.title} className={`glass p-8 rounded-2xl hover:shadow-xl transition-all border-b-4 group cursor-pointer ${f.accent ? 'border-secondary' : 'border-transparent hover:border-secondary'}`}>
                <h4 className="font-bold mb-4 uppercase tracking-widest text-xs group-hover:text-secondary transition-colors">{f.title}</h4>
                <p className="text-primary font-bold italic text-xl">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Collection */}
      <section id="collection" className="container py-24">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-primary mb-4">Curated Collection</h2>
          <div className="h-1 w-24 bg-secondary mx-auto"></div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-secondary rounded-full animate-spin"></div>
            <p className="text-text-muted italic">Synchronizing with Laboratory...</p>
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-text-muted py-24">No products available at this time.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {products.map((product) => (
              <div key={product.id} className="group fade-in">
                {/* Image — click to detail */}
                <a href={`/products/${product.id}`} className="block relative h-[450px] bg-white rounded-3xl overflow-hidden mb-8 transition-all group-hover:shadow-2xl border border-gray-100">
                  <img
                    src="/product.png"
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {product.stock <= product.threshold && (
                    <div className="absolute top-6 right-6 bg-amber-400 text-white px-4 py-1 rounded-full text-[10px] font-bold z-10 uppercase tracking-widest">
                      Low Stock
                    </div>
                  )}

                  {/* Add to Cart overlay */}
                  <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={addingCart === product.id || product.stock === 0}
                      className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-xl hover:bg-secondary transition-all disabled:opacity-70"
                    >
                      {addingCart === product.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Adding...
                        </div>
                      ) : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>

                  {/* Cart message bubble */}
                  {cartMsg?.id === product.id && (
                    <div className={`absolute top-4 left-4 right-4 text-xs font-bold px-4 py-3 rounded-xl z-20 transition-all ${
                      cartMsg.ok ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {cartMsg.msg}
                    </div>
                  )}
                </a>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-secondary font-bold">
                      {product.category?.name || 'Skincare'}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">
                      {product.ph_level ? `pH ${product.ph_level}` : ''}
                    </span>
                  </div>
                  <a href={`/products/${product.id}`}>
                    <h3 className="text-2xl font-bold text-primary group-hover:text-secondary transition-colors">
                      {product.name}
                    </h3>
                  </a>
                  <div className="flex justify-between items-end pt-2">
                    <p className="text-xl font-bold text-primary">Rp {parseFloat(product.selling_price).toLocaleString('id-ID')}</p>
                    <p className="text-xs text-text-muted italic">{product.texture}</p>
                  </div>
                  {/* Ingredients preview */}
                  {product.ingredients?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {product.ingredients.slice(0, 3).map((ing: any) => (
                        <span key={ing.id} className="text-[9px] uppercase tracking-wider bg-secondary/10 text-secondary px-2 py-1 rounded-full font-bold">
                          {ing.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
