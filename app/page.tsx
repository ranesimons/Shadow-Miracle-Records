import Image from "next/image";
import Link from "next/link";
import { sql } from "../lib/db";

const NAV_LINK: React.CSSProperties = { color: "#444", textDecoration: "none", fontSize: "0.88rem" };

async function getLatestChartEntries() {
  try {
    const rows = await sql`
      SELECT song, artist, position
      FROM public.billboards
      WHERE chart = 'Hot-100'
        AND date = (SELECT MAX(date) FROM public.billboards WHERE chart = 'Hot-100')
      ORDER BY position ASC
      LIMIT 10
    `;
    const dateRow = await sql`
      SELECT MAX(date)::text AS week FROM public.billboards WHERE chart = 'Hot-100'
    `;
    return { songs: rows as { song: string; artist: string; position: number }[], week: (dateRow[0] as { week: string })?.week ?? '' };
  } catch {
    return { songs: [], week: '' };
  }
}

export default async function Home() {
  const { songs, week } = await getLatestChartEntries();
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", color: "#111111", fontFamily: "sans-serif" }}>

      {/* Nav */}
      <header style={{ borderBottom: "1px solid #e5e5e5", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Image src="/smr.png" alt="Shadow Miracle Records" width={32} height={32} />
          <span style={{ fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.03em" }}>Shadow Miracle Records</span>
        </div>
        <nav style={{ display: "flex", gap: "28px" }}>
          <Link href="/chart-stats" style={NAV_LINK}>Chart Stats</Link>
          <Link href="/playlist" style={NAV_LINK}>Playlists</Link>
          <a href="https://ranesimons.streetteam.fm/join" target="_blank" rel="noopener noreferrer" style={NAV_LINK}>Community</a>
          <Link href="/privacy-policy" style={NAV_LINK}>Privacy Policy</Link>
          <Link href="/terms-of-service" style={NAV_LINK}>Terms of Service</Link>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "72px 24px 56px", borderBottom: "1px solid #e5e5e5" }}>
        <Image
          src="/smr.png"
          alt="Shadow Miracle Records"
          width={88}
          height={88}
          style={{ marginBottom: "20px" }}
        />
        <h1 style={{ fontSize: "2.4rem", fontWeight: 800, marginBottom: "14px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
          Shadow Miracle Records
        </h1>
        <p style={{ fontSize: "1.05rem", color: "#555", maxWidth: "520px", margin: "0 auto 28px", lineHeight: 1.7 }}>
          An independent music label based in Texas, developing and distributing original music across all major platforms.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="https://ranesimons.streetteam.fm/join"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-block", backgroundColor: "#111", color: "#fff", padding: "12px 28px", borderRadius: "9999px", fontWeight: 600, textDecoration: "none", fontSize: "0.92rem" }}
          >
            Join the Community
          </a>
        </div>
      </section>

      {/* About the label */}
      <section style={{ padding: "72px 48px", borderBottom: "1px solid #e5e5e5", backgroundColor: "#fafafa" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", color: "#999", marginBottom: "12px", textTransform: "uppercase" }}>About</p>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "20px", lineHeight: 1.2 }}>
            An independent label built for the digital era
          </h2>
          <p style={{ color: "#555", lineHeight: 1.8, maxWidth: "680px", marginBottom: "40px", fontSize: "0.97rem" }}>
            Shadow Miracle Records signs, develops, and promotes independent artists. We handle everything from recording and production to digital distribution and social media strategy, so artists can focus on making music.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "32px" }}>
            {[
              { icon: "🎵", title: "Music Production", body: "In-house production and mixing support for signed artists across all genres." },
              { icon: "📡", title: "Digital Distribution", body: "Music delivered to Spotify, Apple Music, TikTok Music, Amazon, and every major platform." },
              { icon: "📊", title: "Chart Tracking", body: "Real-time Billboard chart monitoring so artists always know where their music stands." },
              { icon: "🤝", title: "Artist Development", body: "Branding, strategy, and audience growth guidance from signing through every release." },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{ padding: "24px", background: "#fff", borderRadius: "12px", border: "1px solid #e5e5e5" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "10px" }}>{icon}</div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "8px" }}>{title}</h3>
                <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.6, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TikTok integration description */}
      <section style={{ padding: "72px 48px", borderBottom: "1px solid #e5e5e5" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", color: "#999", marginBottom: "12px", textTransform: "uppercase" }}>TikTok Content Tool</p>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "16px", lineHeight: 1.2 }}>
              Schedule and post videos directly to TikTok
            </h2>
            <p style={{ color: "#555", lineHeight: 1.8, marginBottom: "20px", fontSize: "0.95rem" }}>
              Shadow Miracle Records uses the TikTok Content Posting API to manage video publishing for our artists. Label staff can upload videos, set post details, and publish directly to TikTok — all from one dashboard.
            </p>
            <ul style={{ paddingLeft: "20px", color: "#555", lineHeight: 2, fontSize: "0.92rem", margin: 0 }}>
              <li>Upload and store videos securely in the cloud</li>
              <li>Set title, description, and privacy level per post</li>
              <li>Configure content disclosure (brand / sponsored)</li>
              <li>Publish to TikTok with one click</li>
              <li>Track post status across every day of the month</li>
            </ul>
          </div>
          <div style={{ background: "#f4f4f5", borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "#fff", borderRadius: "10px", padding: "16px 20px", border: "1px solid #e5e5e5" }}>
              <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "#111", marginBottom: "4px" }}>Content Calendar</p>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#888" }}>Plan and post one video per day, every day of the month.</p>
            </div>
            <div style={{ background: "#fff", borderRadius: "10px", padding: "16px 20px", border: "1px solid #e5e5e5" }}>
              <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "#111", marginBottom: "4px" }}>Privacy Controls</p>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#888" }}>Public, followers-only, or private — set per video.</p>
            </div>
            <div style={{ background: "#fff", borderRadius: "10px", padding: "16px 20px", border: "1px solid #e5e5e5" }}>
              <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "#111", marginBottom: "4px" }}>Content Disclosure</p>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#888" }}>Complies with TikTok promotional content labeling requirements.</p>
            </div>
            <div style={{ background: "#fff", borderRadius: "10px", padding: "16px 20px", border: "1px solid #e5e5e5" }}>
              <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "#111", marginBottom: "4px" }}>Direct API Publishing</p>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#888" }}>Videos are published via TikTok&apos;s official Content Posting API v2.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Chart Data */}
      {songs.length > 0 && (
        <section style={{ padding: "72px 48px", borderBottom: "1px solid #e5e5e5" }}>
          <div style={{ maxWidth: "960px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", color: "#999", marginBottom: "8px", textTransform: "uppercase" }}>Live Data</p>
                <h2 style={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.2, margin: 0 }}>This Week&apos;s Hot 100</h2>
                {week && <p style={{ color: "#888", fontSize: "0.85rem", marginTop: "6px" }}>Week of {week}</p>}
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <Link href="/chart-stats" style={{ display: "inline-block", border: "1px solid #e5e5e5", color: "#111", padding: "9px 20px", borderRadius: "9999px", fontWeight: 600, textDecoration: "none", fontSize: "0.85rem" }}>Chart Stats →</Link>
                <Link href="/playlist" style={{ display: "inline-block", backgroundColor: "#111", color: "#fff", padding: "9px 20px", borderRadius: "9999px", fontWeight: 600, textDecoration: "none", fontSize: "0.85rem" }}>Build Playlist →</Link>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {songs.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "20px", padding: "14px 20px", borderRadius: "10px", background: i % 2 === 0 ? "#fafafa" : "#fff", border: "1px solid #f0f0f0" }}>
                  <span style={{ fontWeight: 800, fontSize: "1rem", color: s.position <= 3 ? "#111" : "#bbb", minWidth: "28px", textAlign: "right" }}>#{s.position}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: "0.92rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.song}</p>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#888" }}>{s.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section style={{ padding: "72px 48px", borderBottom: "1px solid #e5e5e5", backgroundColor: "#fafafa" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", color: "#999", marginBottom: "12px", textTransform: "uppercase" }}>Contact</p>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "16px" }}>Get in touch</h2>
          <p style={{ color: "#555", fontSize: "0.97rem", lineHeight: 1.7, maxWidth: "480px", margin: "0 auto 24px" }}>
            For artist inquiries, licensing, or questions about our services, reach out directly.
          </p>
          <a
            href="mailto:rane@ranesimons.com"
            style={{ display: "inline-block", backgroundColor: "#111", color: "#fff", padding: "12px 28px", borderRadius: "9999px", fontWeight: 600, textDecoration: "none", fontSize: "0.92rem" }}
          >
            rane@ranesimons.com
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "32px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", fontSize: "0.82rem", color: "#aaa" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Image src="/smr.png" alt="" width={18} height={18} />
          <span>© {new Date().getFullYear()} Shadow Miracle Records. All rights reserved.</span>
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          <Link href="/privacy-policy" style={{ color: "#aaa", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/terms-of-service" style={{ color: "#aaa", textDecoration: "none" }}>Terms of Service</Link>
        </div>
      </footer>

    </div>
  );
}
