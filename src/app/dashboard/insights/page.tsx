// Insights page — available to Admin and Analyst roles only.
// Displays two analytical panels:
//   1. Category Usage — total spending grouped by category with transaction counts.
//   2. Monthly Trends — side-by-side income vs expense totals per calendar month.
// Viewers are blocked with an "Access Denied" message.
'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Loader2, PieChart, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Data shape returned by GET /api/dashboard/insights.
interface InsightData {
  categories: { category: string, total: number, count: number }[];
  trends: { month: string, income: number, expense: number }[];
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Helper to format raw numbers into USD currency strings.
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        // Fetch aggregated insights data from the backend.
        // The backend applies admin-level global scope or per-user scope automatically.
        const res = await api.get('/dashboard/insights');
        setData(res.data);
      } catch (error: any) {
        console.error('Error fetching insights:', error.message || error);
      } finally {
        setLoading(false);
      }
    };
    
    // Only trigger the API call for authorized roles.
    // Viewer role is denied both the fetch and the rendered UI below.
    if (user?.role === 'admin' || user?.role === 'analyst') {
      fetchInsights();
    } else {
      // Skip the fetch for viewers and immediately clear the loading spinner.
      setLoading(false);
    }
  }, [user]);

  // Show spinner while the API request is pending.
  if (loading) {
     return <div className="flex justify-center p-10"><Loader2 className="animate-spin w-8 h-8 text-indigo-500" /></div>;
  }

  // Role-based access gate — renders before the main content for unauthorized users.
  if (user?.role === 'viewer') {
    return <div className="text-center text-rose-500 p-10 font-medium">Access Denied. Insights require Analyst role.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Insights</h1>
        <p className="text-gray-500 mt-1">Deep dive into category-wise totals and monthly trends.</p>
      </div>

      {/* ── Two-Column Insight Panels ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Panel 1: Category Usage ──────────────────────────── */}
        {/* Shows spending grouped by category (e.g. Rent, Groceries, Salary). */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <PieChart className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-semibold text-gray-900">Category Usage</h2>
          </div>
          {data?.categories && data.categories.length > 0 ? (
            <div className="space-y-4">
              {data.categories.map((cat, i) => (
                // Each row: category name, count, and total amount.
                <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{cat.category}</p>
                    <p className="text-xs text-gray-500">{cat.count} transactions</p>
                  </div>
                  <span className="font-semibold text-gray-700">{formatCurrency(Number(cat.total))}</span>
                </div>
              ))}
            </div>
          ) : (
             <p className="text-gray-500 text-sm">No category data available yet.</p>
          )}
        </div>

        {/* ── Panel 2: Monthly Trends ──────────────────────────── */}
        {/* Shows income and expense totals broken down by calendar month. */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-semibold text-gray-900">Monthly Trends</h2>
          </div>
          {data?.trends && data.trends.length > 0 ? (
            <div className="space-y-4">
              {data.trends.map((trend, i) => (
                // Each row: month label with income (green) and expense (red) side by side.
                <div key={i} className="flex flex-col justify-between p-4 bg-gray-50 rounded-xl">
                  <p className="font-medium text-gray-900 mb-2">{trend.month}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 font-medium">Income: {formatCurrency(Number(trend.income))}</span>
                    <span className="text-rose-600 font-medium">Expense: {formatCurrency(Number(trend.expense))}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <p className="text-gray-500 text-sm">No trend data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
