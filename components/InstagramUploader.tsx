import { useState } from 'react';

interface InstagramUploaderProps {
  blobUrl: string;
  igAccessToken: string;
  igUserId: string;
}

export default function InstagramUploader({ 
  blobUrl, 
  igAccessToken, 
  igUserId
}: InstagramUploaderProps) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle');
  const [error, setError] = useState('');

  const handleUpload = async () => {
    setStatus('uploading');
    setError('');
    
    // 1. Create the container
    // const createRes = await fetch('/api/create-instagram', { method: 'POST', /* ... */ });
    const createRes = await fetch('/api/create-instagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blobUrl: blobUrl,
          accessToken: igAccessToken,
          igUserId: igUserId,
          mediaType: 'REELS',
        }),
      });
    const { containerId } = await createRes.json();

    if (!containerId) {
      setError("Failed to start upload");
      return;
    }

    setStatus('processing');

    // 2. Start Polling
    const pollStatus = setInterval(async () => {
      try {
        const statusRes = await fetch(`/api/check-instagram?id=${containerId}&accessToken=${igAccessToken}`);
        const data = await statusRes.json();

        if (data.status_code === 'FINISHED') {
          clearInterval(pollStatus);

          console.log('containerId:', containerId);
          console.log('igUserId:', igUserId);
          console.log('igAccessToken:', igAccessToken);
          
          // 3. Final Step: Publish
          await fetch('/api/upload-instagram', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ creationId: containerId, igUserId, accessToken: igAccessToken }),
          });
          
          setStatus('done');
        } else if (data.status_code === 'ERROR') {
          clearInterval(pollStatus);
          setError("Meta failed to process the video.");
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 5000); // Check every 5 seconds
  };

  return (
    <div>
      <button onClick={handleUpload} disabled={status !== 'idle'}>
        {status === 'idle' ? 'Upload to Instagram' : `Status: ${status}...`}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}