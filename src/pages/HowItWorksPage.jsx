import {
  Search,
  Star,
  Phone,
  User,
  Image as ImageIcon,
  MapPin,
} from "lucide-react";
import { SplitShowcase } from "@/shared/components/sections/SplitShowcase.jsx";
import { usePageTitle } from "@/shared/hooks/usePageTitle.js";
import { ClientCTA } from "@/shared/components/home/ClientCTA.jsx";
import { ProCTA } from "@/shared/components/home/ProCTA.jsx";
import hero from "@/shared/assets/hero.png";
import form from "@/shared/assets/form.png";
import { HowItWorksMotif } from "@/shared/components/ui/HowItWorksMotif.jsx";

const CLIENT_STEPS = [
  {
    icon: Search,
    title: "Je décris mon besoin",
    body: "Choisissez un métier et un quartier à Brazzaville. La recherche ne montre que des profils publiés et complétés.",
  },
  {
    icon: Star,
    title: "Je compare les profils",
    body: "Consultez les réalisations, l\u2019expérience, la disponibilité et les avis avant de vous décider.",
  },
  {
    icon: Phone,
    title: "Je contacte directement",
    body: "Téléphone et WhatsApp sont visibles sur chaque fiche publique. Appelez ou écrivez pour convenir d\u2019un rendez-vous.",
  },
];

const PRO_STEPS = [
  {
    icon: User,
    title: "Je crée mon profil",
    body: "En moins d\u2019une minute : votre métier, vos zones d\u2019intervention et une courte description de votre savoir-faire.",
  },
  {
    icon: ImageIcon,
    title: "Je montre mes réalisations",
    body: "Ajoutez jusqu\u2019à 10 photos de vos chantiers. Votre profil devient public dès que la checklist est complète.",
  },
  {
    icon: MapPin,
    title: "Je reçois les clients",
    body: "Les clients de votre ville vous trouvent, vous appellent ou vous écrivent directement. Activez la disponibilité quand vous êtes libre.",
  },
];

export function HowItWorksPage() {
  usePageTitle("Comment ça marche");
  return (
    <div>
      <section className="relative overflow-hidden bg-kop-mint py-8 lg:py-16">
        <HowItWorksMotif />
        <div className="container-kop relative z-10">
          <p className="text-xs font-bold uppercase tracking-wider text-primary-500">
            Comment ça marche ?
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Deux parcours, une même rencontre.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
            KOP simplifie la mise en relation entre les particuliers et les
            artisans du bâtiment au Congo.
          </p>
        </div>
      </section>
      <SplitShowcase
        eyebrow="Côté client"
        title="Le parcours client."
        intro="Trouver le bon artisan près de chez vous, sans intermédiaire et sans engagement."
        imageSrc={hero}
        imageAlt="Client à la recherche d'un artisan"
        caption={[
          "Chercher, comparer, rencontrer",
          "Votre projet en trois étapes simples.",
        ]}
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
        caption={[
          "Se faire connaître, chez soi",
          "Votre savoir-faire, visible dans votre quartier.",
        ]}
        items={PRO_STEPS}
        reverse
        bg="bg-kop-mint"
        sectionClassName="py-8 lg:py-16"
      />
      <ProCTA imageLeft />
    </div>
  );
}
