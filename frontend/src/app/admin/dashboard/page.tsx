"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import AuthGuard from '@/components/AuthGuard';

function DashboardContent() {
  const [activeReport, setActiveReport] = useState("Monthly Sales");
  const [data, setData] = useState<any[]>([]);
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

  const formatColumnName = (key: string) => {
    return key.replace(/_/g, ' ');
  };

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
            <button className="bg-white border border-gray-200 px-6 py-2 rounded-lg font-medium hover:shadow-md transition-all text-sm">
              Export PDF
            </button>
          </div>
        </header>

        <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100 min-h-[600px] overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[500px] text-center text-gray-400 italic">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-secondary rounded-full animate-spin mb-6"></div>
              <p className="text-primary not-italic font-medium">Fetching Live Data...</p>
            </div>
          ) : data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-widest text-text-muted font-bold">
                    <th className="pb-6 px-4">#</th>
                    {Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object').map(key => (
                      <th key={key} className="pb-6 px-4">{formatColumnName(key)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {data.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
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
               <p>No data available for this report.</p>
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
