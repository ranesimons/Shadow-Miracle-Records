"use client";

import React, { useEffect, useState } from "react";

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
    <main
      style={{
        padding: "2rem",
        color: "white",
        backgroundColor: "#000000",
      }}
    >
      <h1>Billboard Charts</h1>

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
  );
}
