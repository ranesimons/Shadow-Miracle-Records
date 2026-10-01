"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Entry = {
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

async function fetchCharts(): Promise<ChartWithWeeks[]> {
  const res = await fetch("https://www.shadowmiraclerecords.com/api/artists", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch chart data");
  }
  return res.json();
}

export default function ArtistsPage() {
  const [charts, setCharts] = useState<ChartWithWeeks[]>([]);

  useEffect(() => {
    fetchCharts()
      .then((data) => setCharts(data))
      .catch((err) => console.error("Error fetching charts:", err));
  }, []);

  // Filter based on selected chart and year
  const filteredCharts = charts;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#111", color: "#fff", fontFamily: "sans-serif" }}>
      <header style={{ borderBottom: "1px solid #222", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
          <Image src="/smr.png" alt="Shadow Miracle Records" width={28} height={28} style={{ filter: "invert(1)" }} />
          <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Shadow Miracle Records</span>
        </Link>
        <nav style={{ display: "flex", gap: "24px", fontSize: "0.85rem" }}>
          <Link href="/track" style={{ color: "#aaa", textDecoration: "none" }}>Charts</Link>
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
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "24px" }}>Artists &amp; Billboard Charts</h1>

      {filteredCharts.length === 0 ? (
        <p>No chart data available.</p>
      ) : (
        charts.map((chart) => (
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
                        <th style={{ textAlign: "left", width: "60px" }}>
                          Position
                        </th>
                        <th style={{ textAlign: "left" }}>Song</th>
                        <th style={{ textAlign: "left" }}>Artist</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weekData.entries.map((entry) => (
                        <tr>{entry.artist}</tr>
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
