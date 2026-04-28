// Auth helper functions for frontend

export interface UserData {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'kasir' | 'customer';
  tier?: string;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function getUser(): UserData | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserData;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!getToken() && !!getUser();
}

export function isAdmin(): boolean {
  return getUser()?.role === 'admin';
}

export function isOwner(): boolean {
  return getUser()?.role === 'owner';
}

export function isKasir(): boolean {
  return getUser()?.role === 'kasir';
}

export function isAdminOrOwner(): boolean {
  const role = getUser()?.role;
  return role === 'admin' || role === 'owner';
}

export function isStaff(): boolean {
  const role = getUser()?.role;
  return role === 'admin' || role === 'owner' || role === 'kasir';
}

/** Redirect ke halaman yang sesuai setelah login berdasarkan role */
export function getRedirectAfterLogin(): string {
  const role = getUser()?.role;
  if (role === 'kasir') return '/kasir/dashboard';
  if (role === 'admin' || role === 'owner') return '/admin/dashboard';
  return '/';
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}
