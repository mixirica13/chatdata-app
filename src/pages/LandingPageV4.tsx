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

const LandingPageV4 = () => {
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
