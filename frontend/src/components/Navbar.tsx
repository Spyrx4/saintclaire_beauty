"use client";

import { useEffect, useState } from 'react';
import { getUser, isLoggedIn, isAdmin, logout, UserData } from '@/lib/auth';
import { api } from '@/lib/api';

export default function Navbar() {
  const [user, setUser] = useState<UserData | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isLoggedIn()) {
      const u = getUser();
      setUser(u);
      if (u?.role === 'customer') {
        api.get('/cart').then(data => {
          const count = data?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
          setCartCount(count);
        }).catch(() => {});
      }
    }
  }, []);

  if (!mounted) {
    return (
      <nav className="glass fixed w-full z-50 py-5 transition-all duration-300">
        <div className="container flex justify-between items-center">
          <a href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Saint Claire Beauty Logo" className="h-10 w-auto rounded-lg" />
            <span className="text-xl font-bold tracking-tighter text-primary hidden sm:block">SAINT CLAIRE</span>
          </a>
        </div>
      </nav>
    );
  }

  const roleLabel = user?.role === 'admin' ? 'Admin' : null;

  const roleBadgeClass = 'text-[9px] text-secondary tracking-[0.3em] mt-1';

  return (
    <nav className="glass fixed w-full z-50 py-5 transition-all duration-300">
      <div className="container flex justify-between items-center">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="Saint Claire Beauty Logo" className="h-10 w-auto rounded-lg" />
          <span className="text-xl font-bold tracking-tighter text-primary hidden sm:block">SAINT CLAIRE</span>
        </a>

        <div className="flex gap-6 items-center font-medium uppercase text-sm tracking-widest">
          <a href="/" className="hover:text-secondary transition-colors">Products</a>

          {/* Admin dashboard & order management */}
          {isAdmin() && (
            <div className="relative group">
              <span className="hover:text-secondary transition-colors cursor-pointer flex items-center gap-1">
                Admin Panel
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
              <div className="absolute top-full left-0 mt-4 w-48 bg-white border border-stone-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col overflow-hidden text-primary">
                <a href="/admin/dashboard" className="px-4 py-3 hover:bg-stone-50 hover:text-secondary transition-colors text-xs font-bold border-b border-stone-50">Dashboard Reports</a>
                <a href="/admin/orders" className="px-4 py-3 hover:bg-stone-50 hover:text-secondary transition-colors text-xs font-bold border-b border-stone-50">Manage Orders</a>
                <a href="/admin/products" className="px-4 py-3 hover:bg-stone-50 hover:text-secondary transition-colors text-xs font-bold border-b border-stone-50">Products</a>
                <a href="/admin/categories" className="px-4 py-3 hover:bg-stone-50 hover:text-secondary transition-colors text-xs font-bold border-b border-stone-50">Categories</a>
                <a href="/admin/ingredients" className="px-4 py-3 hover:bg-stone-50 hover:text-secondary transition-colors text-xs font-bold">Ingredients</a>
              </div>
            </div>
          )}

          {/* Customer links */}
          {user?.role === 'customer' && (
            <>
              <a href="/orders" className="hover:text-secondary transition-colors">Orders</a>
              <a href="/cart" className="relative hover:text-secondary transition-colors">
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2.5 -right-4 bg-secondary text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </a>
            </>
          )}

          <div className="h-4 w-px bg-gray-300"></div>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-bold text-primary leading-none">{user.name}</p>
                {roleLabel && (
                  <p className={roleBadgeClass}>{roleLabel}</p>
                )}
              </div>
              <button
                onClick={() => logout()}
                className="bg-red-500/10 text-red-500 px-4 py-2 rounded-full hover:bg-red-500 hover:text-white transition-all text-xs"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-3 items-center">
              <a href="/register" className="text-primary hover:text-secondary transition-colors text-sm">Register</a>
              <a href="/login" className="bg-primary text-white px-5 py-2 rounded-full hover:bg-secondary transition-all text-sm">
                Login
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
