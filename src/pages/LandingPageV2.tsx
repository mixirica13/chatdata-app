import { HeroSectionV2 } from '@/components/landing-v2/HeroSectionV2';
import { FeaturesSection } from '@/components/landing-v2/FeaturesSection';
import { ChatDemoSection } from '@/components/landing-v2/ChatDemoSection';
import { WhatsAppSection } from '@/components/landing-v2/WhatsAppSection';
import { UseCasesSection } from '@/components/landing-v2/UseCasesSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

const LandingPageV2 = () => {
  return (
    <div className="min-h-screen bg-black">
      <HeroSectionV2 />
      <FeaturesSection />
      <ChatDemoSection />
      <WhatsAppSection />
      <UseCasesSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPageV2;
