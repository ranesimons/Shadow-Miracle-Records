export default function TermsOfService() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px', fontFamily: 'Georgia, serif', color: '#111', lineHeight: '1.8' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Terms of Service</h1>
      <p style={{ color: '#555', marginBottom: '32px' }}>Last updated: May 9, 2026</p>

      <p>
        These Terms of Service ("Terms") govern your use of the internal content management application
        operated by Shadow Miracle Records ("we," "us," or "our") at <strong>shadowmiraclerecords.com</strong>{' '}
        (the "App"). By accessing or using the App, you agree to be bound by these Terms.
      </p>

      <h2 style={{ marginTop: '32px', fontSize: '1.3rem' }}>1. Permitted Use</h2>
      <p>
        The App is an internal tool provided exclusively to authorized personnel of Shadow Miracle Records.
        You may use the App solely to manage, upload, and analyze video content across connected social media
        platforms (TikTok, YouTube, Facebook, Instagram) on behalf of Shadow Miracle Records.
      </p>
      <p>You agree not to:</p>
      <ul>
        <li>Share your login credentials or access tokens with unauthorized parties.</li>
        <li>Use the App to upload content that violates the terms of any connected platform.</li>
        <li>Use the App for any purpose other than internal content management for Shadow Miracle Records.</li>
        <li>Attempt to reverse-engineer, scrape, or otherwise misuse the App or its integrations.</li>
      </ul>

      <h2 style={{ marginTop: '32px', fontSize: '1.3rem' }}>2. Third-Party Platform Integrations</h2>
      <p>
        The App connects to TikTok, YouTube, Facebook, and Instagram via their respective official APIs.
        Your use of those platforms is governed by their own terms of service:
      </p>
      <ul>
        <li><a href="https://www.tiktok.com/legal/terms-of-service" target="_blank" rel="noreferrer">TikTok Terms of Service</a></li>
        <li><a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer">YouTube Terms of Service</a></li>
        <li><a href="https://www.facebook.com/terms.php" target="_blank" rel="noreferrer">Facebook Terms of Service</a></li>
        <li><a href="https://help.instagram.com/581066165581870" target="_blank" rel="noreferrer">Instagram Terms of Use</a></li>
      </ul>
      <p>
        By connecting a platform account through the App, you confirm that you have the authority to grant
        the App access to that account and that you will comply with the respective platform's terms.
      </p>

      <h2 style={{ marginTop: '32px', fontSize: '1.3rem' }}>3. Content Responsibility</h2>
      <p>
        You are solely responsible for the content you upload through the App. Shadow Miracle Records reserves
        the right to remove access for any user who uploads content that violates applicable laws, platform
        policies, or these Terms.
      </p>

      <h2 style={{ marginTop: '32px', fontSize: '1.3rem' }}>4. Intellectual Property</h2>
      <p>
        All content uploaded through the App remains the intellectual property of Shadow Miracle Records or
        its licensed artists. The App itself, including its design and code, is proprietary to Shadow Miracle Records.
      </p>

      <h2 style={{ marginTop: '32px', fontSize: '1.3rem' }}>5. Disclaimers</h2>
      <p>
        The App is provided "as is." We make no warranties regarding uptime, accuracy, or fitness for a
        particular purpose. We are not liable for any failures or delays caused by third-party platform APIs.
      </p>

      <h2 style={{ marginTop: '32px', fontSize: '1.3rem' }}>6. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, Shadow Miracle Records shall not be liable for any indirect,
        incidental, or consequential damages arising from your use of the App.
      </p>

      <h2 style={{ marginTop: '32px', fontSize: '1.3rem' }}>7. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Changes will be posted on this page with an updated date.
        Continued use of the App after changes constitutes acceptance of the updated Terms.
      </p>

      <h2 style={{ marginTop: '32px', fontSize: '1.3rem' }}>8. Contact</h2>
      <p>
        If you have any questions about these Terms, please contact us at{' '}
        <a href="mailto:info@shadowmiraclerecords.com">info@shadowmiraclerecords.com</a>.
      </p>
    </div>
  );
}
