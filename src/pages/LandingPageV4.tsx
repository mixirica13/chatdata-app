import { useEffect } from 'react';
import { HeroSectionV4 } from '@/components/landing-v4/HeroSectionV4';
import { FeaturesSectionV3 } from '@/components/landing-v3/FeaturesSectionV3';
import { WhatsAppDemoSection } from '@/components/landing-v3/WhatsAppDemoSection';
import { HowItWorksV3 } from '@/components/landing-v3/HowItWorksV3';
import { BenefitsSection } from '@/components/landing-v3/BenefitsSection';
import { UseCasesSection } from '@/components/landing-v2/UseCasesSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { useTracking } from '@/hooks/useTracking';

const LandingPageV4 = () => {
  const { trackPageView } = useTracking();

  useEffect(() => {
    // Capture UTM parameters from URL
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source') || undefined;
    const utmMedium = params.get('utm_medium') || undefined;
    const utmCampaign = params.get('utm_campaign') || undefined;
    const utmContent = params.get('utm_content') || undefined;
    const utmTerm = params.get('utm_term') || undefined;

    trackPageView('landing_page_v4', {
      page_version: 'v4',
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_content: utmContent,
      utm_term: utmTerm,
    });
  }, [trackPageView]);

  return (
    <div className="min-h-screen bg-black">
      <HeroSectionV4 />
      <FeaturesSectionV3 />
      <WhatsAppDemoSection />
      <HowItWorksV3 />
      <BenefitsSection />
      <UseCasesSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPageV4;
