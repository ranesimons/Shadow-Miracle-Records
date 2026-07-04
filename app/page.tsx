import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", color: "#111111", fontFamily: "sans-serif" }}>

      {/* Nav */}
      <header style={{ borderBottom: "1px solid #e5e5e5", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Image src="/smr.png" alt="Shadow Miracle Records" width={36} height={36} />
          <span style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "0.04em" }}>Shadow Miracle Records</span>
        </div>
        <nav style={{ display: "flex", gap: "32px", fontSize: "0.9rem" }}>
          <Link href="/artists" style={{ color: "#444", textDecoration: "none" }}>Artists</Link>
          <Link href="/track" style={{ color: "#444", textDecoration: "none" }}>Charts</Link>
          <a href="https://ranesimons.streetteam.fm/join" target="_blank" rel="noopener noreferrer" style={{ color: "#444", textDecoration: "none" }}>Community</a>
          <Link href="/privacy-policy" style={{ color: "#444", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/terms-of-service" style={{ color: "#444", textDecoration: "none" }}>Terms of Service</Link>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "96px 24px 80px", borderBottom: "1px solid #e5e5e5" }}>
        <Image
          className="Smrlogo"
          src="/smr.png"
          alt="Shadow Miracle Records"
          width={100}
          height={100}
          style={{ marginBottom: "32px" }}
        />
        <h1 style={{ fontSize: "2.8rem", fontWeight: 700, marginBottom: "16px", lineHeight: 1.2 }}>
          Shadow Miracle Records
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#555", maxWidth: "520px", margin: "0 auto 40px", lineHeight: 1.7 }}>
          An independent music label developing and distributing original music across all major platforms.
        </p>
        <a
          href="https://ranesimons.streetteam.fm/join"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-block", backgroundColor: "#111", color: "#fff", padding: "14px 36px", borderRadius: "9999px", fontWeight: 600, textDecoration: "none", fontSize: "1rem" }}
        >
          Join the Community
        </a>
      </section>

      {/* Features */}
      <section style={{ maxWidth: "960px", margin: "0 auto", padding: "80px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "48px" }}>
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "12px" }}>Artist Roster</h2>
          <p style={{ color: "#555", lineHeight: 1.7, marginBottom: "16px" }}>
            Discover the artists signed to Shadow Miracle Records and track their chart performance across Billboard charts.
          </p>
          <Link href="/artists" style={{ color: "#111", fontWeight: 600, textDecoration: "underline" }}>View Artists →</Link>
        </div>
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "12px" }}>Billboard Charts</h2>
          <p style={{ color: "#555", lineHeight: 1.7, marginBottom: "16px" }}>
            Search Billboard chart history by song or artist. Track placements across multiple chart categories over time.
          </p>
          <Link href="/track" style={{ color: "#111", fontWeight: 600, textDecoration: "underline" }}>Search Charts →</Link>
        </div>
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "12px" }}>Social Media</h2>
          <p style={{ color: "#555", lineHeight: 1.7, marginBottom: "16px" }}>
            Follow Shadow Miracle Records on TikTok, YouTube, Instagram, and Facebook for new music, updates, and behind-the-scenes content.
          </p>
          <a href="https://ranesimons.streetteam.fm/join" target="_blank" rel="noopener noreferrer" style={{ color: "#111", fontWeight: 600, textDecoration: "underline" }}>Follow Us →</a>
        </div>
      </section>

      {/* About */}
      <section style={{ backgroundColor: "#f9f9f9", borderTop: "1px solid #e5e5e5", borderBottom: "1px solid #e5e5e5", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "16px" }}>About the Label</h2>
          <p style={{ color: "#555", lineHeight: 1.8 }}>
            Shadow Miracle Records is an independent music label focused on discovering and elevating original artists.
            We manage content distribution across TikTok, YouTube, Instagram, and Facebook, and track chart performance
            to help our artists grow their audience and reach.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "32px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", fontSize: "0.85rem", color: "#888" }}>
        <span>© {new Date().getFullYear()} Shadow Miracle Records. All rights reserved.</span>
        <div style={{ display: "flex", gap: "24px" }}>
          <Link href="/privacy-policy" style={{ color: "#888", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/terms-of-service" style={{ color: "#888", textDecoration: "none" }}>Terms of Service</Link>
        </div>
      </footer>

    </div>
  );
}
