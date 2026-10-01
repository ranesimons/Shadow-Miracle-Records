'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type SongResult = {
  position: number;
  song: string;
  artist: string;
  status: 'added' | 'not_found' | 'error';
  videoId?: string;
};

type PlaylistResult = {
  playlistId: string;
  playlistUrl: string;
  weekDate: string;
  total: number;
  added: number;
  skipped: number;
  results: SongResult[];
};

export default function Hot100PlaylistPage() {
  const [mounted, setMounted] = useState(false);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [charts, setCharts] = useState<string[]>([]);
  const [selectedChart, setSelectedChart] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlaylistResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setRefreshToken(localStorage.getItem('yt_refresh_token'));

    fetch('/api/chart-names')
      .then((r) => r.json())
      .then((data: { charts: string[] }) => {
        setCharts(data.charts ?? []);
        const hot = data.charts?.find((c) => c.toLowerCase().includes('hot')) ?? data.charts?.[0] ?? '';
        setSelectedChart(hot);
      })
      .catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!refreshToken) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/create-hot100-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken, chartName: selectedChart }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
      } else {
        setResult(data as PlaylistResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const inputStyle: React.CSSProperties = {
    background: '#18181b',
    color: '#e4e4e7',
    border: '1px solid #27272a',
    borderRadius: '7px',
    padding: '8px 12px',
    fontSize: '0.88rem',
    outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#e4e4e7', fontFamily: 'sans-serif' }}>

      {/* Nav */}
      <header style={{ borderBottom: '1px solid #1f1f23', padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
          <Image src="/smr.png" alt="Shadow Miracle Records" width={26} height={26} style={{ filter: 'invert(1)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#e4e4e7' }}>Shadow Miracle Records</span>
        </Link>
        <Link href="/" style={{ fontSize: '0.82rem', color: '#71717a', textDecoration: 'none' }}>← Back</Link>
      </header>

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Title */}
        <div style={{ marginBottom: '36px' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Billboard Playlist Creator
          </h1>
          <p style={{ color: '#71717a', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Pulls the most recent week from your Billboard chart data, searches YouTube for each song, and builds a playlist automatically.
          </p>
        </div>

        {/* YouTube auth status */}
        <div style={{ background: '#111113', border: '1px solid #1f1f23', borderRadius: '10px', padding: '20px 24px', marginBottom: '24px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: '#52525b', textTransform: 'uppercase', marginBottom: '10px' }}>YouTube Account</p>
          {refreshToken ? (
            <p style={{ color: '#4ade80', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
              Connected
            </p>
          ) : (
            <div>
              <p style={{ color: '#f87171', fontSize: '0.88rem', marginBottom: '12px' }}>Not connected. Please connect YouTube from the main dashboard first, then return here.</p>
              <Link
                href="/"
                style={{ display: 'inline-block', background: '#27272a', color: '#fff', padding: '8px 16px', borderRadius: '7px', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}
              >
                Go to Dashboard →
              </Link>
            </div>
          )}
        </div>

        {/* Chart selector + create button */}
        {refreshToken && (
          <div style={{ background: '#111113', border: '1px solid #1f1f23', borderRadius: '10px', padding: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#71717a', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Chart
              </label>
              <select
                value={selectedChart}
                onChange={(e) => setSelectedChart(e.target.value)}
                style={{ ...inputStyle, width: '100%' }}
                disabled={loading}
              >
                {charts.length === 0 && <option value="">Loading charts…</option>}
                {charts.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCreate}
              disabled={loading || !selectedChart}
              style={{
                background: loading ? '#27272a' : '#ff0000',
                color: loading ? '#71717a' : '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.01em',
              }}
            >
              {loading ? 'Creating playlist… (this takes ~30s)' : '▶ Create YouTube Playlist'}
            </button>

            {loading && (
              <p style={{ fontSize: '0.78rem', color: '#52525b', margin: 0 }}>
                Searching YouTube for each song and adding to the playlist. Please keep this tab open.
              </p>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: '#1c0a0a', border: '1px solid #7f1d1d', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px' }}>
            <p style={{ color: '#f87171', fontSize: '0.88rem', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Playlist link */}
            <div style={{ background: '#0a1a0a', border: '1px solid #166534', borderRadius: '10px', padding: '24px' }}>
              <p style={{ color: '#4ade80', fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>
                Playlist created!
              </p>
              <p style={{ color: '#52525b', fontSize: '0.82rem', marginBottom: '16px' }}>
                {selectedChart} · Week of {result.weekDate} · {result.added}/{result.total} songs added
              </p>
              <a
                href={result.playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-block', background: '#ff0000', color: '#fff', padding: '10px 20px', borderRadius: '7px', fontWeight: 700, textDecoration: 'none', fontSize: '0.88rem' }}
              >
                Open on YouTube ↗
              </a>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Total songs', value: result.total },
                { label: 'Added', value: result.added, color: '#4ade80' },
                { label: 'Not found', value: result.skipped, color: result.skipped > 0 ? '#fb923c' : '#4ade80' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: '#111113', border: '1px solid #1f1f23', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.6rem', fontWeight: 800, color: color ?? '#e4e4e7', margin: '0 0 4px' }}>{value}</p>
                  <p style={{ fontSize: '0.72rem', color: '#52525b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Songs that weren't found */}
            {result.skipped > 0 && (
              <div style={{ background: '#111113', border: '1px solid #1f1f23', borderRadius: '10px', padding: '20px 24px' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', color: '#52525b', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Not found on YouTube ({result.skipped})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {result.results
                    .filter((r) => r.status !== 'added')
                    .map((r) => (
                      <div key={r.position} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.82rem' }}>
                        <span style={{ color: '#3f3f46', width: '28px', textAlign: 'right', flexShrink: 0 }}>#{r.position}</span>
                        <span style={{ color: '#a1a1aa' }}>{r.song}</span>
                        <span style={{ color: '#52525b' }}>— {r.artist}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Full song list */}
            <details style={{ background: '#111113', border: '1px solid #1f1f23', borderRadius: '10px', padding: '20px 24px' }}>
              <summary style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', color: '#52525b', textTransform: 'uppercase', cursor: 'pointer' }}>
                Full song list ({result.total})
              </summary>
              <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {result.results.map((r) => (
                  <div key={r.position} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.82rem' }}>
                    <span style={{ color: '#3f3f46', width: '28px', textAlign: 'right', flexShrink: 0 }}>#{r.position}</span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: r.status === 'added' ? '#4ade80' : '#f87171' }} />
                    {r.videoId ? (
                      <a
                        href={`https://www.youtube.com/watch?v=${r.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#a1a1aa', textDecoration: 'none' }}
                      >
                        {r.song}
                      </a>
                    ) : (
                      <span style={{ color: '#52525b' }}>{r.song}</span>
                    )}
                    <span style={{ color: '#3f3f46' }}>— {r.artist}</span>
                  </div>
                ))}
              </div>
            </details>

          </div>
        )}

      </main>
    </div>
  );
}
