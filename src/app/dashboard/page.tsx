'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { ArrowDownRight, ArrowUpRight, DollarSign, Activity, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalRecords: number;
}

export default function DashboardOverview() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/dashboard/summary');
        setSummary(res.data);
      } catch (error) {
        console.error('Error fetching summary:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Viewers might not have access to dashboard summary strictly per role definition
    if (user?.role === 'admin' || user?.role === 'analyst') {
      fetchSummary();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
     return <div className="flex justify-center p-10"><Loader2 className="animate-spin w-8 h-8 text-indigo-500" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Overview</h1>
        <p className="text-gray-500 mt-1">Here is your financial summary at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center">
             <DollarSign className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Net Balance</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.netBalance || 0)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-emerald-50 w-12 h-12 rounded-full flex items-center justify-center">
             <ArrowUpRight className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Income</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.totalIncome || 0)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-rose-50 w-12 h-12 rounded-full flex items-center justify-center">
             <ArrowDownRight className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Expenses</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.totalExpenses || 0)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center">
             <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Recorded Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{summary?.totalRecords || 0}</p>
          </div>
        </div>
      </div>
      
      {/* Chart Placeholder / Recent could go here */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
         <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
           <Activity className="w-8 h-8 text-gray-400" />
         </div>
         <h3 className="text-lg font-medium text-gray-900 mb-2">Trends coming soon!</h3>
         <p className="text-gray-500 max-w-sm mx-auto">Navigate to the transactions tab to view detailed records.</p>
      </div>
    </div>
  );
}
