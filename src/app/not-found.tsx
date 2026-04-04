'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-10 text-center font-sans">
      <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100 max-w-lg">
        <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
           <HelpCircle className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">404 - Not Found</h2>
        <p className="text-gray-500 mb-8 font-medium leading-relaxed">
          The page you are looking for does not exist or has been moved to a new location.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:scale-95"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
