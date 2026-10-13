import { AnimatePresence, motion } from 'motion/react';
import { sectionSwap } from './variants.js';

/**
 * Colonne centrale d'un tableau de bord : la section affichée y entre et en sort.
 *
 * ## Le problème que ce composant résout
 *
 * Changer d'onglet paraissait **recharger la page**. Aucun rechargement n'avait
 * lieu — la requête était déjà faite, la réponse était en cache, React
 * remplace un nœud par un autre. Ce qui-change était perçu, pas réel :
 *
 *   - pendant 1 à 3 frames, l'ancien contenu est retiré et le nouveau n'est pas
 *     encore peint : la colonne est **vide** ;
 *   - puis le nouveau contenu apparaît d'un coup, à sa position finale.
 *
 * Un blanc suivi d'un contenu immobile, c'est exactement la signature visuelle
 * d'un rechargement. L'œil ne fait pas la différence, et il a raison de se
 * méfier.
 *
 * ## La réponse
 *
 * Rendre la substitution **visible**. L'ancien contenu s'efface sur 90 ms, le
 * nouveau se pose sur 220 ms en remontant de 8 px.
 *
 * Un voyage de 8 px en 220 ms se voit. Un fondu de 220 ms, non : à cette
 * vitesse l'œil ne suit pas la transition, il ne voit que deux états — et deux
 * états séparés par du vide sont, visuellement, un rechargement. C'est pourquoi
 * le **décalage** porte la lecture, et non la durée.
 *
 * ## `initial={false}`
 *
 * Au tout premier rendu, rien n'est animé : la section est déjà là, l'animer
 * en entrée imposerait un blanc de 220 ms pour rien — on recréait le problème
 * qu'on vient de corriger, mais sur le chargement de la page.
 *
 * ## `mode="popLayout"`
 *
 * En mode `sync` — le défaut — les deux contenus se chevauchent pendant toute
 * la transition et la colonne **grandit puis se rétracte**. À la sortie de
 * chaque onglet, la page sautait de deux hauteurs. `popLayout` retire le contenu sortant du flux tout de suite.
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
