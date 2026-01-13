// pages/api/fb/videos.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from '../../lib/db';
const axios = require('axios');
import * as cheerio from "cheerio";

interface ChartData {
  date: string;
  data: ChartRow[];
}

interface ChartRow {
  song: string;
  artist: string;
  this_week: number;
  last_week: number | null;
  peak_position: number;
  weeks_on_chart: number;
}

interface ResponseData {
  chart?: ChartData;
  error?: string;
}

// Remove tab or newline characters from text nodes
const clean = (html: string): string => html.replace(/\n/g, '').replace(/\t/g, '');

// Format dates to YYYY-MM-DD
const formatDate = (date: Date): string => {
  const parts = date.toLocaleDateString().split('/');
  if (parts[0].length === 1) parts[0] = `0${parts[0]}`;
  if (parts[1].length === 1) parts[1] = `0${parts[1]}`;
  return `${parts[2]}-${parts[0]}-${parts[1]}`;
};


const selectors = {
    date: '.charts-title .c-span',
    song: 'h3#title-of-a-story',
    artist: 'h3 + span.c-label',
    last_week: '.a-chart-result-item-container > ul > div > div:nth-child(1) > .o-chart-results-list__item > span',
    peak_position: '.a-chart-result-item-container > ul > div > div:nth-child(2) > .o-chart-results-list__item > span',
    weeks_on_chart: '.a-chart-result-item-container > ul > div > div:nth-child(3) > .o-chart-results-list__item > span'
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  // Extract token from body
  const { genre, weeks } = req.body as { genre?: string, weeks?: string };

  if (!genre || typeof genre !== "string") {
    return res
      .status(400)
      .json({ error: `Missing or invalid genre provided: ${genre}` });
  }

  if (!weeks || typeof weeks !== "string") {
    return res
      .status(400)
      .json({ error: `Missing or invalid weeks provided: ${weeks}` });
  }

  try {

    const response = await axios.get(`https://www.billboard.com/charts/${genre}/${weeks}`);
    const $ = cheerio.load(response.data);

    const rawDateText = $(selectors.date).first().text().replace("Week of ", "");
    const date = formatDate(new Date(rawDateText));

    const chart: ChartData = { date, data: [] };

    $(".o-chart-results-list-row-container").each((i, elm) => {
      const $row = $(elm);

      const this_week = i + 1;
      const song = clean($row.find(selectors.song).first().text());
      const artist = clean($row.find(selectors.artist).first().text());

      const lastWeekText = clean(
        $row.find(selectors.last_week).first().text()
      );
      const peakText = clean(
        $row.find(selectors.peak_position).first().text()
      );
      const weeksText = clean(
        $row.find(selectors.weeks_on_chart).first().text()
      );

      chart.data.push({
        song,
        artist,
        this_week,
        last_week:
          lastWeekText === "-" ? null : parseInt(lastWeekText, 10),
        peak_position: parseInt(peakText, 10),
        weeks_on_chart: parseInt(weeksText, 10),
      });
    });

    for (const i of chart.data) {
        await sql`
            INSERT INTO public.billboards
            (date, song, artist, position, chart)
            VALUES
            (${date}, ${i.song}, ${i.artist}, ${i.this_week}, ${genre});
        `;
    }

    return res.status(200).json({ chart: chart });
  } catch (err) {
    console.error("Error in /api/fb/videos:", err);
    return res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
  }
}
