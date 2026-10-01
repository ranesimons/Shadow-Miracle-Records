'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { WeekStat } from '../../pages/api/chart-stats';

// ── Validated palette (adjacent-pair, dark mode) ────────────────────────────
// Slot 1 blue #3987e5 | Slot 2 orange #d95926
// Worst adjacent CVD ΔE 8.4 — passes the ≥8 target
const C = {
  surface:   '#111113',
  page:      '#09090b',
  grid:      '#2c2c2a',
  baseline:  '#383835',
  inkPri:    '#ffffff',
  inkSec:    '#c3c2b7',
  inkMuted:  '#52525b',
  new:       '#3987e5',   // series 1 — new songs
  returning: '#d95926',   // series 2 — returning (duplicates)
  gap:       '#09090b',   // 2 px surface gap between stacked segments
};

type WeekData = WeekStat & { x: number };

const PAD = { top: 24, right: 24, bottom: 60, left: 52 };
const BAR_W = 14;
const BAR_GAP = 5;
const CHART_H = 300;

function fmt(d: string) {
  const [y, m] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[+m - 1]} ${y}`;
}

type TooltipState = { x: number; y: number; week: WeekStat } | null;

export default function ChartStatsPage() {
  const [charts, setCharts] = useState<string[]>([]);
  const [selected, setSelected] = useState('Hot-100');
  const [weeks, setWeeks] = useState<WeekStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/chart-names')
      .then(r => r.json())
      .then(d => {
        const list: string[] = d.charts ?? [];
        setCharts(list);
        const hot = list.find(c => c.toLowerCase().includes('hot')) ?? list[0] ?? 'Hot-100';
        setSelected(hot);
        return loadStats(hot);
      })
      .catch(() => setLoading(false));
  }, []);

  const loadStats = async (chart: string) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/chart-stats?chart=${encodeURIComponent(chart)}`);
      const d = await r.json();
      setWeeks(d.weeks ?? []);
    } finally {
      setLoading(false);
    }
  };

  const handleChart = (c: string) => {
    setSelected(c);
    setTooltip(null);
    loadStats(c);
  };

  // ── Derived stats ────────────────────────────────────────────────────────
  const totalWeeks = weeks.length;
  const avgNew = totalWeeks ? Math.round(weeks.reduce((s, w) => s + w.new_songs, 0) / totalWeeks) : 0;
  const avgRet = totalWeeks ? Math.round(weeks.reduce((s, w) => s + w.returning_songs, 0) / totalWeeks) : 0;
  const maxTotal = Math.max(...weeks.map(w => w.total), 1);

  // ── SVG geometry ────────────────────────────────────────────────────────
  const svgW = PAD.left + PAD.right + weeks.length * (BAR_W + BAR_GAP);
  const plotH = CHART_H - PAD.top - PAD.bottom;

  const data: WeekData[] = weeks.map((w, i) => ({
    ...w,
    x: PAD.left + i * (BAR_W + BAR_GAP),
  }));

  const yTicks = [0, 25, 50, 75, 100].filter(v => v <= maxTotal + 5);

  // X-axis labels: show one label per month boundary
  const xLabels: { x: number; label: string }[] = [];
  let lastMonthKey = '';
  data.forEach(d => {
    const key = d.date.slice(0, 7);
    if (key !== lastMonthKey) { xLabels.push({ x: d.x, label: fmt(d.date) }); lastMonthKey = key; }
  });

  const toY = (v: number) => PAD.top + plotH - (v / maxTotal) * plotH;

  return (
    <div style={{ minHeight: '100vh', background: C.page, color: C.inkPri, fontFamily: 'system-ui,-apple-system,"Segoe UI",sans-serif' }}>

      {/* Nav */}
      <header style={{ borderBottom: `1px solid ${C.grid}`, padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', position: 'sticky', top: 0, background: C.page, zIndex: 10 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
          <Image src="/smr.png" alt="Shadow Miracle Records" width={26} height={26} style={{ filter: 'invert(1)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Shadow Miracle Records</span>
        </Link>
        <nav style={{ display: 'flex', gap: '20px', fontSize: '0.82rem' }}>
          <Link href="/playlist" style={{ color: C.inkSec, textDecoration: 'none' }}>Playlists</Link>
          <Link href="/chart-stats" style={{ color: C.inkPri, textDecoration: 'none', fontWeight: 600 }}>Chart Stats</Link>
        </nav>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Title + filter */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: C.inkMuted, textTransform: 'uppercase', marginBottom: '6px' }}>
              Billboard Charts
            </p>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              Weekly Song Breakdown
            </h1>
            <p style={{ fontSize: '0.82rem', color: C.inkSec, marginTop: '6px', margin: '6px 0 0' }}>
              New entries vs returning songs per week
            </p>
          </div>
          {charts.length > 0 && (
            <select
              value={selected}
              onChange={e => handleChart(e.target.value)}
              style={{ background: C.surface, color: C.inkSec, border: `1px solid ${C.grid}`, borderRadius: '6px', padding: '7px 12px', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}
            >
              {charts.map(c => <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>)}
            </select>
          )}
        </div>

        {/* Stat tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Weeks tracked', value: totalWeeks.toLocaleString() },
            { label: 'Avg new songs / week', value: avgNew.toLocaleString(), color: C.new },
            { label: 'Avg returning / week', value: avgRet.toLocaleString(), color: C.returning },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: C.surface, border: `1px solid ${C.grid}`, borderRadius: '10px', padding: '20px 24px' }}>
              <p style={{ fontSize: '0.72rem', color: C.inkMuted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>{label}</p>
              <p style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: color ?? C.inkPri }}>{loading ? '—' : value}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ background: C.surface, border: `1px solid ${C.grid}`, borderRadius: '12px', padding: '24px 0 16px' }}>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '20px', padding: '0 24px 20px', borderBottom: `1px solid ${C.grid}` }}>
            {[
              { color: C.new,       label: 'New songs' },
              { color: C.returning, label: 'Returning (duplicates)' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span style={{ display: 'block', width: '12px', height: '12px', borderRadius: '3px', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.78rem', color: C.inkSec }}>{label}</span>
              </div>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: `${CHART_H}px` }}>
              <p style={{ color: C.inkMuted, fontSize: '0.85rem' }}>Loading…</p>
            </div>
          ) : weeks.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: `${CHART_H}px` }}>
              <p style={{ color: C.inkMuted, fontSize: '0.85rem' }}>No data for this chart.</p>
            </div>
          ) : (
            <div ref={scrollRef} style={{ overflowX: 'auto', position: 'relative', paddingBottom: '4px' }}>
              <svg
                width={svgW}
                height={CHART_H}
                style={{ display: 'block', overflow: 'visible' }}
                onMouseLeave={() => setTooltip(null)}
              >
                {/* Y gridlines + ticks */}
                {yTicks.map(v => {
                  const y = toY(v);
                  return (
                    <g key={v}>
                      <line x1={PAD.left} x2={svgW - PAD.right} y1={y} y2={y} stroke={C.grid} strokeWidth={1} />
                      <text x={PAD.left - 8} y={y + 4} textAnchor="end" fill={C.inkMuted} fontSize={10} style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</text>
                    </g>
                  );
                })}

                {/* Baseline */}
                <line x1={PAD.left} x2={svgW - PAD.right} y1={toY(0)} y2={toY(0)} stroke={C.baseline} strokeWidth={1} />

                {/* Bars */}
                {data.map(w => {
                  const retH = (w.returning_songs / maxTotal) * plotH;
                  const newH = (w.new_songs / maxTotal) * plotH;
                  const retY = toY(0) - retH;
                  const newY = retY - newH - 2; // 2px surface gap

                  return (
                    <g key={w.date}>
                      {/* Returning segment (bottom) */}
                      {retH > 0 && (
                        <rect
                          x={w.x}
                          y={retY}
                          width={BAR_W}
                          height={retH}
                          fill={C.returning}
                          rx={0}
                          ry={0}
                        />
                      )}
                      {/* New segment (top) — rounded data-end (top corners) */}
                      {newH > 0 && (
                        <rect
                          x={w.x}
                          y={newY}
                          width={BAR_W}
                          height={newH + (retH > 0 ? 0 : 4)}
                          fill={C.new}
                          rx={4}
                          ry={4}
                        />
                      )}
                      {/* Square off the bottom of the top segment */}
                      {newH > 4 && retH > 0 && (
                        <rect x={w.x} y={newY + newH - 4} width={BAR_W} height={4} fill={C.new} />
                      )}
                      {/* Invisible wide hit target */}
                      <rect
                        x={w.x - 3}
                        y={PAD.top}
                        width={BAR_W + 6}
                        height={plotH}
                        fill="transparent"
                        style={{ cursor: 'crosshair' }}
                        onMouseEnter={e => {
                          const svgRect = (e.currentTarget.closest('svg') as SVGSVGElement).getBoundingClientRect();
                          const scrollLeft = scrollRef.current?.scrollLeft ?? 0;
                          setTooltip({
                            x: w.x + BAR_W / 2 - scrollLeft + svgRect.left,
                            y: newY,
                            week: w,
                          });
                        }}
                      />
                    </g>
                  );
                })}

                {/* X-axis labels — every month */}
                {xLabels.map(({ x, label }) => (
                  <g key={label}>
                    <line x1={x} x2={x} y1={toY(0)} y2={toY(0) + 6} stroke={C.baseline} strokeWidth={1} />
                    <text
                      x={x}
                      y={toY(0) + 18}
                      textAnchor="middle"
                      fill={C.inkMuted}
                      fontSize={9}
                      transform={`rotate(-35, ${x}, ${toY(0) + 18})`}
                    >
                      {label}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Tooltip */}
              {tooltip && (
                <div
                  style={{
                    position: 'fixed',
                    left: tooltip.x + 12,
                    top: tooltip.y,
                    background: '#18181b',
                    border: `1px solid ${C.grid}`,
                    borderRadius: '8px',
                    padding: '10px 14px',
                    pointerEvents: 'none',
                    zIndex: 20,
                    minWidth: '160px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                  }}
                >
                  <p style={{ fontSize: '0.72rem', color: C.inkMuted, margin: '0 0 8px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {fmt(tooltip.week.date)}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: C.new, flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ fontSize: '0.78rem', color: C.inkSec }}>New</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: C.inkPri, fontVariantNumeric: 'tabular-nums' }}>{tooltip.week.new_songs}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: C.returning, flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ fontSize: '0.78rem', color: C.inkSec }}>Returning</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: C.inkPri, fontVariantNumeric: 'tabular-nums' }}>{tooltip.week.returning_songs}</span>
                    </div>
                    <div style={{ borderTop: `1px solid ${C.grid}`, paddingTop: '5px', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.78rem', color: C.inkSec }}>Total</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: C.inkPri, fontVariantNumeric: 'tabular-nums' }}>{tooltip.week.total}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
