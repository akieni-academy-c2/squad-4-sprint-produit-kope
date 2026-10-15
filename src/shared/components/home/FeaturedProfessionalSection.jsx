import { Link } from "@/shared/components/ui/Link.jsx";
import { Button } from "@/shared/components/ui/Button.jsx";
import { SectionHeader } from "@/shared/components/sections/SectionHeader.jsx";
import { ProfessionalCard } from "@/features/professionals/components/ProfessionalCard.jsx";
import { HOME_FEATURED_PROS } from "@/shared/content/featuredPros.js";
import { ROUTES } from "@/shared/lib/constants.js";
import { ArrowRight } from "lucide-react";

export function FeaturedProfessionalSection() {
  return (
    <section className="bg-[#CDD0D8] py-8 lg:py-16">
      <div className="container-kop">
        <SectionHeader
          eyebrow="Faites connaissance"
          title="Des visages derrière chaque métier."
          intro="Une fuite, un mur à repeindre, une idée à concrétiser ? Rencontrez les professionnels de votre quartier et échangez directement avec eux."
        >
          <Button
            as={Link}
            href={ROUTES.SEARCH}
            variant="outline"
            size="md"
            className="bg-transparent! border-gray-400!"
          >
            Explorer les professionnels{" "}
            <ArrowRight size={16} aria-hidden className="inline" />
          </Button>
        </SectionHeader>
      </div>

      <div className="container-kop grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {HOME_FEATURED_PROS.map((professional) => (
          <div key={professional.id} className="flex h-full flex-col">
            <ProfessionalCard mode="grid" item={professional} homePreview />
          </div>
        ))}
      </div>
    </section>
  );
}
