// components/Hot100ByWeek.tsx

'use client';

import { useState, useEffect } from 'react';

type Song = {
  song: string;
  artist: string;
  this_week: number;
  last_week: number | null;
  peak_position: number;
  weeks_on_chart: number;
};

type ChartWeek = {
  date: string;
  data: Song[];
};

export default function Hot100ByWeek() {
  const [date, setDate] = useState<string>(() => {
    // default to latest valid date; you might fetch valid_dates.json and pick last item
    const d = new Date();
    return d.toISOString().split('T')[0]; // YYYY‑MM‑DD
  });
  const [chart, setChart] = useState<ChartWeek | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChart = async (weekDate: string) => {
    setLoading(true);
    setError(null);
    setChart(null);
    try {
      const url = `https://raw.githubusercontent.com/mhollingshead/billboard-hot-100/main/date/${weekDate}.json`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`No data found for week ${weekDate}`);
      }
      const data: ChartWeek = await res.json();
      setChart(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const handleLoad = () => {
    fetchChart(date);
  };

  useEffect(() => {
    // optional: load once on mount
    fetchChart(date);
  }, []); // only once

  return (
    <div>
      <h1>Billboard Hot 100 — Weekly Chart</h1>
      <label htmlFor="chartDate">Select week (YYYY‑MM‑DD):</label>
      <input
        id="chartDate"
        type="date"
        value={date}
        onChange={handleDateChange}
      />
      <button onClick={handleLoad} disabled={loading}>
        {loading ? 'Loading…' : 'Load Chart'}
      </button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {chart && (
        <div>
          <h2>Week ending: {chart.date}</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{padding: '8px', border: '1px solid #ddd'}}>Rank</th>
                <th style={{padding: '8px', border: '1px solid #ddd'}}>Song</th>
                <th style={{padding: '8px', border: '1px solid #ddd'}}>Artist</th>
                <th style={{padding: '8px', border: '1px solid #ddd'}}>Last Week</th>
                <th style={{padding: '8px', border: '1px solid #ddd'}}>Peak</th>
                <th style={{padding: '8px', border: '1px solid #ddd'}}>Weeks on Chart</th>
              </tr>
            </thead>
            <tbody>
              {chart.data.map((entry, idx) => (
                <tr key={idx}>
                  <td style={{padding: '8px', border: '1px solid #ddd'}}>{entry.this_week}</td>
                  <td style={{padding: '8px', border: '1px solid #ddd'}}>{entry.song}</td>
                  <td style={{padding: '8px', border: '1px solid #ddd'}}>{entry.artist}</td>
                  <td style={{padding: '8px', border: '1px solid #ddd'}}>{entry.last_week ?? '-'}</td>
                  <td style={{padding: '8px', border: '1px solid #ddd'}}>{entry.peak_position}</td>
                  <td style={{padding: '8px', border: '1px solid #ddd'}}>{entry.weeks_on_chart}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
