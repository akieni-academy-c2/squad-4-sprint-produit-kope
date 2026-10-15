import { Handshake, Search, User, Phone } from "lucide-react";
import { motion } from "motion/react";
import { SearchFilters } from "@/features/search/components/SearchFilters.jsx";
import { FloatingCaption } from "@/shared/components/ui/FloatingCaption.jsx";
import { ImageWithSkeleton } from "@/shared/components/ui/ImageWithSkeleton.jsx";
import { EASE } from "@/shared/motion/timing.js";
import { staggerChild, staggerParent } from "@/shared/motion/stagger.js";
import { ScrollDepth } from "@/shared/motion/ScrollDepth.jsx";
import { HOME_IMAGES } from "@/shared/content/homeImages.js";
import { HeroMotif } from "@/shared/components/ui/HeroMotif.jsx";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-kop-mint space-y-8 py-8 lg:py-16">
      <HeroMotif />
      <ScrollDepth
        className="container-kop relative z-10 grid gap-8 lg:gap-10 lg:grid-cols-2 lg:items-center"
        text={
          <motion.div
            variants={staggerParent(5)}
            initial={false}
            animate="animate"
            className="space-y-8"
          >
            <motion.p
              variants={staggerChild}
              className="text-primary-500 font-semibold"
            >
              <Handshake size={16} aria-hidden className="inline" /> LES
              SAVOIR-FAIRE DU CONGO{" "}
            </motion.p>
            <motion.h1
              variants={staggerChild}
              className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-[56px] lg:leading-[1.05]"
            >
              Le bon artisan. Tout près de vous.
            </motion.h1>
            <motion.p
              variants={staggerChild}
              className="mt-5 max-w-xl text-base leading-7 text-gray-600 sm:text-lg"
            >
              Une fuite, un mur à repeindre, une idée à concrétiser ? Rencontrez
              les professionnels de votre quartier et échangez directement avec
              eux.
            </motion.p>
            <motion.ul
              variants={staggerChild}
              className="mt-8 hidden flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 sm:flex"
            >
              <li className="flex items-center gap-2 border border-gray-400  font-medium px-3 py-1.5 rounded-full">
                <User size={16} aria-hidden />
                Des profils à découvrir
              </li>
              <li className="flex items-center gap-2 border border-gray-400 font-medium px-3 py-1.5 rounded-full">
                <Phone size={16} aria-hidden />
                Un contact direct
              </li>
            </motion.ul>
          </motion.div>
        }
        visual={
          <motion.div
            variants={{
              initial: { opacity: 0, scale: 1.03 },
              animate: {
                opacity: 1,
                scale: 1,
                transition: { duration: 0.32, ease: EASE.enter },
              },
            }}
            className="relative mx-auto w-full max-w-130"
          >
            <div className="rounded-[16px] overflow-hidden  ">
              <ImageWithSkeleton
                src={HOME_IMAGES.hero.src}
                srcSet={HOME_IMAGES.hero.srcSet}
                sizes={HOME_IMAGES.hero.sizes}
                alt="Artisanne KOP"
                priority
                ratio="h-85 sm:h-100"
                skeletonClassName="bg-accent-500/30"
              />
              <FloatingCaption
                align="right"
                title="Les mains qui font votre quartier"
                subtitle="Des professionnels, près de chez vous."
              />
            </div>
          </motion.div>
        }
      />

      <aside className="container-kop relative -space-y-px z-10">
        <p className="bg-[#F5F6F6] rounded-t-sm border border-[#B9C2BE] border-b-transparent  px-4 py-2 inline-flex items-center gap-2 text-xs font-semibold text-gray-600">
          <span className="inline-flex items-center gap-2">
            <Search size={14} aria-hidden /> Recherche par mot-clé
          </span>
        </p>
        <div className="bg-white rounded-r-[16px] rounded-bl-[16px] border border-[#B9C2BE] p-3 sm:p-5">
          <SearchFilters variant="home" />
        </div>
      </aside>
      <p className="container-kop relative z-10 -mt-4  text-[11px] text-gray-500">
        Une recherche simple : un métier, un quartier, puis une rencontre.
      </p>
    </section>
  );
}
