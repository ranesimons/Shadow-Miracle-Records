'use client';

import React, { useState } from 'react';

type PutBlobResult = { url: string };
type CreateMockupResponse = { taskKey: string; mockupUrls?: string[] };
type CreateMockupError = { error: string };

interface MockupStyle {
  id: number;
  placement: string;
  display_name: string;
  technique: string;
  // Add other fields as needed
}

interface Props {
  categories: any[];
}

export default function BetterBrowser({ categories }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  const [mockupStyles, setMockupStyles] = useState<MockupStyle[] | null>(null);
  const [loadingStyles, setLoadingStyles] = useState(false);
  const [stylesError, setStylesError] = useState<string | null>(null);

  const [mockupUrls, setMockupUrls] = useState<string[] | null>(null);
  const [creatingMockup, setCreatingMockup] = useState(false);
  const [mockupError, setMockupError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const resp = await fetch('/api/upload-image', {
        method: 'POST',
        body: form,
      });
      if (!resp.ok) throw new Error(`Upload failed: ${resp.status}`);
      const data = (await resp.json()) as PutBlobResult;
      setBlobUrl(data.url);
    } catch (err: any) {
      console.error('Upload error', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFetchMockupStyles = async () => {
    if (!selectedProductId) {
      alert('Please enter/select a product ID first.');
      return;
    }
    setLoadingStyles(true);
    setStylesError(null);
    setMockupStyles(null);
    try {
      const resp = await fetch(`/api/printful/mockup-styles?productId=${selectedProductId}`);
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Failed to fetch styles: ${resp.status} — ${text}`);
      }
      const body = await resp.json();
      // According to Printful docs, the response has a "data" array
      const styles = (body.data || []) as any[];
      const mapped: MockupStyle[] = styles.map((s) => ({
        id: s.id,
        placement: s.placement,
        display_name: s.display_name,
        technique: s.technique,
      }));
      setMockupStyles(mapped);
    } catch (err: any) {
      console.error('Error fetching styles', err);
      setStylesError(err.message || 'Failed to fetch mockup styles');
    } finally {
      setLoadingStyles(false);
    }
  };

  const handleCreateMockup = async () => {
    if (!blobUrl) {
      alert('No image uploaded');
      return;
    }
    if (!selectedProductId || !selectedVariantId) {
      alert('Please select product and variant');
      return;
    }
    if (!mockupStyles || mockupStyles.length === 0) {
      alert('No mockup style selected — please fetch and pick one first');
      return;
    }

    // For simplicity, just pick the first style — you may want to let user choose
    const style = mockupStyles[0];

    setCreatingMockup(true);
    setMockupError(null);
    setMockupUrls(null);

    try {
      const resp = await fetch('/api/printful/create-mockup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          variantIds: [selectedVariantId],
          imageUrl: blobUrl,
          mockupStyleId: style.id,    // ** include style ID/further fields as needed **
          placement: style.placement,  // ensure placement matches style
        }),
      });
      const body = (await resp.json()) as CreateMockupResponse | CreateMockupError;
      if (!resp.ok) {
        throw new Error((body as any).error || `Status ${resp.status}`);
      }
      const data = body as CreateMockupResponse;
      if (data.mockupUrls && data.mockupUrls.length > 0) {
        setMockupUrls(data.mockupUrls);
      } else {
        setMockupError(`No mockup URLs returned. Task key: ${data.taskKey}`);
      }
    } catch (err: any) {
      console.error('Mockup generation error', err);
      setMockupError(err.message || 'Mockup failed');
    } finally {
      setCreatingMockup(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload your design</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? 'Uploading…' : 'Upload'}
      </button>

      {blobUrl && (
        <div style={{ marginTop: 10 }}>
          <p>Uploaded URL: <a href={blobUrl} target="_blank" rel="noreferrer">{blobUrl}</a></p>
          <img src={blobUrl} alt="Uploaded design" style={{ maxWidth: 200 }} />
        </div>
      )}

      <hr style={{ margin: '2rem 0' }} />

      <h2>Select product + variant</h2>
      <label>
        Product ID:{' '}
        <input
          type="number"
          value={selectedProductId ?? ''}
          onChange={e => setSelectedProductId(Number(e.target.value) || null)}
        />
      </label>
      <br />
      <label>
        Variant ID:{' '}
        <input
          type="number"
          value={selectedVariantId ?? ''}
          onChange={e => setSelectedVariantId(Number(e.target.value) || null)}
        />
      </label>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleFetchMockupStyles} disabled={!selectedProductId || loadingStyles}>
          {loadingStyles ? 'Fetching styles…' : 'Get mockup styles'}
        </button>
        {stylesError && <p style={{ color: 'red' }}>{stylesError}</p>}
      </div>

      {mockupStyles && mockupStyles.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Available mockup styles</h3>
          <ul>
            {mockupStyles.map(s => (
              <li key={s.id}>
                ID: {s.id} — placement: {s.placement} — name: {s.display_name} — technique: {s.technique}
              </li>
            ))}
          </ul>
        </div>
      )}

      {blobUrl && selectedProductId && selectedVariantId && mockupStyles && (
        <div style={{ marginTop: '1rem' }}>
          <button onClick={handleCreateMockup} disabled={creatingMockup}>
            {creatingMockup ? 'Generating mockup…' : 'Generate mockup'}
          </button>
        </div>
      )}

      {mockupError && <p style={{ color: 'red' }}>{mockupError}</p>}

      {mockupUrls && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Mockup Preview</h3>
          {mockupUrls.map(url => (
            <div key={url} style={{ marginBottom: 16 }}>
              <a href={url} target="_blank" rel="noreferrer">{url}</a><br />
              <img src={url} alt="Mockup" style={{ maxWidth: 300 }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
