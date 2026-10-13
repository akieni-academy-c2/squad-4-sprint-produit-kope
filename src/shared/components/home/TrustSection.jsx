import { Star, User, Shield } from 'lucide-react';
import { SplitShowcase } from '@/shared/components/sections/SplitShowcase.jsx';
import confiance from '@/shared/assets/confiance.png';

const ITEMS = [
  { icon: User, title: 'Des profils détaillés', body: 'Le métier, des zones d\'intervention et des réalisations.' },
  { icon: Star, title: 'Des avis vérifiés', body: 'De retours clients pour éclairer votre choix.' },
  { icon: Shield, title: 'Vos coordonnées au bon moment', body: 'Téléphone et WhatsApp visibles sur chaque fiche publique.' },
];

export function TrustSection() {
  return (
    <SplitShowcase
      eyebrow="Un service à taille humaine"
      title="La confiance se construit en échangeant."
      intro="À portée facilite la première rencontre. Vous restez libre de discuter de votre besoin et de vos conditions directement avec le professionnel."
      imageSrc={confiance}
      imageAlt="Professionnel KOP avec son téléphone"
      caption={['Les mains qui font votre quartier', 'Des professionnels, près de chez vous.']}
      items={ITEMS}
    />
  );
}
