import { Star, User, Shield } from 'lucide-react';
import { SplitShowcase } from '@/shared/components/sections/SplitShowcase.jsx';
import { HOME_IMAGES } from '@/shared/content/homeImages.js';

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
      imageSrc={HOME_IMAGES.trust.src}
      imageSrcSet={HOME_IMAGES.trust.srcSet}
      imageSizes={HOME_IMAGES.trust.sizes}
      imageAlt="Professionnel KOP avec son téléphone"
      caption={['Les mains qui font votre quartier', 'Des professionnels, près de chez vous.']}
      items={ITEMS}
    />
  );
}
