'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function YouTubeConnectClient() {
  const rawSearchParams = useSearchParams();
  const searchParams = rawSearchParams ?? new URLSearchParams();

  const codeParam = searchParams.get('code') ?? '';
  const errorParam = searchParams.get('error') ?? '';

  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(errorParam || null);
  const [loading, setLoading] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const handleConnect = () => {
    window.location.href = '/api/youtubeoauth';
  };

  useEffect(() => {
    if (codeParam && !loading && !attempted) {
      setAttempted(true);
      setLoading(true);

      fetch('/api/youtubeoauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeParam }),
      })
        .then(res => res.json())
        .then(json => {
          if ('refresh_token' in json && json.refresh_token) {
            setRefreshToken(json.refresh_token);
            setError(null);
          } else if ('error' in json) {
            setError(json.error);
          } else {
            setError('No refresh token returned: ' + JSON.stringify(json));
          }
        })
        .catch(err => {
          setError(err.message || 'Error retrieving refresh token');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [codeParam, loading, attempted]);

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Connect Your YouTube Account</h1>

      {!refreshToken && (
        <>
          <button onClick={handleConnect} disabled={loading}
                  style={{ padding: '0.8rem 1.6rem', fontSize: '1.2rem', cursor: loading ? 'not‑allowed' : 'pointer' }}>
            {loading ? 'Processing…' : 'Connect YouTube Account'}
          </button>

          <p style={{ marginTop: '1rem' }}>
            After authorising, you’ll be redirected back and we’ll fetch your refresh token.
          </p>
        </>
      )}

      {refreshToken && (
        <div style={{ marginTop: '2rem' }}>
          <h2>✅ Refresh Token Retrieved</h2>
          <textarea readOnly value={refreshToken}
                    style={{ width: '100%', height: '5rem', padding: '0.5rem' }} />
          <p>
            Copy this token and store it in your <code>.env</code> as <strong>YOUTUBE_REFRESH_TOKEN</strong>.
          </p>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '2rem', color: 'red' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
