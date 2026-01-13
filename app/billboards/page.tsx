// app/billboards/page.tsx
import React from "react";

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

export default async function BillboardsPage() {
  let charts: ChartWithWeeks[] = [];

  try {
    charts = await fetchCharts();
  } catch (error) {
    console.error("Error fetching charts:", error);
  }

  return (
    <main style={{ 
        padding: "2rem", 
        color: "white",               // Make font white
        backgroundColor: "#000000",   // Optional: black background
      }}>
      <h1>Billboard Charts</h1>

      {charts.length === 0 ? (
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
                        <th style={{ textAlign: "left", width: "60px" }}>Position</th>
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
