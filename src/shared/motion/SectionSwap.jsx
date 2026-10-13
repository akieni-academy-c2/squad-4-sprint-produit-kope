import { AnimatePresence, motion } from 'motion/react';
import { sectionSwap } from './variants.js';

/**
 * Colonne centrale d'un tableau de bord : la section affichée y entre et en sort.
 *
 * Changer d'onglet paraissait recharger la page. Aucun rechargement n'avait
 * lieu, mais le contenu disparaissait une frame et réapparaissait à sa place
 * finale : un blanc suivi d'un contenu immobile, ce qui est exactement la
 * signature d'un rechargement. L'œil a raison de se méfier.
 *
 * La réponse est de rendre la substitution visible : l'ancien contenu s'efface
 * sur 90 ms, le nouveau se pose sur 220 ms en remontant de 8 px. Un voyage de
 * 8 px se perçoit ; un fondu de 220 ms non. C'est le décalage qui porte la
 * lecture, pas la durée.
 *
 * `initial={false}` : au premier rendu la section est déjà là, l'animer en
 * entrée n'ajouterait qu'un blanc.
 *
 * `mode="popLayout"` : en `sync` les deux contenus se chevauchent et la colonne
 * grandit puis se rétracte.
 */
export function SectionSwap({ sectionKey, className, children }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={sectionKey}
        className={className}
        variants={sectionSwap}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
