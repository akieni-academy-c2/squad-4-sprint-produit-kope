import { Link } from '@/shared/components/ui/Link.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';
import { SectionHeader } from '@/shared/components/sections/SectionHeader.jsx';
import { FloatingCaption } from '@/shared/components/ui/FloatingCaption.jsx';
import { ImageWithSkeleton } from '@/shared/components/ui/ImageWithSkeleton.jsx';
import { ROUTES } from '@/shared/lib/constants.js';
import { HIGHLIGHTED_TRADES } from '@/shared/content/highlightedTrades.js';

export function CategorySection() {
  return (
    <section className="container-kop py-8 lg:py-16">
      <SectionHeader
        eyebrow="Pour vos petits et vos grands projets"
        title="De quoi avez-vous besoin ?"
        intro="Une fuite, un mur à repeindre, une idée à concrétiser ? Rencontrez les professionnels de votre quartier et échangez directement avec eux."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {HIGHLIGHTED_TRADES.map((c) => (
          <Link key={c.id} href={`${ROUTES.SEARCH}?trade=${encodeURIComponent(c.tradeId)}`} className="group">
            <Card className="overflow-hidden h-full flex flex-col transition">
              <div className="relative">
                <ImageWithSkeleton
                  src={c.image}
                  srcSet={c.srcSet}
                  sizes={c.sizes}
                  alt={c.name}
                  ratio="aspect-4/5.5"
                  className="transition duration-500 group-hover:scale-[1.04]"
                />
                <FloatingCaption title={c.name} subtitle={c.sub} icon={c.icon} wide />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
