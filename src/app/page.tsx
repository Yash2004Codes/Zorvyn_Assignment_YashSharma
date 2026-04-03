'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<string>('Checking backend...');

  useEffect(() => {
    fetch('http://localhost:4000/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setHealthStatus('✅ Backend is connected and running!');
        } else {
          setHealthStatus('❌ Backend failed to respond properly.');
        }
      })
      .catch((err) => {
        setHealthStatus('❌ Could not connect to backend. Is it running?');
        console.error(err);
      });
  }, []);

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
              <li>API running on <code>http://localhost:4000/api</code></li>
              <li>SQLite database stored in <code>data/finance.db</code></li>
              <li>Default Admin Account: <strong>admin@finance.com</strong> (Pass: <strong>Admin@1234</strong>)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Next Steps</h2>
            <div className="bg-gray-100 p-4 rounded-md text-sm text-gray-800">
              <p>You can run both the frontend and backend using:</p>
              <pre className="bg-gray-800 text-green-400 p-2 rounded mt-2">
                npm run dev
              </pre>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
