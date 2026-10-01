"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Entry = {
  position: number;
  song: string;
  artist: string;
};

type WeekWithEntries = {
  date: string;
  entries: Entry[];
};

type ChartWithWeeks = {
  chart: string;
  dates: WeekWithEntries[];
};

async function fetchCharts(keyword: string): Promise<ChartWithWeeks[]> {
  const res = await fetch(`https://www.shadowmiraclerecords.com/api/track?keyword=${keyword}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch chart data");
  }
  return res.json();
}

export default function TrackPage() {
  const [charts, setCharts] = useState<ChartWithWeeks[]>([]);
  const [keyword, setKeyword] = useState<string>(""); // keyword from input
  const [searchText, setSearchText] = useState<string>(""); // controlled input value
  const [selectedChart, setSelectedChart] = useState<string>(""); // chart filter

  const loadCharts = async (kw: string) => {
    try {
      const data = await fetchCharts(kw);
      setCharts(data);
      // Reset selected chart when new data is loaded
      setSelectedChart("");
    } catch (err) {
      console.error("Error fetching charts:", err);
      setCharts([]);
    }
  };

  // Load charts when keyword changes
  useEffect(() => {
    if (keyword) {
      loadCharts(keyword);
    }
  }, [keyword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchText); // triggers useEffect
  };

  // Filter charts based on selected chart
  const filteredCharts = selectedChart
    ? charts.filter((chart) => chart.chart === selectedChart)
    : charts;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#111", color: "#fff", fontFamily: "sans-serif" }}>
      <header style={{ borderBottom: "1px solid #222", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
          <Image src="/smr.png" alt="Shadow Miracle Records" width={28} height={28} style={{ filter: "invert(1)" }} />
          <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Shadow Miracle Records</span>
        </Link>
        <nav style={{ display: "flex", gap: "24px", fontSize: "0.85rem" }}>
          <Link href="/artists" style={{ color: "#aaa", textDecoration: "none" }}>Artists</Link>
          <Link href="/privacy-policy" style={{ color: "#aaa", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/terms-of-service" style={{ color: "#aaa", textDecoration: "none" }}>Terms of Service</Link>
        </nav>
      </header>
    <main
      style={{
        padding: "2rem 3rem",
        color: "white",
        backgroundColor: "#111",
        maxWidth: "960px",
      }}
    >
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "24px" }}>Billboard Chart Search</h1>

      {/* Search form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Enter keyword"
          style={{ padding: "0.5rem", width: "200px", marginRight: "1rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Search
        </button>
      </form>

      {/* Chart filter */}
      {charts.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <label htmlFor="chartFilter" style={{ marginRight: "0.5rem" }}>
            Filter by Chart:
          </label>
          <select
            id="chartFilter"
            value={selectedChart}
            onChange={(e) => setSelectedChart(e.target.value)}
            style={{ padding: "0.5rem" }}
          >
            <option value="">All Charts</option>
            {charts.map((chart) => (
              <option key={chart.chart} value={chart.chart}>
                {chart.chart}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Chart tables */}
      {filteredCharts.length === 0 ? (
        <p>No chart data available.</p>
      ) : (
        filteredCharts.map((chart) => (
          <section key={chart.chart} style={{ marginBottom: "2rem" }}>
            <h2>{chart.chart}</h2>

            {chart.dates.map((weekData) => (
              <div key={weekData.date} style={{ marginBottom: "1.5rem" }}>
                <h3>Date: {weekData.date}</h3>

                {weekData.entries.length === 0 ? (
                  <p>No entries for this date</p>
                ) : (
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      marginTop: "0.5rem",
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left" }}>Position</th>
                        <th style={{ textAlign: "left" }}>Song</th>
                        <th style={{ textAlign: "left" }}>Artist</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weekData.entries.map((entry, idx) => (
                        <tr key={idx}>
                          <td>{entry.position}</td>
                          <td>{entry.song}</td>
                          <td>{entry.artist}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </section>
        ))
      )}
    </main>
    <footer style={{ borderTop: "1px solid #222", padding: "24px 48px", display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "#555" }}>
      <span>© {new Date().getFullYear()} Shadow Miracle Records</span>
      <div style={{ display: "flex", gap: "20px" }}>
        <Link href="/privacy-policy" style={{ color: "#555", textDecoration: "none" }}>Privacy Policy</Link>
        <Link href="/terms-of-service" style={{ color: "#555", textDecoration: "none" }}>Terms of Service</Link>
      </div>
    </footer>
    </div>
  );
}
