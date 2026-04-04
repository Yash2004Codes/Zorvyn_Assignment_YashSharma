'use client';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      fontFamily: 'sans-serif'
    }}>
      <h2 style={{ fontSize: '3rem', fontWeight: 'bold', margin: '0' }}>404</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Page Not Found</p>
      <a href="/" style={{
        padding: '12px 24px',
        backgroundColor: '#4f46e5',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: 'bold'
      }}>
        Return Home
      </a>
    </div>
  );
}
