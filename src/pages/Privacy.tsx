import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { ArrowLeft } from 'lucide-react';

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-black sticky top-0 z-50 backdrop-blur-lg bg-black/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo className="h-10 w-auto" />
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-2 text-white hover:text-[#46CCC6] hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Privacy Policy
          </h1>

          <p className="text-white/60 mb-8">
            <strong className="text-white">Last updated:</strong> {new Date().toLocaleDateString('en-US')}
          </p>

          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                1. Introduction
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                ChatData ("ChatData", "we", "us", or "our") is committed to protecting the privacy and
                security of your personal data. This Privacy Policy describes how we collect, use, store,
                share, and protect your information when you use our Meta Ads MCP Server platform.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                Our MCP (Model Context Protocol) Server enables AI assistants to securely connect to your
                Meta Ads accounts, allowing natural language queries and analytics. This policy explains
                how we handle data in this context.
              </p>
              <p className="text-white/70 leading-relaxed">
                By using our services, you consent to the terms of this Privacy Policy. If you do not
                agree with any part of this policy, please do not use our services.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                2. Definitions
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                For the purposes of this policy:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li><strong className="text-white">Personal Data:</strong> Information related to an identified or identifiable natural person</li>
                <li><strong className="text-white">Processing:</strong> Any operation performed on personal data (collection, storage, use, disclosure, deletion, etc.)</li>
                <li><strong className="text-white">Data Subject:</strong> The natural person to whom the personal data refers</li>
                <li><strong className="text-white">Data Controller:</strong> The entity that determines the purposes and means of processing personal data (ChatData)</li>
                <li><strong className="text-white">MCP Server:</strong> Our Model Context Protocol server that facilitates connections between AI assistants and Meta Ads data</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                3. Personal Data We Collect
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">3.1. Data you provide directly:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70 mb-4">
                <li><strong className="text-white">Account data:</strong> Name, email address, company name (optional)</li>
                <li><strong className="text-white">Authentication data:</strong> Email and encrypted password, or OAuth tokens (Google/Meta login)</li>
                <li><strong className="text-white">Payment data:</strong> Credit card and billing information (processed by Stripe; we do not store complete card data)</li>
                <li><strong className="text-white">Communication data:</strong> Messages sent through our support channels</li>
              </ul>

              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">3.2. Data collected automatically:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70 mb-4">
                <li><strong className="text-white">Usage data:</strong> Pages accessed, features used, session duration, clicks and interactions</li>
                <li><strong className="text-white">Technical data:</strong> IP address, browser type, operating system, device information</li>
                <li><strong className="text-white">Location data:</strong> Approximate country and city based on IP address</li>
                <li><strong className="text-white">MCP usage data:</strong> API calls, query patterns, error logs (anonymized)</li>
              </ul>

              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">3.3. Data from integrated platforms:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li><strong className="text-white">Meta Ads (Facebook/Instagram):</strong> Campaign data, performance metrics, ad spend, reach, conversions, audience data</li>
                <li><strong className="text-white">Google (authentication):</strong> Name, email, profile picture (when you opt for Google login)</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                4. Purposes of Data Processing
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                We use your personal data for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li><strong className="text-white">Service provision:</strong> Provide access to the MCP Server, process Meta Ads queries, generate insights and analytics</li>
                <li><strong className="text-white">Account management:</strong> Create and manage your user account, authenticate access, personalize your experience</li>
                <li><strong className="text-white">Payment processing:</strong> Process subscription charges, issue invoices, manage cancellations and refunds</li>
                <li><strong className="text-white">Communication:</strong> Send service notifications, respond to support requests, provide product updates</li>
                <li><strong className="text-white">Marketing (with consent):</strong> Send newsletters, special offers, and promotional materials (you can unsubscribe at any time)</li>
                <li><strong className="text-white">Service improvement:</strong> Analyze platform usage to improve features, fix bugs, and develop new capabilities</li>
                <li><strong className="text-white">Security:</strong> Detect and prevent fraud, abuse, illegal activities, and Terms of Service violations</li>
                <li><strong className="text-white">Legal compliance:</strong> Meet legal requirements, court orders, and government requests</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                5. Legal Basis for Processing
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                We process your personal data based on the following legal grounds:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li><strong className="text-white">Contract performance:</strong> To provide the services you have subscribed to</li>
                <li><strong className="text-white">Consent:</strong> For marketing communications and non-essential cookies</li>
                <li><strong className="text-white">Legitimate interest:</strong> For service improvement, security, and fraud prevention</li>
                <li><strong className="text-white">Legal obligation:</strong> For tax compliance and responding to legal requests</li>
                <li><strong className="text-white">Exercise of rights:</strong> For defense in legal or administrative proceedings</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                6. Data Sharing
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">6.1. We do not sell your personal data.</strong> We may share your data in the following situations:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70 mb-4">
                <li><strong className="text-white">Service providers:</strong> Companies that help us operate the platform (hosting, payments, analytics, email)</li>
                <li><strong className="text-white">Government authorities:</strong> When required by law, court order, or regulation</li>
                <li><strong className="text-white">Business partners:</strong> With your explicit consent for specific integrations</li>
                <li><strong className="text-white">Business successors:</strong> In case of merger, acquisition, or sale of assets</li>
                <li><strong className="text-white">Rights protection:</strong> To protect our legal rights, property, or safety</li>
              </ul>

              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">6.2. Key third-party service providers:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li><strong className="text-white">Supabase:</strong> Database infrastructure and authentication (servers in the USA)</li>
                <li><strong className="text-white">Stripe:</strong> Credit card payment processing</li>
                <li><strong className="text-white">Vercel:</strong> Web application hosting</li>
                <li><strong className="text-white">Meta/Facebook:</strong> APIs for Meta Ads integration</li>
                <li><strong className="text-white">Anthropic:</strong> AI processing for insights (anonymized data only)</li>
              </ul>

              <p className="text-white/70 leading-relaxed mt-4">
                All our partners are contractually obligated to protect your personal data and use it
                only for the specific purposes for which it was shared.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                7. International Data Transfers
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Some of our service providers are located outside your country of residence, particularly
                in the United States. By using our services, you consent to the international transfer
                of your personal data.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                We ensure all international data transfers comply with applicable data protection laws
                and include appropriate safeguards, such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li>Standard contractual clauses approved by relevant data protection authorities</li>
                <li>Vendor compliance certifications (SOC 2, ISO 27001)</li>
                <li>Contractual commitment to equivalent data protection standards</li>
                <li>Anonymization and pseudonymization mechanisms where applicable</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                8. Data Security
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                We implement robust technical and organizational measures to protect your personal data
                against unauthorized access, loss, alteration, disclosure, or destruction, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70 mb-4">
                <li><strong className="text-white">Encryption:</strong> Sensitive data encrypted in transit (TLS/SSL) and at rest (AES-256)</li>
                <li><strong className="text-white">Authentication:</strong> Secure authentication system with encrypted passwords (bcrypt) and optional two-factor authentication</li>
                <li><strong className="text-white">Access control:</strong> Data access restricted to authorized personnel who need it for their functions</li>
                <li><strong className="text-white">Monitoring:</strong> Security logs and continuous monitoring to detect suspicious activities</li>
                <li><strong className="text-white">Backups:</strong> Regular backups and data redundancy to prevent information loss</li>
                <li><strong className="text-white">Audits:</strong> Periodic security reviews and vulnerability testing</li>
                <li><strong className="text-white">MCP Security:</strong> Secure token-based authentication for all MCP server connections</li>
              </ul>

              <p className="text-white/70 leading-relaxed">
                Despite all efforts, no system is 100% secure. In case of a security incident that may
                generate risk or damage to data subjects, we will notify you and relevant authorities
                as required by law.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                9. Data Retention
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                We retain your personal data only for as long as necessary to fulfill the purposes for
                which it was collected, including legal, accounting, or reporting requirements.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70 mb-4">
                <li><strong className="text-white">Active account data:</strong> While your account is active and for the legal limitation period after cancellation</li>
                <li><strong className="text-white">Payment data:</strong> Up to 5 years after the last transaction (tax requirements)</li>
                <li><strong className="text-white">Communication data:</strong> Up to 2 years after the last contact</li>
                <li><strong className="text-white">Access logs:</strong> Up to 6 months</li>
                <li><strong className="text-white">Anonymized data:</strong> May be retained indefinitely for statistical analysis</li>
              </ul>

              <p className="text-white/70 leading-relaxed">
                After the retention period, your data will be securely deleted or irreversibly anonymized.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                10. Your Rights as a Data Subject
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Depending on your jurisdiction, you may have the following rights regarding your personal data:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70 mb-4">
                <li><strong className="text-white">Access:</strong> Confirm the existence of processing and access your data</li>
                <li><strong className="text-white">Correction:</strong> Request correction of incomplete, inaccurate, or outdated data</li>
                <li><strong className="text-white">Deletion:</strong> Request deletion of unnecessary, excessive, or non-compliant data</li>
                <li><strong className="text-white">Portability:</strong> Request portability of data to another service provider (structured, interoperable format)</li>
                <li><strong className="text-white">Restriction:</strong> Request restriction of processing under certain circumstances</li>
                <li><strong className="text-white">Objection:</strong> Object to processing based on legitimate interests</li>
                <li><strong className="text-white">Withdrawal of consent:</strong> Withdraw consent at any time</li>
                <li><strong className="text-white">Information:</strong> Obtain information about entities with which we share data</li>
                <li><strong className="text-white">Automated decisions:</strong> Request review of decisions made solely through automated processing</li>
              </ul>

              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">How to exercise your rights:</strong>
              </p>
              <p className="text-white/70 leading-relaxed">
                To exercise any of these rights, contact us at <strong className="text-white">privacy@chatdata.com.br</strong>.
                We will respond to your request within 30 days, which may be extended by an additional 30 days
                with justification. We may request additional information to verify your identity before
                processing your request.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                11. Cookies and Tracking Technologies
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                We use cookies and similar technologies to improve your experience, analyze platform
                usage, and personalize content. You can manage your cookie preferences through your
                browser settings.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">Types of cookies used:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li><strong className="text-white">Essential cookies:</strong> Necessary for basic platform functionality (authentication, security)</li>
                <li><strong className="text-white">Performance cookies:</strong> Collect information about how you use the platform for improvements</li>
                <li><strong className="text-white">Functional cookies:</strong> Remember your preferences and personalize your experience</li>
                <li><strong className="text-white">Marketing cookies:</strong> Used to display relevant ads (only with your consent)</li>
              </ul>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                12. Children's Privacy
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Our services are intended for persons 18 years of age or older. We do not knowingly
                collect personal data from children under 18 without parental or guardian consent.
              </p>
              <p className="text-white/70 leading-relaxed">
                If we become aware that we have collected data from a minor without proper authorization,
                we will take immediate steps to delete that information. If you believe we may have
                data from a minor, please contact us immediately.
              </p>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                13. Changes to This Policy
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                We may update this Privacy Policy periodically to reflect changes in our practices,
                legislation, or services. When we make material changes, we will notify you by email
                or through a prominent notice on the platform at least 15 days in advance.
              </p>
              <p className="text-white/70 leading-relaxed">
                We recommend that you review this policy regularly. The date of the last update is
                indicated at the top of this page. Continued use of services after the changes take
                effect constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                14. Contact
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                For questions about this Privacy Policy or to exercise your rights as a data subject,
                please use the following channels:
              </p>
              <div className="bg-white/5 border border-white/10 p-6 rounded-lg space-y-2">
                <p className="text-white/70">
                  <strong className="text-white">ChatData</strong>
                </p>
                <p className="text-white/70">
                  <strong className="text-white">General email:</strong> support@chatdata.com.br
                </p>
                <p className="text-white/70">
                  <strong className="text-white">Privacy inquiries:</strong> privacy@chatdata.com.br
                </p>
                <p className="text-white/70">
                  <strong className="text-white">Website:</strong> https://chatdata.com.br
                </p>
              </div>
            </section>

            {/* Consent */}
            <section className="border-t border-white/10 pt-8 mt-8">
              <p className="text-white/70 leading-relaxed font-medium">
                By using ChatData, you acknowledge that you have read, understood, and agreed to the
                terms of this Privacy Policy and to the processing of your personal data as described herein.
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-6 text-center text-white/40 text-sm">
          <p>&copy; {new Date().getFullYear()} ChatData. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;
