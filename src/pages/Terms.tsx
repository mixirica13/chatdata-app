import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
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
            Terms of Service
          </h1>

          <p className="text-white/60 mb-8">
            <strong className="text-white">Last updated:</strong> {new Date().toLocaleDateString('en-US')}
          </p>

          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                1. Acceptance of Terms
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                By accessing and using the ChatData Meta Ads MCP Server ("Service", "Platform", "we", or "our"),
                you ("User", "you", or "your") agree to comply with and be bound by these Terms of Service ("Terms").
                If you do not agree to these Terms, do not use our services.
              </p>
              <p className="text-white/70 leading-relaxed">
                ChatData provides a Model Context Protocol (MCP) server that enables AI assistants to connect
                to and query your Meta Ads data, providing insights and analytics through natural language interactions.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                2. Description of Services
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                The ChatData MCP Server offers the following services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li>MCP (Model Context Protocol) server for Meta Ads integration</li>
                <li>Connection between AI assistants (Claude, etc.) and your Meta Ads accounts</li>
                <li>Natural language querying of campaign data, metrics, and performance</li>
                <li>Real-time access to Meta Ads analytics and insights</li>
                <li>Secure OAuth-based authentication with Meta platforms</li>
                <li>API access for programmatic integrations</li>
              </ul>
              <p className="text-white/70 leading-relaxed mt-4">
                We reserve the right to modify, suspend, or discontinue the Service (or any part thereof)
                temporarily or permanently, with or without notice.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                3. Account Registration
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">3.1. Eligibility:</strong> To use ChatData, you must be at least
                18 years of age and have the legal capacity to enter into binding contracts.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">3.2. Account Information:</strong> When creating an account, you agree
                to provide accurate, current, and complete information. You are responsible for maintaining the
                confidentiality of your credentials and for all activities that occur under your account.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">3.3. Account Security:</strong> You must notify us immediately of any
                unauthorized use of your account or any other security breach.
              </p>
              <p className="text-white/70 leading-relaxed">
                <strong className="text-white">3.4. Meta Account Authorization:</strong> To use the MCP Server, you must
                authorize access to your Meta Ads accounts. You are responsible for ensuring you have the necessary
                permissions to grant this access.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                4. Subscriptions and Payments
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">4.1. Subscription Plans:</strong> ChatData offers different subscription
                plans with varying features and pricing. Details of each plan are available on our pricing page.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">4.2. Billing:</strong> Subscriptions are billed on a recurring basis
                (monthly or annually) through the Stripe payment platform. By subscribing, you authorize automatic
                charges to your registered payment method.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">4.3. Automatic Renewal:</strong> Your subscription will automatically
                renew at the end of each billing period unless you cancel before the renewal date.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">4.4. Price Changes:</strong> We reserve the right to modify subscription
                prices. We will notify you at least 30 days in advance of any price change affecting your active subscription.
              </p>
              <p className="text-white/70 leading-relaxed">
                <strong className="text-white">4.5. Refund Policy:</strong> We offer a 7-day satisfaction guarantee.
                If you are not satisfied with the service, you may request a full refund within the first 7 days
                of your initial subscription. After this period, no prorated refunds are offered.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                5. Cancellation and Suspension
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">5.1. Cancellation by User:</strong> You may cancel your subscription
                at any time through your account settings. Cancellation will take effect at the end of the current
                billing period, and you will retain access to services until that date.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">5.2. Suspension or Termination by ChatData:</strong> We reserve the right
                to suspend or terminate your account if you violate these Terms, engage in fraudulent activities,
                or for any other legitimate reason, with or without prior notice.
              </p>
              <p className="text-white/70 leading-relaxed">
                <strong className="text-white">5.3. Effect of Cancellation:</strong> Upon cancellation, you will lose
                access to platform features. Your data may be retained in accordance with our Privacy Policy and
                legal requirements.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                6. Acceptable Use and Restrictions
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                When using ChatData, you agree NOT to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li>Violate any laws, regulations, or third-party rights</li>
                <li>Use the service for illegal, fraudulent, or harmful purposes</li>
                <li>Attempt to gain unauthorized access to systems, data, or networks</li>
                <li>Interfere with or disrupt the platform's operation</li>
                <li>Use scraping, crawling, or data mining techniques without authorization</li>
                <li>Share your access credentials with third parties</li>
                <li>Reverse engineer, decompile, or disassemble any part of the service</li>
                <li>Send spam, viruses, malware, or any malicious code</li>
                <li>Use the service in ways that violate Meta/Facebook Terms of Service</li>
                <li>Resell or redistribute the service without express written authorization</li>
                <li>Exceed API rate limits or abuse the MCP server endpoints</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                7. Intellectual Property
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">7.1. ChatData Ownership:</strong> All content, features, functionality,
                source code, design, trademarks, logos, and other materials of the platform are exclusively owned
                by ChatData and are protected by intellectual property laws.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">7.2. License to Use:</strong> We grant you a limited, non-exclusive,
                non-transferable, and revocable license to access and use the platform in accordance with these Terms.
              </p>
              <p className="text-white/70 leading-relaxed">
                <strong className="text-white">7.3. Your Data:</strong> You retain all rights to the data you access
                or generate through the platform. You grant us a license to process this data as necessary to
                provide our services.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                8. Privacy and Data Protection
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">8.1. Data Collection and Use:</strong> We collect and process your
                personal data as described in our Privacy Policy, in compliance with applicable data protection laws.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">8.2. Meta Ads Data:</strong> When you connect your Meta Ads accounts,
                you authorize ChatData to access and process data from those platforms to provide our MCP services.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">8.3. Security:</strong> We implement appropriate technical and
                organizational measures to protect your data against unauthorized access, loss, alteration, or disclosure.
              </p>
              <p className="text-white/70 leading-relaxed">
                <strong className="text-white">8.4. Data Rights:</strong> You have the right to access, correct,
                delete, port, revoke consent, and object to the processing of your personal data.
                Contact us to exercise these rights.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                9. Third-Party Integrations
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">9.1. Meta/Facebook:</strong> ChatData integrates with Meta platforms
                (Facebook, Instagram) through their official APIs. When using these integrations, you are also
                subject to Meta's Terms of Service.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">9.2. AI Assistants:</strong> The MCP Server is designed to work with
                AI assistants like Claude. Your use of these AI assistants is subject to their respective terms of service.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">9.3. Responsibility:</strong> We are not responsible for changes,
                interruptions, or discontinuation of third-party APIs or services that may affect ChatData's functionality.
              </p>
              <p className="text-white/70 leading-relaxed">
                <strong className="text-white">9.4. Authorizations:</strong> You are responsible for maintaining the
                necessary authorizations and permissions on third-party platforms for us to access your data.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                10. Disclaimer of Warranties
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
                WE DO NOT WARRANT THAT:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li>The service will meet your specific requirements</li>
                <li>The service will be uninterrupted, timely, secure, or error-free</li>
                <li>The results obtained through the service will be accurate or reliable</li>
                <li>Any errors in the service will be corrected</li>
              </ul>
              <p className="text-white/70 leading-relaxed mt-4">
                The insights and data provided through the MCP Server are based on your Meta Ads data and
                do not constitute professional marketing or business advice. You are responsible for your
                own business decisions.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                11. Limitation of Liability
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, CHATDATA, ITS DIRECTORS, EMPLOYEES, PARTNERS, AND
                AFFILIATES SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, use, or other intangible losses</li>
                <li>Damages resulting from use or inability to use the service</li>
                <li>Damages resulting from unauthorized access to your data</li>
                <li>Damages caused by third-party conduct on the service</li>
              </ul>
              <p className="text-white/70 leading-relaxed mt-4">
                Our total liability for any claim related to the service shall be limited to the amount
                you paid in the 12 months preceding the event giving rise to the claim.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                12. Indemnification
              </h2>
              <p className="text-white/70 leading-relaxed">
                You agree to indemnify, defend, and hold harmless ChatData, its directors, employees, partners,
                and affiliates from any claims, liabilities, damages, losses, and expenses (including legal fees)
                arising from: (a) your use of the service; (b) violation of these Terms; (c) violation of
                third-party rights; or (d) any content you submit or share through the service.
              </p>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                13. Modifications to Terms
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                We reserve the right to modify these Terms at any time. When we make material changes,
                we will notify you by email or through a notice on the platform at least 15 days in advance.
              </p>
              <p className="text-white/70 leading-relaxed">
                Continued use of the service after the changes take effect constitutes your acceptance
                of the new Terms. If you do not agree with the changes, you must cancel your account.
              </p>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                14. Governing Law and Jurisdiction
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                These Terms are governed by the laws of the Federative Republic of Brazil. For users
                outside of Brazil, local consumer protection laws may also apply to the extent they
                provide additional protections.
              </p>
              <p className="text-white/70 leading-relaxed">
                Any disputes arising from these Terms shall be resolved in the courts of the user's
                domicile, in accordance with applicable consumer protection regulations.
              </p>
            </section>

            {/* Section 15 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                15. General Provisions
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">15.1. Entire Agreement:</strong> These Terms, together with our
                Privacy Policy, constitute the entire agreement between you and ChatData.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">15.2. Waiver:</strong> Failure to exercise or enforce any right
                or provision of these Terms shall not constitute a waiver of such right or provision.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">15.3. Severability:</strong> If any provision of these Terms is
                found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong className="text-white">15.4. Assignment:</strong> You may not assign or transfer these
                Terms without our prior written consent. We may assign our rights to any affiliate or successor.
              </p>
              <p className="text-white/70 leading-relaxed">
                <strong className="text-white">15.5. Survival:</strong> Provisions that by their nature should
                survive termination of these Terms (including intellectual property provisions, warranty
                disclaimers, and limitations of liability) shall remain in effect.
              </p>
            </section>

            {/* Section 16 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                16. Contact
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                For questions about these Terms of Service or to exercise your data rights, contact us:
              </p>
              <div className="bg-white/5 border border-white/10 p-6 rounded-lg space-y-2">
                <p className="text-white/70">
                  <strong className="text-white">Email:</strong> support@chatdata.com.br
                </p>
                <p className="text-white/70">
                  <strong className="text-white">Website:</strong> https://chatdata.com.br
                </p>
              </div>
            </section>

            {/* Consent */}
            <section className="border-t border-white/10 pt-8 mt-8">
              <p className="text-white/70 leading-relaxed font-medium">
                By using ChatData, you acknowledge that you have read, understood, and agree to be bound
                by these Terms of Service.
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

export default Terms;
