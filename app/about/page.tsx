import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", color: "#111111", fontFamily: "sans-serif" }}>

      <header style={{ borderBottom: "1px solid #e5e5e5", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
          <Image src="/smr.png" alt="Shadow Miracle Records" width={32} height={32} />
          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Shadow Miracle Records</span>
        </Link>
        <nav style={{ display: "flex", gap: "28px", fontSize: "0.88rem" }}>
          <Link href="/artists" style={{ color: "#444", textDecoration: "none" }}>Artists</Link>
          <Link href="/track" style={{ color: "#444", textDecoration: "none" }}>Charts</Link>
          <Link href="/privacy-policy" style={{ color: "#444", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/terms-of-service" style={{ color: "#444", textDecoration: "none" }}>Terms of Service</Link>
        </nav>
      </header>

      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "64px 24px" }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", color: "#999", marginBottom: "12px", textTransform: "uppercase" }}>About</p>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "20px", lineHeight: 1.2 }}>Shadow Miracle Records</h1>

        <p style={{ fontSize: "1rem", color: "#444", lineHeight: 1.8, marginBottom: "24px" }}>
          Shadow Miracle Records is an independent music label based in Texas, United States. We sign, develop, and distribute original music across all major streaming platforms, with a focus on helping emerging artists build sustainable careers in the digital music industry.
        </p>

        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "12px", marginTop: "40px" }}>What we do</h2>
        <p style={{ color: "#555", lineHeight: 1.8, marginBottom: "16px" }}>
          We provide end-to-end label services including music production, mixing, digital distribution, branding, and social media strategy. Our in-house tools allow label staff to manage content publishing directly to platforms like TikTok using their official Content Posting API.
        </p>

        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "12px", marginTop: "40px" }}>Our TikTok integration</h2>
        <p style={{ color: "#555", lineHeight: 1.8, marginBottom: "16px" }}>
          Shadow Miracle Records uses TikTok&apos;s Content Posting API v2 to publish video content on behalf of label artists. Authorized users can connect their TikTok account, upload videos to secure cloud storage, configure post settings, and publish directly — all from a single content calendar dashboard on this website.
        </p>
        <p style={{ color: "#555", lineHeight: 1.8, marginBottom: "16px" }}>
          Access to the dashboard requires authentication with a TikTok account that has been authorized to use the application. This integration complies with TikTok&apos;s platform policies, including content disclosure requirements.
        </p>

        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "12px", marginTop: "40px" }}>Contact</h2>
        <p style={{ color: "#555", lineHeight: 1.8 }}>
          For artist inquiries, licensing questions, or information about our services, contact us at{" "}
          <a href="mailto:rane@ranesimons.com" style={{ color: "#111", fontWeight: 600 }}>rane@ranesimons.com</a>.
        </p>
      </main>

      <footer style={{ borderTop: "1px solid #e5e5e5", padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem", color: "#aaa" }}>
        <span>© {new Date().getFullYear()} Shadow Miracle Records</span>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link href="/privacy-policy" style={{ color: "#aaa", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/terms-of-service" style={{ color: "#aaa", textDecoration: "none" }}>Terms of Service</Link>
        </div>
      </footer>

    </div>
  );
}
