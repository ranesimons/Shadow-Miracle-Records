'use client';

import { useEffect, useState } from 'react';

interface OAuthResponse {
  refresh_token?: string;
  access_token?: string;
  error?: string;
  [key: string]: unknown;   // for extra safety
}

const YouTubeConnectPage: React.FC = () => {
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const err = params.get('error');

    if (err) {
      setError(err);
      return;
    }

    if (code) {
      window.history.replaceState({}, '', window.location.pathname);
      fetch('/api/youtubeoauth', {
        method: 'POST',
        headers: { 'Content‑Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
        .then(res => res.json())
        .then((json: OAuthResponse) => {
          if (typeof json.refresh_token === 'string') {
            setRefreshToken(json.refresh_token);
          } else if (typeof json.error === 'string') {
            setError(json.error);
          } else {
            setError('Unexpected response: ' + JSON.stringify(json));
          }
        })
        .catch(err2 => {
          setError(err2 instanceof Error ? err2.message : 'Error during token exchange');
        });
    }
  }, []);

  const handleConnect = () => {
    window.location.href = '/api/youtubeoauth';
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Connect Your YouTube Account</h1>

      {!refreshToken && !error && (
        <button onClick={handleConnect}>
          Connect YouTube
        </button>
      )}

      {refreshToken && (
        <div>
          <h2>✅ Refresh Token Retrieved</h2>
          <textarea readOnly value={refreshToken} rows={4} cols={50} />
          <p>Save this token securely on your server.</p>
        </div>
      )}

      {error && (
        <div style={{ color: 'red' }}>
          <h2>Error:</h2>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default YouTubeConnectPage;
