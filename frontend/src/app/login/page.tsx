"use client";

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { getRedirectAfterLogin } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.post('/login', { email, password });
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      const redirectUrl = getRedirectAfterLogin();
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent px-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>

      <div className="glass w-full max-w-[500px] p-16 rounded-[40px] shadow-2xl fade-in relative z-10 border border-white/20">
        <div className="text-center mb-12">
          <img src="/logo.png" alt="Saint Claire Logo" className="h-16 w-auto mx-auto rounded-lg mb-6 shadow-sm" />
          <h2 className="text-4xl font-bold text-primary mb-3">Welcome Back</h2>
          <p className="text-text-muted">Enter your credentials to access your routine</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-5 rounded-2xl mb-8 text-sm font-medium border border-red-100 flex items-center gap-3 animate-shake">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-3">
            <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-primary/60 ml-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/40 border border-gray-100 p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all placeholder:text-gray-300"
              placeholder="e.g. adin@saintclaire.com"
              required
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center ml-1">
              <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">Password</label>
              <a href="#" className="text-[10px] uppercase tracking-widest font-bold text-secondary">Forgot?</a>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/40 border border-gray-100 p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all placeholder:text-gray-300"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-5 rounded-2xl font-bold hover:bg-secondary transition-all shadow-xl hover:shadow-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </div>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-sm text-text-muted">
            New to Saint Claire? <a href="/register" className="text-secondary font-bold hover:underline underline-offset-4">Create an Account</a>
          </p>
        </div>
      </div>
    </div>
  );
}
