"use client";

import React, { useEffect, useState } from "react";

type Entry = {
  artist: string;
  song: string;
  position: number;
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
  const res = await fetch("https://www.shadowmiraclerecords.com/api/chart", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch chart data");
  }
  return res.json();
}

export default function BillboardsPage() {
  const [charts, setCharts] = useState<ChartWithWeeks[]>([]);
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  useEffect(() => {
    fetchCharts()
      .then((data) => setCharts(data))
      .catch((err) => console.error("Error fetching charts:", err));
  }, []);

  // Get unique chart names
  const chartNames = Array.from(new Set(charts.map((c) => c.chart)));

  // Year buttons pulled from dates
  const availableYears = Array.from(
    new Set(
      charts.flatMap((chart) =>
        chart.dates.map((d) => d.date.split("-")[0])
      )
    )
  ).sort();

  // Filter based on selected chart and year
  const filteredCharts = charts
    .filter((c) => (selectedChart ? c.chart === selectedChart : true))
    .map((c) => ({
      ...c,
      dates: c.dates.filter((d) =>
        selectedYear ? d.date.startsWith(selectedYear) : true
      ),
    }))
    .filter((c) => c.dates.length > 0);

  return (
    <main
      style={{
        padding: "2rem",
        color: "white",
        backgroundColor: "#000000",
      }}
    >
      <h1>Billboard Charts</h1>

      {/* Chart Buttons */}
      <div style={{ marginBottom: "1rem" }}>
        <strong>Choose Chart:</strong>
        {chartNames.map((name) => (
          <button
            key={name}
            onClick={() => setSelectedChart(name)}
            style={{
              margin: "0 0.5rem",
              padding: "0.5rem 1rem",
              background: selectedChart === name ? "#0D6EFD" : "#333",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            {name}
          </button>
        ))}

        {/* Clear Chart filter */}
        <button
          onClick={() => setSelectedChart(null)}
          style={{
            margin: "0 0.5rem",
            padding: "0.5rem 1rem",
            background: "#444",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          All
        </button>
      </div>

      {/* Year Buttons */}
      <div style={{ marginBottom: "2rem" }}>
        <strong>Choose Year:</strong>
        {availableYears.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            style={{
              margin: "0 0.5rem",
              padding: "0.5rem 1rem",
              background: selectedYear === year ? "#0D6EFD" : "#333",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            {year}
          </button>
        ))}

        {/* Clear Year filter */}
        <button
          onClick={() => setSelectedYear(null)}
          style={{
            margin: "0 0.5rem",
            padding: "0.5rem 1rem",
            background: "#444",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          All Years
        </button>
      </div>

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
                        <th style={{ textAlign: "left", width: "60px" }}>
                          Position
                        </th>
                        <th style={{ textAlign: "left" }}>Song</th>
                        <th style={{ textAlign: "left" }}>Artist</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weekData.entries.map((entry) => (
                        <tr key={`${weekData.date}-${entry.position}`}>
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
