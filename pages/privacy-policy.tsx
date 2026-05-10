export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px', fontFamily: 'Georgia, serif', color: '#111', lineHeight: '1.8' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Privacy Policy</h1>
      <p style={{ color: '#555', marginBottom: '32px' }}>Last updated: May 9, 2026</p>

      <p>
        This Privacy Policy describes how Shadow Miracle Records ("we," "us," or "our") collects, uses, and handles
        information when you use our internal content management application at{' '}
        <strong>shadowmiraclerecords.com</strong> (the "App"). This App is used solely by authorized personnel of
        Shadow Miracle Records to manage and publish video content to social media platforms.
      </p>

      <h2 style={{ marginTop: '32px', fontSize: '1.3rem' }}>1. Information We Collect</h2>
      <p>When you authenticate with a third-party platform through the App, we receive and temporarily store:</p>
      <ul>
        <li><strong>OAuth access tokens</strong> — issued by TikTok, YouTube, Facebook, and Instagram to authorize the App to act on your behalf.</li>
        <li><strong>Platform user identifiers</strong> — such as your TikTok open ID, YouTube channel ID, Facebook page ID, and Instagram user ID.</li>
        <li><strong>Video metadata</strong> — titles, descriptions, view counts, and publish dates associated with content you upload through the App.</li>
      </ul>
      <p>We do not collect or store passwords, payment information, or personal contact details.</p>

      <h2 style={{ marginTop: '32px', fontSize: '1.3rem' }}>2. How We Use Your Information</h2>
      <p>We use the information collected solely to:</p>
      <ul>
        <li>Authenticate and authorize upload actions to TikTok, YouTube, Facebook, and Instagram on your behalf.</li>
        <li>Track video performance metrics (views, publish dates) in our internal database.</li>
        <li>Schedule and manage social media content publication.</li>
      </ul>
      <p>We do not sell, rent, or share your information with any third party outside of the platform APIs required to operate the App.</p>

      <h2 style={{ marginTop: '32px', fontSize: '1.3rem' }}>3. TikTok Data</h2>
      <p>
        This App uses the TikTok Content Posting API. By connecting your TikTok account, you authorize the App to
        upload videos, read your video list, and retrieve basic profile information. Access tokens are stored
        locally in your browser session and are not retained on our servers beyond the current session.
        You may revoke access at any time through your TikTok account settings at{' '}
        <a href="https://www.tiktok.com/settings" target="_blank" rel="noreferrer">tiktok.com/settings</a>.
      </p>

      <h2 style={{ marginTop: '32px', fontSize: '1.3rem' }}>4. Data Storage</h2>
      <p>
        Video metadata (titles, view counts, platform video IDs, publish dates) is stored in a private database
        accessible only to authorized Shadow Miracle Records personnel. OAuth tokens are stored in the user's
        browser <code>localStorage</code> and are never transmitted to or stored on our servers.
      </p>

      <h2 style={{ marginTop: '32px', fontSize: '1.3rem' }}>5. Data Retention</h2>
      <p>
        Video metadata is retained for as long as necessary to support content analytics and scheduling.
        Browser-stored tokens expire according to each platform's OAuth policies and are cleared when you log out.
      </p>

      <h2 style={{ marginTop: '32px', fontSize: '1.3rem' }}>6. Security</h2>
      <p>
        We implement reasonable technical measures to protect the information we store. Access to the App and its
        database is restricted to authorized Shadow Miracle Records personnel only.
      </p>

      <h2 style={{ marginTop: '32px', fontSize: '1.3rem' }}>7. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated
        date. Continued use of the App after changes constitutes acceptance of the updated policy.
      </p>

      <h2 style={{ marginTop: '32px', fontSize: '1.3rem' }}>8. Contact</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us at{' '}
        <a href="mailto:info@shadowmiraclerecords.com">info@shadowmiraclerecords.com</a>.
      </p>
    </div>
  );
}
