import { Handshake, Search, User, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { SearchFilters } from '@/features/search/components/SearchFilters.jsx';
import { FloatingCaption } from '@/shared/components/ui/FloatingCaption.jsx';
import { ImageWithSkeleton } from '@/shared/components/ui/ImageWithSkeleton.jsx';
import { EASE } from '@/shared/motion/timing.js';
import { staggerChild, staggerParent } from '@/shared/motion/stagger.js';
import { ScrollDepth } from '@/shared/motion/ScrollDepth.jsx';
import hero from '@/shared/assets/hero.png';

/**
 * Seul endroit où une chorégraphie se justifie : premier écran, au-dessus de
 * la ligne de flottaison, lu en même temps que le reste. Plus bas, le contenu
 * est déjà voulu et n'a pas besoin d'être annoncé.
 */

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-kop-mint space-y-8 py-8 lg:py-16">
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1440 720" preserveAspectRatio="xMidYMid slice" fill="none">
        <circle cx="80" cy="80" r="80" fill="#2d5c4a" opacity="0.05" />
        <circle cx="1380" cy="620" r="110" fill="#2d5c4a" opacity="0.05" />
        <rect x="240" y="520" width="100" height="100" rx="24" transform="rotate(18 290 570)" fill="#2d5c4a" opacity="0.07" />
        <rect x="1080" y="120" width="80" height="80" rx="18" transform="rotate(-14 1120 160)" fill="#2d5c4a" opacity="0.07" />
        <polygon points="660,560 720,490 780,560" fill="#2d5c4a" opacity="0.06" />
        <circle cx="700" cy="120" r="30" fill="none" stroke="#2d5c4a" strokeWidth="7" opacity="0.1" />
        <circle cx="420" cy="120" r="14" fill="#2d5c4a" opacity="0.1" />
        <polygon points="1240,540 1272,556 1246,576" fill="#2d5c4a" opacity="0.1" />
        <path d="M90 620 Q150 580 210 610" stroke="#2d5c4a" strokeWidth="5" opacity="0.1" />
        <circle cx="330" cy="640" r="22" fill="none" stroke="#2d5c4a" strokeWidth="5" opacity="0.09" />
        <rect x="620" y="70" width="34" height="34" rx="10" transform="rotate(28 637 87)" fill="#2d5c4a" opacity="0.08" />
        <rect x="900" y="600" width="52" height="52" rx="13" transform="rotate(-22 926 626)" fill="none" stroke="#2d5c4a" strokeWidth="4" opacity="0.1" />
        <polygon points="190,260 250,260 220,305" fill="#2d5c4a" opacity="0.06" transform="rotate(-16 220 282)" />
        <circle cx="1010" cy="120" r="10" fill="#2d5c4a" opacity="0.12" />
        <circle cx="540" cy="60" r="7" fill="none" stroke="#2d5c4a" strokeWidth="4" opacity="0.12" />
        <path d="M1120 90 q30 -22 60 0 q30 22 60 0" stroke="#2d5c4a" strokeWidth="5" opacity="0.09" />
        <rect x="430" y="580" width="26" height="26" rx="8" transform="rotate(40 443 593)" fill="#2d5c4a" opacity="0.09" />
        <polygon points="1300,140 1344,140 1322,182" fill="none" stroke="#2d5c4a" strokeWidth="4" opacity="0.09" transform="rotate(18 1322 161)" />
        <circle cx="60" cy="340" r="6" fill="#2d5c4a" opacity="0.13" />
        <circle cx="1380" cy="340" r="5" fill="none" stroke="#2d5c4a" strokeWidth="3" opacity="0.13" />
        <path d="M850 430 l28 -34 l28 34" stroke="#2d5c4a" strokeWidth="5" opacity="0.09" />
        <rect x="1140" y="420" width="20" height="20" rx="6" transform="rotate(-30 1150 430)" fill="#2d5c4a" opacity="0.09" />
        <circle cx="950" cy="300" r="4" fill="#2d5c4a" opacity="0.14" />
      </svg>
      <ScrollDepth
        className="container-kop relative z-10 grid gap-8 lg:gap-10 lg:grid-cols-2 lg:items-center"
        text={
          <motion.div
            variants={staggerParent(5)}
            initial={false}
            animate="animate"
            className="space-y-8"
          >
            <motion.p variants={staggerChild} className='text-primary-500 font-semibold'><Handshake size={16} aria-hidden className="inline" /> LES SAVOIR-FAIRE DU CONGO </motion.p>
            <motion.h1 variants={staggerChild} className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-[56px] lg:leading-[1.05]">
              Le bon artisan.
              Tout près de vous.
            </motion.h1>
            <motion.p variants={staggerChild} className="mt-5 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
              Une fuite, un mur à repeindre, une idée à concrétiser ? Rencontrez les
              professionnels de votre quartier et échangez directement avec eux.
            </motion.p>
            <motion.ul variants={staggerChild} className="mt-8 hidden flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 sm:flex">
              <li className="flex items-center gap-2 border border-gray-400  font-medium px-3 py-1.5 rounded-full"><User size={16} aria-hidden />Des profils à découvrir</li>
              <li className="flex items-center gap-2 border border-gray-400 font-medium px-3 py-1.5 rounded-full"><Phone size={16} aria-hidden />Un contact direct</li>
            </motion.ul>
          </motion.div>
        }
        visual={
          <motion.div
            variants={{
              initial: { opacity: 0, scale: 1.03 },
              animate: { opacity: 1, scale: 1, transition: { duration: 0.32, ease: EASE.enter } },
            }}
            className="relative mx-auto w-full max-w-130"
          >
            <div className="rounded-[16px] overflow-hidden  ">
              <ImageWithSkeleton
                src={hero}
                alt="Artisanne KOP"
                eager
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
          <span className="inline-flex items-center gap-2"><Search size={14} aria-hidden /> Recherche par mot-clé</span>
        </p>
        <div className="bg-white rounded-r-[16px] rounded-bl-[16px] border border-[#B9C2BE] p-3 sm:p-5">

          <SearchFilters variant="home" />

        </div>
      </aside>
      <p className="container-kop relative z-10 -mt-4  text-[11px] text-gray-500">
        Une recherche simple : un métier, un quartier, puis une rencontre.
      </p>
    </section>
  )
}
