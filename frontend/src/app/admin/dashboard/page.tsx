"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import AuthGuard from '@/components/AuthGuard';

function DashboardContent() {
  const [activeReport, setActiveReport] = useState("Monthly Sales");
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = getUser();

  const reports = [
    { name: "Monthly Sales", endpoint: "/reports/monthly-sales" },
    { name: "Inventory", endpoint: "/reports/inventory" },
    { name: "Best Sellers", endpoint: "/reports/best-sellers" },
    { name: "Exclusive Customers", endpoint: "/reports/exclusive-customers" },
    { name: "Critical Stock", endpoint: "/reports/critical-stock" },
    { name: "Cancelled Transactions", endpoint: "/reports/cancelled-transactions" },
    { name: "Profit & Loss", endpoint: "/reports/profit-loss" },
    { name: "Audit Trail", endpoint: "/reports/audit-trail" },
    { name: "Ingredient Analysis", endpoint: "/reports/ingredient-analysis" },
  ];

  useEffect(() => {
    setSearchTerm("");
    fetchReportData();
  }, [activeReport]);

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

  const handleExportPdf = async () => {
    try {
      setExportLoading(true);
      const endpoint = reports.find(r => r.name === activeReport)?.endpoint || '';
      const type = endpoint.replace('/reports/', '');

      const token = localStorage.getItem('auth_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      
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
    <div className="flex min-h-screen bg-slate-50 pt-24">
      {/* Sidebar */}
      <aside className="w-80 glass border-r border-gray-200 p-8 flex flex-col gap-6 min-h-screen">
        <div>
          <a href="/" className="text-xs uppercase tracking-widest font-bold text-secondary flex items-center gap-2 hover:translate-x-1 transition-transform">
            ← Back to Home
          </a>
        </div>

        {/* User Info */}
        <div className="bg-primary/5 rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-text-muted font-bold mb-1">Logged in as</p>
          <p className="text-primary font-bold">{user?.name}</p>
          <span className="inline-block mt-2 text-[10px] uppercase tracking-widest bg-secondary/10 text-secondary px-3 py-1 rounded-full font-bold">
            {user?.role}
          </span>
        </div>

        <div>
          <h3 className="uppercase tracking-widest text-xs font-bold text-primary mb-4">Management Reports</h3>
          <ul className="space-y-1">
            {reports.map((report) => (
              <li key={report.name}>
                <button 
                  onClick={() => setActiveReport(report.name)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm ${
                    activeReport === report.name 
                      ? "bg-primary text-white shadow-lg" 
                      : "text-text-muted hover:bg-white hover:text-primary"
                  }`}
                >
                  {report.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <span className="text-secondary font-bold uppercase tracking-widest text-xs">
              {user?.role === 'owner' ? 'Owner Panel' : 'Admin Panel'}
            </span>
            <h2 className="text-4xl font-bold text-primary">{activeReport}</h2>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder={`Search in ${activeReport}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 w-64"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <button 
              onClick={handleExportPdf}
              disabled={loading || exportLoading || data.length === 0}
              className="bg-white border border-gray-200 px-6 py-2 rounded-lg font-medium hover:shadow-md transition-all text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {exportLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                  Exporting...
                </>
              ) : (
                <>📄 Export PDF</>
              )}
            </button>
          </div>
        </header>

        <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100 min-h-[600px] overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[500px] text-center text-gray-400 italic">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-secondary rounded-full animate-spin mb-6"></div>
              <p className="text-primary not-italic font-medium">Fetching Live Data...</p>
            </div>
          ) : filteredData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-widest text-text-muted font-bold">
                    <th className="pb-6 px-4">#</th>
                    {Object.keys(sortedData[0]).filter(k => typeof sortedData[0][k] !== 'object').map(key => (
                      <th 
                        key={key} 
                        className="pb-6 px-4 cursor-pointer hover:text-primary transition-colors select-none"
                        onClick={() => handleSort(key)}
                      >
                        <div className="flex items-center gap-2">
                          {formatColumnName(key)}
                          {sortConfig?.key === key ? (
                            <span className="text-[10px] text-secondary">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                          ) : (
                            <span className="text-[10px] text-gray-300 opacity-0 group-hover:opacity-100">▲</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {sortedData.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-primary/5 hover:scale-[1.01] transition-all cursor-default">
                      <td className="py-5 px-4 font-bold text-primary">{idx + 1}</td>
                      {Object.keys(row).filter(k => typeof row[k] !== 'object').map(key => (
                        <td key={key} className="py-5 px-4 text-text-muted">
                          {row[key]?.toString() || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] text-center text-gray-400 italic">
               <p>{searchTerm ? "No results found for your search." : "No data available for this report."}</p>
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
