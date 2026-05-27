import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>Shadow Miracle Records</title>
        <meta name="description" content="Shadow Miracle Records — independent music label and content management." />
      </Head>
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#ffffff', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '32px 48px', borderBottom: '1px solid #222' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.05em' }}>
            Shadow Miracle Records
          </h1>
        </header>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '16px' }}>
            Shadow Miracle Records
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#aaa', maxWidth: '560px', lineHeight: '1.7', marginBottom: '40px' }}>
            An independent music label dedicated to developing and distributing original music across all major platforms.
          </p>
          <Link href="/login" style={{ padding: '12px 32px', backgroundColor: '#ffffff', color: '#000000', borderRadius: '4px', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>
            Artist Login
          </Link>
        </main>

        <footer style={{ padding: '24px 48px', borderTop: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ color: '#555', fontSize: '0.85rem' }}>
            &copy; {new Date().getFullYear()} Shadow Miracle Records. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: '24px', fontSize: '0.85rem' }}>
            <Link href="/privacy-policy" style={{ color: '#888', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" style={{ color: '#888', textDecoration: 'none' }}>
              Terms of Service
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}
