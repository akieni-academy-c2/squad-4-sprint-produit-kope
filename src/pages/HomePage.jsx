import { HeroSection } from '@/shared/components/home/HeroSection.jsx';
import { CategorySection } from '@/shared/components/home/CategorySection.jsx';
import { FeaturedProfessionalSection } from '@/shared/components/home/FeaturedProfessionalSection.jsx';
import { HowItWorksSection } from '@/shared/components/home/HowItWorksSection.jsx';
import { TrustSection } from '@/shared/components/home/TrustSection.jsx';
import { ZoneSection } from '@/shared/components/home/ZoneSection.jsx';
import { ProCTA } from '@/shared/components/home/ProCTA.jsx';
import { FAQSection } from '@/shared/components/home/FAQSection.jsx';
import { FinalCTA } from '@/shared/components/home/FinalCTA.jsx';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { usePageTitle } from '@/shared/hooks/usePageTitle.js';

export function HomePage() {
  const { isServiceProvider } = useAuthContext();

  usePageTitle('KOP');

  return (
    <>
      <HeroSection />
      <CategorySection />
      <FeaturedProfessionalSection />
      {!isServiceProvider && <HowItWorksSection />}
      <TrustSection />
      <ZoneSection />
      {!isServiceProvider && <ProCTA />}
      <FAQSection />
      <FinalCTA />
    </>
  );
}