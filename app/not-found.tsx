'use client';

export default function NotFound() {
  return (
    <html>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
          <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>Page not found</p>
          <a href="/" style={{ color: '#0ea5e9', textDecoration: 'none', marginTop: '2rem', display: 'inline-block' }}>Go Home</a>
        </div>
      </body>
    </html>
  );
}

