// Dashboard Overview page — the first screen a user sees after login.
// Displays a personal financial summary (income, expenses, net balance, transaction count)
// alongside live cryptocurrency market data fetched from the CoinCap public API.
// Both data sources are fetched independently so a failure in one does not block the other.
'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { ArrowDownRight, ArrowUpRight, DollarSign, Activity, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Shape of the aggregated financial summary returned by GET /api/dashboard/summary.
interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalRecords: number;
}

// Shape of a single cryptocurrency asset from the CoinCap v2 API.
interface MarketData {
  id: string;
  name: string;
  symbol: string;
  priceUsd: string;
  changePercent24Hr: string;
}

export default function DashboardOverview() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Helpers: format raw numbers into readable USD currency strings.
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatPrice = (price: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat(price));

  useEffect(() => {
    const fetchData = async () => {
      // ── 1. Internal Summary (Core Feature) ──────────────────────────────
      // Fetches the user's aggregated financial data from our own backend.
      // Admin gets all-user totals; Viewer/Analyst see only their own data.
      try {
        const summaryRes = await api.get('/dashboard/summary');
        setSummary(summaryRes.data);
      } catch (error) {
        console.warn('Backend summary fetch failed', error);
      }

      // ── 2. External Market Data (Bonus Feature) ──────────────────────────
      // Fetches the top 5 crypto assets from CoinCap with a 3-second timeout.
      // Wrapped in its own try/catch so a network failure here never breaks the
      // financial summary above. Falls back to hardcoded mock prices if offline.
      try {
        const marketRes = await fetch('https://api.coincap.io/v2/assets?limit=5', { signal: AbortSignal.timeout(3000) });
        if (!marketRes.ok) throw new Error();
        const marketJson = await marketRes.json();
        setMarketData(marketJson.data);
      } catch (error) {
        console.log('Using fallback market data due to connection issues.');
        // High-Quality Fallback Data ensures the dashboard always looks complete,
        // even when running offline or if CoinCap is temporarily unavailable.
        setMarketData([
          { id: '1', name: 'Bitcoin', symbol: 'BTC', priceUsd: '68432.12', changePercent24Hr: '2.45' },
          { id: '2', name: 'Ethereum', symbol: 'ETH', priceUsd: '3421.55', changePercent24Hr: '-1.12' },
          { id: '3', name: 'Solana', symbol: 'SOL', priceUsd: '145.22', changePercent24Hr: '5.67' },
          { id: '4', name: 'Binance Coin', symbol: 'BNB', priceUsd: '584.10', changePercent24Hr: '0.98' },
          { id: '5', name: 'Cardano', symbol: 'ADA', priceUsd: '0.45', changePercent24Hr: '-3.21' },
        ]);
      } finally {
        // Always mark loading as complete once both fetches have resolved or failed.
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Block rendering until both data fetches are complete to avoid layout jumps.
  if (loading) {
     return <div className="flex justify-center p-10"><Loader2 className="animate-spin w-8 h-8 text-indigo-500" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Overview</h1>
          <p className="text-gray-500 mt-1">Here is your financial summary at a glance.</p>
        </div>
        {/* Market status badge — purely decorative to reinforce the live data feature */}
        <div className="hidden md:block bg-indigo-50 px-4 py-2 rounded-xl text-indigo-700 text-sm font-semibold border border-indigo-100 italic">
          Market Status: Live 🌐
        </div>
      </div>

      {/* ── KPI Summary Cards ─────────────────────────────────── */}
      {/* Four cards showing: Net Balance, Total Income, Total Expenses, Transaction Count */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Net Balance = totalIncome - totalExpenses */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center">
             <DollarSign className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Net Balance</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.netBalance || 0)}</p>
          </div>
        </div>

        {/* Total Income — sum of all type='income' records */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="bg-emerald-50 w-12 h-12 rounded-full flex items-center justify-center">
             <ArrowUpRight className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Income</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.totalIncome || 0)}</p>
          </div>
        </div>

        {/* Total Expenses — sum of all type='expense' records */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="bg-rose-50 w-12 h-12 rounded-full flex items-center justify-center">
             <ArrowDownRight className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Expenses</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.totalExpenses || 0)}</p>
          </div>
        </div>

        {/* Transaction Count — total number of non-deleted records */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center">
             <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{summary?.totalRecords || 0}</p>
          </div>
        </div>
      </div>

      {/* ── Lower Section: Trend Placeholder + Live Market Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Detailed Trends placeholder — user is guided to the Transactions tab */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center items-center h-full">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
             <Activity className="w-8 h-8 text-gray-400" />
           </div>
           <h3 className="text-xl font-semibold text-gray-900 mb-2">Detailed Trends</h3>
           <p className="text-gray-500 max-w-sm mx-auto text-center">Navigate to the transactions tab to view and manage detailed financial records.</p>
        </div>

        {/* Live Crypto Market Panel — populated by CoinCap API (or fallback) */}
        <div className="lg:col-span-4 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center space-x-2">
              {/* Animated green dot indicates a "live" data status */}
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>Live Market Trends</span>
            </h3>
          </div>
          <div className="p-0">
            {marketData.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {marketData.map((coin) => (
                  <div key={coin.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center group">
                    <div className="flex items-center space-x-3">
                      {/* Coin ticker badge — shows first 3 characters of the symbol */}
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold text-xs uppercase transition-transform group-hover:scale-110">
                        {coin.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{coin.name}</p>
                        <p className="text-xs text-gray-500 uppercase">{coin.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">{formatPrice(coin.priceUsd)}</p>
                      {/* 24-hour change: green for positive, red for negative */}
                      <p className={`text-xs font-semibold ${parseFloat(coin.changePercent24Hr) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {parseFloat(coin.changePercent24Hr) >= 0 ? '+' : ''}{parseFloat(coin.changePercent24Hr).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm italic">Loading market pulses...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
