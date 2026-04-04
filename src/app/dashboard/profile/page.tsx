'use client';

import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account settings.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl">
        <div className="p-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <User className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <div className="flex items-center space-x-2 mt-1 text-gray-500">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center space-x-2 mt-1 text-indigo-600 font-medium capitalize">
                <ShieldCheck className="w-4 h-4" />
                <span>{user.role} role</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-100 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className="font-medium text-emerald-600">Active</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Internal ID</p>
                <p className="font-medium text-gray-900">#000{user.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
