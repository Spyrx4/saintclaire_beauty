"use client";

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.post('/register', form);
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registrasi gagal. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent px-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>

      <div className="glass w-full max-w-[520px] p-14 rounded-[40px] shadow-2xl fade-in relative z-10 border border-white/20">
        <div className="text-center mb-10">
          <img src="/logo.png" alt="Saint Claire Logo" className="h-16 w-auto mx-auto rounded-lg mb-4 shadow-sm" />
          <h2 className="text-4xl font-bold text-primary mb-2">Create Account</h2>
          <p className="text-text-muted text-sm">Join the Saint Claire Beauty community</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-medium border border-red-100 flex items-center gap-3">
            <span className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0"></span>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          {[
            { label: 'Full Name', name: 'name', type: 'text', placeholder: 'e.g. Adin Pratama' },
            { label: 'Email Address', name: 'email', type: 'email', placeholder: 'e.g. adin@gmail.com' },
            { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••' },
            { label: 'Confirm Password', name: 'password_confirmation', type: 'password', placeholder: '••••••••' },
          ].map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-primary/60 ml-1">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={(form as any)[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required
                className="w-full bg-white/40 border border-gray-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all placeholder:text-gray-300"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-secondary transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] mt-2"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </div>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text-muted">
          Already have an account?{' '}
          <a href="/login" className="text-secondary font-bold hover:underline underline-offset-4">Sign In</a>
        </p>
      </div>
    </div>
  );
}
