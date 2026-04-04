'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<string>('Checking backend connectivity...');
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  useEffect(() => {
    fetch(`${apiBase}/health`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          setHealthStatus('✅ Backend is live and connected!');
        } else {
          setHealthStatus('⚠️ Backend returned non-OK status.');
        }
      })
      .catch((err) => {
        setHealthStatus('❌ Cannot reach backend yet.');
        console.error(err);
      });
  }, [apiBase]);


  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Finance Dashboard Setup Complete
        </h1>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
          <p className="text-blue-700 font-medium">{healthStatus}</p>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Backend Details</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>API running on <strong>Render.com</strong> (PostgreSQL)</li>
              <li>Database managed via <strong>Supabase</strong></li>
              <li>Default Admin Account: <strong>admin@finance.com</strong> (Pass: <strong>Admin@1234</strong>)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Quick Navigation</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/login')}
                className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
              >
                Go to Login
              </button>
            </div>
          </section>
        </div>

      </div>
    </main>
  );
}
