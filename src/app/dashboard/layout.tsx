'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Receipt, Users, LogOut, Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Checking authentication...</p>
      </div>
    );
  }

  const navLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', href: '/dashboard/records', icon: Receipt },
  ];

  if (user.role === 'admin') {
    navLinks.push({ name: 'Users', href: '/dashboard/users', icon: Users });
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      <aside className="w-full lg:w-64 bg-indigo-900 text-white flex flex-col shadow-xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-tight">Finance App</h2>
          <div className="mt-4 px-3 py-2 bg-indigo-800/50 rounded-lg backdrop-blur-sm border border-indigo-700">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-indigo-300 capitalize">{user.role}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-white/10 text-white font-medium pl-6 shadow-sm border border-white/5' 
                    : 'text-indigo-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'opacity-80'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-indigo-800 mt-auto">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-left text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
