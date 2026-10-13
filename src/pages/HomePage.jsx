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

  // Redondant avec index.html : c'est le titre de la page d'accueil, celui
  // que les crawlers lisent avant d'exécuter quoi que ce soit.
  usePageTitle('KOP');

  // Un professionnel ou un administrateur connaît déjà la plateforme. La page
  // « Comment ça marche » ne lui apprend rien, et « Devenir prestataire » ne
  // lui est plus proposé. Un client, lui, garde les deux.
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