'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Song = {
  position: number;
  song: string;
  artist: string;
  status: string;
  videoId?: string;
  peakPosition?: number;
  weeksOnChart?: number;
};

type Playlist = {
  id?: number;
  chart_name: string;
  week_date: string;
  playlist_id: string;
  playlist_url: string;
  songs: Song[];
  status?: 'complete' | 'partial';
  pending_count?: number;
  created_at: string;
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d: string) {
  const parts = d.split('-');
  if (parts.length !== 3) return d;
  return `${MONTHS[parseInt(parts[1]) - 1]} ${parseInt(parts[2])}, ${parts[0]}`;
}
function addedCount(p: Playlist) { return p.songs.filter(s => s.status === 'added').length; }

const T = {
  bg:      '#09090b',
  surface: '#111113',
  border:  '#1f1f23',
  border2: '#27272a',
  muted:   '#3f3f46',
  sec:     '#52525b',
  ink2:    '#a1a1aa',
  ink:     '#e4e4e7',
  white:   '#ffffff',
  red:     '#ff0000',
  partial: '#eda100',
};

export default function PlaylistPage() {
  const [mounted, setMounted]             = useState(false);
  const [tab, setTab]                     = useState<'week' | 'year'>('week');
  const [charts, setCharts]               = useState<string[]>([]);
  const [selectedChart, setSelectedChart] = useState('Hot-100');
  const [hasYouTube, setHasYouTube]       = useState(false);

  // weekly
  const [weekPlaylists, setWeekPlaylists] = useState<Playlist[]>([]);
  const [activeWeek, setActiveWeek]       = useState<Playlist | null>(null);
  const [creatingWeek, setCreatingWeek]   = useState(false);
  const [weekError, setWeekError]         = useState<string | null>(null);
  const [loadingWeek, setLoadingWeek]     = useState(true);

  // yearly
  const [yearPlaylists, setYearPlaylists] = useState<Playlist[]>([]);
  const [activeYear, setActiveYear]       = useState<Playlist | null>(null);
  const [selectedYear, setSelectedYear]   = useState(new Date().getFullYear());
  const [creatingYear, setCreatingYear]   = useState(false);
  const [yearError, setYearError]         = useState<string | null>(null);
  const [loadingYear, setLoadingYear]     = useState(true);

  useEffect(() => {
    setMounted(true);

    // Pick up tokens from OAuth callback redirect
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('yt_access_token');
    const refreshToken = params.get('yt_refresh_token');
    if (accessToken) localStorage.setItem('yt_access_token', accessToken);
    if (refreshToken) localStorage.setItem('yt_refresh_token', refreshToken);
    if (accessToken || refreshToken) {
      window.history.replaceState({}, '', '/playlist');
    }

    setHasYouTube(!!(refreshToken || localStorage.getItem('yt_refresh_token')));
    fetch('/api/chart-names')
      .then(r => r.json())
      .then((d: { charts: string[] }) => {
        const list = d.charts ?? [];
        setCharts(list);
        const hot = list.find(c => c.toLowerCase().includes('hot')) ?? list[0] ?? 'Hot-100';
        setSelectedChart(hot);
        loadWeekPlaylists(hot);
        loadYearPlaylists(hot);
      })
      .catch(() => { setLoadingWeek(false); setLoadingYear(false); });
  }, []);

  const loadWeekPlaylists = async (chart: string) => {
    setLoadingWeek(true);
    try {
      const r = await fetch(`/api/get-playlist?chart=${encodeURIComponent(chart)}&view=week`);
      const data: Playlist[] = await r.json();
      setWeekPlaylists(data ?? []);
      setActiveWeek(data?.[0] ?? null);
    } catch { setWeekPlaylists([]); setActiveWeek(null); }
    finally { setLoadingWeek(false); }
  };

  const loadYearPlaylists = async (chart: string) => {
    setLoadingYear(true);
    try {
      const r = await fetch(`/api/get-playlist?chart=${encodeURIComponent(chart)}&view=year`);
      const data: Playlist[] = await r.json();
      setYearPlaylists(data ?? []);
      setActiveYear(data?.[0] ?? null);
    } catch { setYearPlaylists([]); setActiveYear(null); }
    finally { setLoadingYear(false); }
  };

  const handleChartChange = (chart: string) => {
    setSelectedChart(chart);
    setActiveWeek(null); setActiveYear(null);
    loadWeekPlaylists(chart);
    loadYearPlaylists(chart);
  };

  const handleCreateWeek = async () => {
    const refreshToken = localStorage.getItem('yt_refresh_token');
    if (!refreshToken) return;
    setCreatingWeek(true); setWeekError(null);
    try {
      const r = await fetch('/api/create-hot100-playlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken, chartName: selectedChart }),
      });
      const data = await r.json();
      if (!r.ok) {
        if (r.status === 401) { setHasYouTube(false); localStorage.removeItem('yt_refresh_token'); localStorage.removeItem('yt_access_token'); }
        setWeekError(data.error ?? 'Something went wrong.');
      } else {
        const p: Playlist = { chart_name: selectedChart, week_date: data.weekDate, playlist_id: data.playlistId, playlist_url: data.playlistUrl, songs: data.results, status: 'complete', pending_count: 0, created_at: new Date().toISOString() };
        setWeekPlaylists(prev => [p, ...prev]); setActiveWeek(p);
      }
    } catch (e) { setWeekError(e instanceof Error ? e.message : 'Request failed'); }
    finally { setCreatingWeek(false); }
  };

  const handleCreateYear = async () => {
    const refreshToken = localStorage.getItem('yt_refresh_token');
    if (!refreshToken) return;
    setCreatingYear(true); setYearError(null);
    try {
      const r = await fetch('/api/create-year-playlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken, chartName: selectedChart, year: selectedYear }),
      });
      const data = await r.json();
      if (!r.ok) {
        if (r.status === 401) { setHasYouTube(false); localStorage.removeItem('yt_refresh_token'); localStorage.removeItem('yt_access_token'); }
        setYearError(data.error ?? 'Something went wrong.');
      } else {
        const p: Playlist = { id: data.id, chart_name: selectedChart, week_date: String(selectedYear), playlist_id: data.playlistId, playlist_url: data.playlistUrl, songs: data.results, status: data.status, pending_count: data.remainingSongs, created_at: new Date().toISOString() };
        setYearPlaylists(prev => [p, ...prev.filter(x => x.id !== p.id)]); setActiveYear(p);
      }
    } catch (e) { setYearError(e instanceof Error ? e.message : 'Request failed'); }
    finally { setCreatingYear(false); }
  };


  if (!mounted) return null;

  const yearOptions = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const renderTracklist = (active: Playlist, isYear: boolean) => {
    const songs = active.songs ?? [];
    const added = songs.filter(s => s.status === 'added');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>
          {/* Player */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#000', aspectRatio: '16/9', position: 'relative' }}>
              <iframe key={active.playlist_id}
                src={`https://www.youtube.com/embed/videoseries?list=${active.playlist_id}&autoplay=0&modestbranding=1`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen />
            </div>
            <a href={active.playlist_url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: T.red, color: '#fff', padding: '9px 18px', borderRadius: '7px', fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem', width: 'fit-content' }}>
              Open on YouTube ↗
            </a>
          </div>

          {/* Track list */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', overflow: 'hidden', maxHeight: '520px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}`, flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.09em', color: T.muted, textTransform: 'uppercase', margin: 0 }}>Tracks</p>
              <p style={{ fontSize: '0.68rem', color: T.sec, margin: 0 }}>{added.length}/{songs.length} on YouTube</p>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {songs.map(s => (
                <div key={s.position} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 18px', borderBottom: '1px solid #18181b' }}>
                  <span style={{ fontSize: '0.68rem', color: T.muted, width: '22px', textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{s.position}</span>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: s.status === 'added' ? '#22c55e' : T.muted, flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden', minWidth: 0 }}>
                    {s.videoId
                      ? <a href={`https://www.youtube.com/watch?v=${s.videoId}&list=${active.playlist_id}`} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'block', fontSize: '0.8rem', color: T.ink, textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.song}</a>
                      : <span style={{ fontSize: '0.8rem', color: T.sec, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{s.song}</span>
                    }
                    <span style={{ fontSize: '0.7rem', color: T.sec, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{s.artist}</span>
                    {isYear && s.peakPosition != null && (
                      <span style={{ fontSize: '0.66rem', color: T.muted }}>Peak #{s.peakPosition} · {s.weeksOnChart}w</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: T.bg, color: T.ink, fontFamily: 'system-ui,-apple-system,"Segoe UI",sans-serif' }}>

      {/* Nav */}
      <header style={{ borderBottom: `1px solid ${T.border}`, padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', position: 'sticky', top: 0, background: T.bg, zIndex: 10 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
          <Image src="/smr.png" alt="Shadow Miracle Records" width={26} height={26} style={{ filter: 'invert(1)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Shadow Miracle Records</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {charts.length > 1 && (
            <select value={selectedChart} onChange={e => handleChartChange(e.target.value)}
              style={{ background: '#18181b', color: T.ink2, border: `1px solid ${T.border2}`, borderRadius: '6px', padding: '5px 10px', fontSize: '0.82rem', outline: 'none' }}>
              {charts.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          {tab === 'week' && hasYouTube && (
            <button onClick={handleCreateWeek} disabled={creatingWeek}
              style={{ background: creatingWeek ? T.border2 : '#18181b', color: creatingWeek ? T.sec : T.ink2, border: `1px solid ${T.border2}`, borderRadius: '6px', padding: '5px 14px', fontSize: '0.78rem', fontWeight: 600, cursor: creatingWeek ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
              {creatingWeek ? 'Generating…' : '+ This Week'}
            </button>
          )}
          {!hasYouTube && (
            <a href="/api/auth/youtube" style={{ background: '#18181b', color: T.ink2, border: `1px solid ${T.border2}`, borderRadius: '6px', padding: '5px 14px', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
              Connect YouTube
            </a>
          )}
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Title + tab toggle */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase', marginBottom: '6px' }}>Billboard Charts</p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: T.white, letterSpacing: '-0.02em', marginBottom: '16px' }}>
            {selectedChart.replace(/-/g, ' ')}
          </h1>
          <div style={{ display: 'inline-flex', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '8px', padding: '3px', gap: '2px' }}>
            {(['week', 'year'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ background: tab === t ? T.border2 : 'transparent', color: tab === t ? T.ink : T.ink2, border: 'none', borderRadius: '6px', padding: '6px 18px', fontSize: '0.8rem', fontWeight: tab === t ? 700 : 400, cursor: 'pointer' }}>
                {t === 'week' ? 'Weekly' : 'Yearly'}
              </button>
            ))}
          </div>
        </div>

        {/* ── WEEKLY ─────────────────────────────────────────────────────── */}
        {tab === 'week' && (
          loadingWeek ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '320px' }}>
              <p style={{ color: T.muted, fontSize: '0.88rem' }}>Loading…</p>
            </div>
          ) : weekPlaylists.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', border: `1px dashed ${T.border2}`, borderRadius: '12px' }}>
              <p style={{ color: T.sec, marginBottom: '16px', fontSize: '0.9rem' }}>No weekly playlists yet.</p>
              {hasYouTube
                ? <button onClick={handleCreateWeek} disabled={creatingWeek}
                    style={{ background: T.red, color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer' }}>
                    {creatingWeek ? 'Creating… (~30s)' : '▶ Generate This Week'}
                  </button>
                : <a href="/api/auth/youtube" style={{ display: 'inline-block', background: '#18181b', color: T.ink2, border: `1px solid ${T.border2}`, borderRadius: '7px', padding: '9px 18px', fontSize: '0.84rem', fontWeight: 600, textDecoration: 'none' }}>
                    Connect YouTube
                  </a>
              }
              {weekError && <p style={{ color: '#f87171', fontSize: '0.82rem', marginTop: '12px' }}>{weekError}</p>}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.09em', color: T.muted, textTransform: 'uppercase', marginBottom: '10px' }}>
                  Saved — {weekPlaylists.length}
                </p>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {weekPlaylists.map((p, i) => {
                    const isActive = activeWeek?.playlist_id === p.playlist_id;
                    return (
                      <button key={p.playlist_id ?? i} onClick={() => setActiveWeek(p)}
                        style={{ flexShrink: 0, background: isActive ? '#18181b' : 'transparent', border: `1px solid ${isActive ? T.muted : T.border2}`, borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', textAlign: 'left', minWidth: '140px' }}>
                        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: isActive ? T.ink : '#71717a', margin: '0 0 3px' }}>{fmtDate(p.week_date)}</p>
                        <p style={{ fontSize: '0.7rem', color: isActive ? T.sec : T.muted, margin: 0 }}>{addedCount(p)}/{p.songs.length} songs</p>
                      </button>
                    );
                  })}
                </div>
              </div>
              {activeWeek && renderTracklist(activeWeek, false)}
              {weekError && <p style={{ color: '#f87171', fontSize: '0.82rem' }}>{weekError}</p>}
            </div>
          )
        )}

        {/* ── YEARLY ─────────────────────────────────────────────────────── */}
        {tab === 'year' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Create controls */}
            {hasYouTube && (
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '0.72rem', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Build Year Playlist</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: T.ink2 }}>
                    Every unique song from {selectedChart.replace(/-/g, ' ')} · adds ~60 songs/day due to YouTube quota
                  </p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
                    style={{ background: '#18181b', color: T.ink2, border: `1px solid ${T.border2}`, borderRadius: '6px', padding: '7px 12px', fontSize: '0.82rem', outline: 'none' }}>
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <button onClick={handleCreateYear} disabled={creatingYear}
                    style={{ background: creatingYear ? T.border2 : T.red, color: creatingYear ? T.sec : '#fff', border: 'none', borderRadius: '7px', padding: '8px 20px', fontSize: '0.82rem', fontWeight: 700, cursor: creatingYear ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                    {creatingYear ? 'Creating… (~45s)' : '▶ Create'}
                  </button>
                </div>
              </div>
            )}

            {yearError && (
              <p style={{ color: '#f87171', fontSize: '0.82rem', background: '#1c0a0a', border: '1px solid #7f1d1d', borderRadius: '7px', padding: '10px 14px', margin: 0 }}>
                {yearError}
              </p>
            )}

            {loadingYear ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                <p style={{ color: T.muted, fontSize: '0.88rem' }}>Loading…</p>
              </div>
            ) : yearPlaylists.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', border: `1px dashed ${T.border2}`, borderRadius: '12px' }}>
                <p style={{ color: T.sec, fontSize: '0.9rem', marginBottom: '6px' }}>No year playlists yet.</p>
                <p style={{ color: T.muted, fontSize: '0.78rem' }}>Year playlists hold every unique song from a chart for the whole year. Because of YouTube&apos;s daily quota, about 60 songs are added per run — hit Resume each day to continue.</p>
                {!hasYouTube && (
                  <a href="/api/auth/youtube" style={{ display: 'inline-block', marginTop: '16px', background: '#18181b', color: T.ink2, border: `1px solid ${T.border2}`, borderRadius: '7px', padding: '9px 18px', fontSize: '0.84rem', fontWeight: 600, textDecoration: 'none' }}>
                    Connect YouTube
                  </a>
                )}
              </div>
            ) : (
              <>
                {/* Year cards */}
                <div>
                  <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.09em', color: T.muted, textTransform: 'uppercase', marginBottom: '10px' }}>
                    Year Playlists — {yearPlaylists.length}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {yearPlaylists.map((p, i) => {
                      const isActive = activeYear?.playlist_id === p.playlist_id;
                      const isPartial = p.status === 'partial';
                      const total = p.songs.length + (p.pending_count ?? 0);
                      return (
                        <button key={p.playlist_id ?? i} onClick={() => setActiveYear(p)}
                          style={{ flexShrink: 0, background: isActive ? '#18181b' : 'transparent', border: `1px solid ${isActive ? T.muted : T.border2}`, borderRadius: '8px', padding: '12px 16px', cursor: 'pointer', textAlign: 'left', minWidth: '160px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: isActive ? T.ink : '#71717a', margin: 0 }}>{p.week_date}</p>
                            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: isPartial ? T.partial : '#22c55e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              {isPartial ? 'Partial' : '✓'}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.7rem', color: isActive ? T.sec : T.muted, margin: '0 0 8px' }}>{p.songs.length}/{total} songs</p>
                          <div style={{ background: T.border2, borderRadius: '99px', height: '2px', overflow: 'hidden' }}>
                            <div style={{ background: isPartial ? T.partial : '#22c55e', height: '100%', width: `${total > 0 ? (p.songs.length / total) * 100 : 100}%`, borderRadius: '99px' }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {activeYear && renderTracklist(activeYear, true)}
              </>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
