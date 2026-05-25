"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, isAdmin, getUser } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'customer';
}

export default function AuthGuard({ children, requireRole }: AuthGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login');
      return;
    }

    const user = getUser();
    if (!user) {
      router.replace('/login');
      return;
    }

    let allowed = true;

    if (requireRole === 'admin' && user.role !== 'admin') allowed = false;
    if (requireRole === 'customer' && user.role !== 'customer') allowed = false;

    if (!allowed) {
      router.replace('/');
      return;
    }

    setAuthorized(true);
    setChecking(false);
  }, [router, requireRole]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-secondary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted text-sm uppercase tracking-widest">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}
