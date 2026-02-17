"use client";

import React, { useEffect, useState } from "react";

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
    <main
      style={{
        padding: "2rem",
        color: "white",
        backgroundColor: "#000000",
      }}
    >
      <h1>Billboard Charts</h1>

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
  );
}
