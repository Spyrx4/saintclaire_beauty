"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, getBaseApiUrl } from '@/lib/api';
import { getUser } from '@/lib/auth';
import AuthGuard from '@/components/AuthGuard';

function DashboardContent() {
  const [activeReport, setActiveReport] = useState("Monthly Sales");
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_sales: 0, total_orders: 0, customers_count: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = getUser();
  const router = useRouter();

  const reports = [
    { name: "Monthly Sales", endpoint: "/reports/monthly-sales", icon: "💰" },
    { name: "Inventory", endpoint: "/reports/inventory", icon: "📦" },
    { name: "Best Sellers", endpoint: "/reports/best-sellers", icon: "🔥" },
    { name: "Exclusive Customers", endpoint: "/reports/exclusive-customers", icon: "💎" },
    { name: "Critical Stock", endpoint: "/reports/critical-stock", icon: "⚠️" },
    { name: "Cancelled Transactions", endpoint: "/reports/cancelled-transactions", icon: "❌" },
    { name: "Profit & Loss", endpoint: "/reports/profit-loss", icon: "📊" },
    { name: "Audit Trail", endpoint: "/reports/audit-trail", icon: "📝" },
    { name: "Ingredient Analysis", endpoint: "/reports/ingredient-analysis", icon: "🧪" },
  ];

  useEffect(() => {
    setSearchTerm("");
    fetchReportData();
    // Only fetch stats once or periodically
    if (data.length === 0) fetchStats();
  }, [activeReport]);

  const fetchStats = async () => {
    try {
      // Basic heuristic: sum totals from monthly sales or similar
      const salesResult = await api.get('/reports/monthly-sales');
      const sales = Array.isArray(salesResult) ? salesResult : salesResult.data || [];
      const totalSales = sales.reduce((acc: number, curr: any) => acc + (parseFloat(curr.total_amount) || 0), 0);
      
      const custResult = await api.get('/reports/exclusive-customers');
      const customers = Array.isArray(custResult) ? custResult : custResult.data || [];

      setStats({
        total_sales: totalSales,
        total_orders: sales.length,
        customers_count: customers.length
      });
    } catch (e) {}
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const endpoint = reports.find(r => r.name === activeReport)?.endpoint || '';
      const result = await api.get(endpoint);
      // Handle different response shapes
      if (Array.isArray(result)) {
        setData(result);
      } else if (result.data && Array.isArray(result.data)) {
        setData(result.data);
      } else if (result.ingredients) {
        // Ingredient Analysis returns { ingredients: [], search_trends: [] }
        setData(result.ingredients);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleExportPdf = async () => {
    try {
      setExportLoading(true);
      const endpoint = reports.find(r => r.name === activeReport)?.endpoint || '';
      const type = endpoint.replace('/reports/', '');

      const token = localStorage.getItem('auth_token');
      const API_URL = getBaseApiUrl();
      
      const response = await fetch(`${API_URL}/reports/export-pdf?type=${type}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Error exporting PDF');
    } finally {
      setExportLoading(false);
    }
  };

  const formatColumnName = (key: string) => {
    return key.replace(/_/g, ' ');
  };

  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    return Object.values(row).some((val) => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        // Handle undefined or null
        if (aVal == null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bVal == null) return sortConfig.direction === 'asc' ? -1 : 1;
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  return (
    <div className="flex min-h-screen bg-[#FDFBF9]">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-72 bg-white border-r border-stone-100 flex flex-col fixed inset-y-0 shadow-sm z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-8 border-b border-stone-50">
          <img src="/logo.png" alt="Saint Claire" className="h-10 w-auto mb-2" />
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/40">Management Suite</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-6 space-y-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/30 mb-4 px-4">Executive Reports</p>
            <ul className="space-y-1">
              {reports.map((report) => (
                <li key={report.name}>
                  <button 
                    onClick={() => { setActiveReport(report.name); setIsMobileMenuOpen(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm flex items-center gap-3 ${
                      activeReport === report.name 
                        ? "bg-primary text-white shadow-lg shadow-primary/20 font-bold" 
                        : "text-text-muted hover:bg-primary/5 hover:text-primary"
                    }`}
                  >
                    <span className="opacity-70">{report.icon}</span>
                    {report.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-8 border-t border-stone-50">
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded-xl text-red-400 hover:bg-red-50 transition-all text-sm font-bold flex items-center gap-3"
            >
              <span>🚪</span> Sign Out
            </button>
          </div>
        </nav>

        <div className="p-6 bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              {user?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-primary truncate">{user?.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-secondary font-black">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-0 lg:ml-72 p-6 lg:p-12 w-full overflow-hidden">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 lg:mb-12">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-primary hover:bg-primary/5 rounded-xl transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                <span className="text-[10px] uppercase tracking-[0.4em] font-black text-secondary">
                  {user?.role === 'owner' ? 'Owner Strategy Center' : 'Administrative Access'}
                </span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-black text-primary tracking-tight">{activeReport}</h2>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative group w-full sm:w-72">
              <input 
                type="text" 
                placeholder="Find in data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-4 bg-white border border-stone-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 w-full transition-all shadow-sm group-hover:shadow-md"
              />
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-colors">🔍</span>
            </div>
            <button 
              onClick={handleExportPdf}
              disabled={loading || exportLoading || data.length === 0}
              className="bg-primary text-white px-6 lg:px-8 py-4 rounded-2xl font-bold hover:bg-secondary transition-all shadow-xl hover:shadow-secondary/30 disabled:opacity-30 flex items-center justify-center gap-3 text-sm"
            >
              {exportLoading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : "📄"}
              <span>Export PDF</span>
            </button>
          </div>
        </header>

        {/* Executive Summary Cards - Only show on relevant reports or as global header */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          <div className="bg-white p-8 rounded-[32px] border border-stone-100 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/30 mb-2">Revenue Growth</p>
            <h3 className="text-3xl font-black text-primary">Rp {stats.total_sales.toLocaleString('id-ID')}</h3>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-50 w-fit px-3 py-1 rounded-full">
              <span>↑</span> 12.5% vs Last Month
            </div>
          </div>
          <div className="bg-white p-8 rounded-[32px] border border-stone-100 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/30 mb-2">Total Operations</p>
            <h3 className="text-3xl font-black text-primary">{stats.total_orders} <span className="text-sm font-medium text-text-muted">Orders</span></h3>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-500 bg-amber-50 w-fit px-3 py-1 rounded-full">
              <span>⚡</span> Active Processing
            </div>
          </div>
          <div className="bg-white p-8 rounded-[32px] border border-stone-100 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/30 mb-2">Customer Base</p>
            <h3 className="text-3xl font-black text-primary">{stats.customers_count} <span className="text-sm font-medium text-text-muted">Members</span></h3>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-secondary bg-secondary/10 w-fit px-3 py-1 rounded-full">
              <span>💎</span> Exclusive Tiers
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl lg:rounded-[40px] shadow-2xl shadow-primary/5 p-6 lg:p-12 border border-stone-50 min-h-[600px] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-20"></div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[500px] text-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-stone-50 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-stone-50 border-t-secondary rounded-full animate-spin-slow"></div>
                </div>
              </div>
              <p className="mt-8 text-primary font-bold tracking-widest uppercase text-xs">Synchronizing Intelligence...</p>
            </div>
          ) : filteredData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/40 border-b border-stone-50">
                    <th className="pb-8 px-4">#ID</th>
                    {Object.keys(sortedData[0]).filter(k => typeof sortedData[0][k] !== 'object').map(key => (
                      <th 
                        key={key} 
                        className="pb-8 px-4 cursor-pointer hover:text-primary transition-colors select-none group"
                        onClick={() => handleSort(key)}
                      >
                        <div className="flex items-center gap-2">
                          {formatColumnName(key)}
                          <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className={`text-[6px] ${sortConfig?.key === key && sortConfig.direction === 'asc' ? 'text-secondary' : 'text-stone-300'}`}>▲</span>
                            <span className={`text-[6px] ${sortConfig?.key === key && sortConfig.direction === 'desc' ? 'text-secondary' : 'text-stone-300'}`}>▼</span>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {sortedData.map((row, idx) => (
                    <tr key={idx} className="group border-b border-stone-50/50 hover:bg-stone-50/50 transition-all duration-300">
                      <td className="py-6 px-4 font-black text-primary/20 group-hover:text-primary transition-colors">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      {Object.keys(row).filter(k => typeof row[k] !== 'object').map(key => {
                        const val = row[key];
                        const isNumber = typeof val === 'number';
                        return (
                          <td key={key} className={`py-6 px-4 ${isNumber ? 'font-mono' : 'text-text-muted'} group-hover:text-primary transition-colors`}>
                            {key.includes('price') || key.includes('amount') ? (
                              <span className="font-bold text-primary">Rp {val?.toLocaleString('id-ID')}</span>
                            ) : val?.toString() || '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] text-center">
               <div className="text-6xl mb-6 grayscale opacity-20">📂</div>
               <p className="text-primary font-bold">{searchTerm ? "No results matched your criteria." : "No data discovered for this segment."}</p>
               <p className="text-text-muted text-xs mt-2">Adjust your filters or try a different report category.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Wrap with AuthGuard — only admin and owner can access
export default function AdminDashboard() {
  return (
    <AuthGuard requireRole="admin_or_owner">
      <DashboardContent />
    </AuthGuard>
  );
}
