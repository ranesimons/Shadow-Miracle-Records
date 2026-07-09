import Image from "next/image";
import Link from "next/link";
import SocialMediaDashboard from "@/components/SocialMediaDashboard";

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
      <section style={{ textAlign: "center", padding: "64px 24px 48px", borderBottom: "1px solid #e5e5e5" }}>
        <Image
          className="Smrlogo"
          src="/smr.png"
          alt="Shadow Miracle Records"
          width={100}
          height={100}
          style={{ marginBottom: "24px" }}
        />
        <h1 style={{ fontSize: "2.4rem", fontWeight: 700, marginBottom: "12px", lineHeight: 1.2 }}>
          Shadow Miracle Records
        </h1>
        <p style={{ fontSize: "1rem", color: "#555", maxWidth: "520px", margin: "0 auto 24px", lineHeight: 1.7 }}>
          An independent music label developing and distributing original music across all major platforms.
        </p>
        <a
          href="https://ranesimons.streetteam.fm/join"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-block", backgroundColor: "#111", color: "#fff", padding: "12px 32px", borderRadius: "9999px", fontWeight: 600, textDecoration: "none", fontSize: "0.95rem" }}
        >
          Join the Community
        </a>
      </section>

      {/* Social Media Dashboard */}
      <section style={{ borderBottom: "1px solid #e5e5e5" }}>
        <SocialMediaDashboard />
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
