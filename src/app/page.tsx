// Root entry page — immediately redirects visitors to /login.
// This page never renders visually for more than a brief flash; it's purely a navigation guard.
'use client';

// Force dynamic rendering so the redirect works correctly in server environments.
export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  // On mount, redirect the user to the login page.
  // router.replace (not push) so the "/" entry is NOT kept in browser history —
  // pressing "Back" from login won't bounce the user back here.
  useEffect(() => {
    router.replace('/login');
  }, [router]);

  // Renders a full-screen spinner while the redirect is in-flight.
  // Inline styles are used here intentionally — this component loads before
  // Tailwind fully hydrates, ensuring a flicker-free loading state.
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: 'sans-serif',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Spinning ring animation — CSS keyframes are scoped inline to avoid global pollution */}
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #e0e7ff',
        borderTop: '4px solid #4f46e5',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ color: '#6b7280', fontWeight: 500 }}>Redirecting to login...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
