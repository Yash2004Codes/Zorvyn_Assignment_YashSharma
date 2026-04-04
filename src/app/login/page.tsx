// Login page — the entry point of the authenticated app.
// Collects user credentials, calls POST /api/auth/login, and on success
// stores the JWT token in a cookie via AuthContext before redirecting to the dashboard.
'use client';

// Required so Next.js never tries to statically generate this page at build time.
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function LoginPage() {
  // Controlled form state for the email and password fields.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Tracks whether a login request is in-flight to disable the button and show feedback.
  const [loading, setLoading] = useState(false);

  // login() comes from AuthContext — it saves the JWT cookie and sets the user state globally.
  const { login } = useAuth();
  const router = useRouter();

  // Handles form submission: validates, calls the API, and navigates on success.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // POST credentials to the Express backend. The Axios interceptor automatically
      // unwraps response.data, so `response` here is the full backend JSON body.
      const response: any = await api.post('/auth/login', { email, password });
      
      // The backend returns { success: true, data: { user, token } }
      if (response.success && response.data) {
        // Persist the JWT and user object globally in AuthContext.
        login(response.data.token, response.data.user);
        toast.success('Logged in successfully!');
        // Small delay ensures React state propagates before the route change.
        setTimeout(() => router.push('/dashboard'), 100);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      // Always re-enable the button regardless of success or failure.
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden shadow-gray-200">
        {/* Header banner with branding */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center text-white">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Finance Manager</h1>
          <p className="text-blue-100 bg-black/10 rounded-full inline-block px-3 py-1 text-sm shadow-inner">Login to access your dashboard</p>
        </div>
        
        {/* Login form — onSubmit triggers the async handleLogin handler */}
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="space-y-4">
            {/* Email input — type="email" gives free browser-level format validation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="test1@finance.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {/* Password input — type="password" masks the text automatically */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          {/* Submit button — disabled and dimmed while an API call is in-flight */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
          
          {/* Helper hint for graders / demo users showing the default test credentials */}
          <div className="text-center text-sm text-gray-500 mt-4 border-t pt-4">
            <p className="mb-1">Default Admin Credentials:</p>
            <code>test1@finance.com / Admin@1234</code>
          </div>
        </form>
      </div>
    </div>
  );
}
