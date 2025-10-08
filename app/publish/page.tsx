'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [scheduledTime, setScheduledTime] = useState<string>('');

const handleSubmit = async () => {
  if (!file) return;

  const formData = new FormData();
  formData.append('video', file);

  try {
    const uploadResp = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResp.ok) {
      throw new Error('File upload failed');
    }

    const { videoPath } = await uploadResp.json();

    const publishResp = await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platforms,
        caption,
        videoPath,
        scheduledTime: scheduledTime || undefined,
        youtubeTitle: caption,
        youtubeDesc: caption,
      }),
    });

    if (!publishResp.ok) {
      throw new Error('Publishing failed');
    }

    const data = await publishResp.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};

  return (
    <div>
      <h1>Publish Reel / Short</h1>
      <input type="file" accept="video/*" onChange={e => setFile(e.target.files?.[0] ?? null)} />
      <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption" />
      <div>
        <label>
          <input
            type="checkbox"
            checked={platforms.includes('instagram')}
            onChange={e => {
              const ps = [...platforms];
              if (e.target.checked) ps.push('instagram');
              else ps.splice(ps.indexOf('instagram'), 1);
              setPlatforms(ps);
            }}
          />
          Instagram
        </label>
        <label>
          <input
            type="checkbox"
            checked={platforms.includes('youtube')}
            onChange={e => {
              const ps = [...platforms];
              if (e.target.checked) ps.push('youtube');
              else ps.splice(ps.indexOf('youtube'), 1);
              setPlatforms(ps);
            }}
          />
          YouTube
        </label>
        {/* Add Facebook, TikTok, Twitter options */}
      </div>
      <div>
        <label>
          Schedule at:
          <input
            type="datetime-local"
            value={scheduledTime}
            onChange={e => setScheduledTime(e.target.value)}
          />
        </label>
      </div>
      <button onClick={handleSubmit}>Publish / Schedule</button>
    </div>
  );
}
