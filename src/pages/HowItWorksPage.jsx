import { Search, Star, Phone, User, Image as ImageIcon, MapPin } from 'lucide-react';
import { SplitShowcase } from '@/shared/components/sections/SplitShowcase.jsx';
import { usePageTitle } from '@/shared/hooks/usePageTitle.js';
import { ClientCTA } from '@/shared/components/home/ClientCTA.jsx';
import { ProCTA } from '@/shared/components/home/ProCTA.jsx';
import hero from '@/shared/assets/hero.png';
import form from '@/shared/assets/form.png';

const CLIENT_STEPS = [
  { icon: Search, title: 'Je décris mon besoin', body: 'Choisissez un métier et un quartier à Brazzaville. La recherche ne montre que des profils publiés et complétés.' },
  { icon: Star, title: 'Je compare les profils', body: 'Consultez les réalisations, l\u2019expérience, la disponibilité et les avis avant de vous décider.' },
  { icon: Phone, title: 'Je contacte directement', body: 'Téléphone et WhatsApp sont visibles sur chaque fiche publique. Appelez ou écrivez pour convenir d\u2019un rendez-vous.' },
];

const PRO_STEPS = [
  { icon: User, title: 'Je crée mon profil', body: 'En moins d\u2019une minute : votre métier, vos zones d\u2019intervention et une courte description de votre savoir-faire.' },
  { icon: ImageIcon, title: 'Je montre mes réalisations', body: 'Ajoutez jusqu\u2019à 10 photos de vos chantiers. Votre profil devient public dès que la checklist est complète.' },
  { icon: MapPin, title: 'Je reçois les clients', body: 'Les clients de votre ville vous trouvent, vous appellent ou vous écrivent directement. Activez la disponibilité quand vous êtes libre.' },
];

export function HowItWorksPage() {
  usePageTitle('Comment ça marche');
  return (
    <div>
      <section className="relative overflow-hidden bg-kop-mint py-8 lg:py-16">
        <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMid slice" fill="none">
          <circle cx="90" cy="50" r="60" fill="#2d5c4a" opacity="0.05" />
          <circle cx="1350" cy="350" r="90" fill="#2d5c4a" opacity="0.05" />
          <rect x="220" y="250" width="70" height="70" rx="16" transform="rotate(18 255 285)" fill="#2d5c4a" opacity="0.07" />
          <rect x="1180" y="60" width="60" height="60" rx="14" transform="rotate(-14 1210 90)" fill="#2d5c4a" opacity="0.07" />
          <polygon points="640,300 700,230 760,300" fill="#2d5c4a" opacity="0.06" />
          <circle cx="700" cy="70" r="24" fill="none" stroke="#2d5c4a" strokeWidth="6" opacity="0.1" />
          <circle cx="430" cy="80" r="12" fill="#2d5c4a" opacity="0.1" />
          <polygon points="1240,280 1275,294 1248,314" fill="#2d5c4a" opacity="0.1" />
          <path d="M90 320 Q145 290 200 315" stroke="#2d5c4a" strokeWidth="5" opacity="0.1" />
          <circle cx="330" cy="210" r="18" fill="none" stroke="#2d5c4a" strokeWidth="5" opacity="0.09" />
          <rect x="620" y="40" width="30" height="30" rx="9" transform="rotate(28 635 55)" fill="#2d5c4a" opacity="0.08" />
          <rect x="900" y="300" width="44" height="44" rx="11" transform="rotate(-22 922 322)" fill="none" stroke="#2d5c4a" strokeWidth="4" opacity="0.1" />
          <polygon points="230,140 290,140 260,182" fill="#2d5c4a" opacity="0.06" transform="rotate(-16 260 161)" />
          <circle cx="1010" cy="70" r="9" fill="#2d5c4a" opacity="0.12" />
          <circle cx="540" cy="50" r="6" fill="none" stroke="#2d5c4a" strokeWidth="4" opacity="0.12" />
          <path d="M1120 90 q28 -20 56 0 q28 20 56 0" stroke="#2d5c4a" strokeWidth="5" opacity="0.09" />
          <rect x="470" y="310" width="22" height="22" rx="6" transform="rotate(40 481 321)" fill="#2d5c4a" opacity="0.09" />
          <polygon points="1300,80 1340,80 1320,118" fill="none" stroke="#2d5c4a" strokeWidth="4" opacity="0.09" transform="rotate(18 1320 99)" />
        </svg>
        <div className="container-kop relative z-10">
          <p className="text-xs font-bold uppercase tracking-wider text-primary-500">Comment ça marche ?</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Deux parcours, une même rencontre.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
            KOP simplifie la mise en relation entre les particuliers et les artisans du bâtiment au Congo.
          </p>
        </div>
      </section>
      <SplitShowcase
        eyebrow="Côté client"
        title="Le parcours client."
        intro="Trouver le bon artisan près de chez vous, sans intermédiaire et sans engagement."
        imageSrc={hero}
        imageAlt="Client à la recherche d'un artisan"
        caption={['Chercher, comparer, rencontrer', 'Votre projet en trois étapes simples.']}
        items={CLIENT_STEPS}
        bg="bg-white"
        sectionClassName="py-8 lg:py-16"
      />
      <ClientCTA />
      <SplitShowcase
        eyebrow="Côté professionnel"
        title="Le parcours pro."
        intro="Rendez-vous visible dans votre ville et recevez les demandes directement."
        imageSrc={form}
        imageAlt="Professionnel KOP à son atelier"
        caption={['Se faire connaître, chez soi', 'Votre savoir-faire, visible dans votre quartier.']}
        items={PRO_STEPS}
        reverse
        bg="bg-kop-mint"
        sectionClassName="py-8 lg:py-16"
      />
      <ProCTA imageLeft />
    </div>
  );
}
