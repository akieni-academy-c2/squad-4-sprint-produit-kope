import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { repoPath } from '@test/support/repoRoot.js';

/**
 * Les surfaces superposées sont animées.
 *
 * Pourquoi ce test lit la source : ces surfaces sont rendues par
 * `createPortal`, que `renderToStaticMarkup` ignore. Et une animation ne se
 * voit qu'après le premier `requestAnimationFrame` — son état intermédiaire
 * n'existe à aucun moment du rendu.
 *
 * Ce qui peut réellement casser se lit dans le source : une variante déclarée
 * puis non relancée, une `motion.*` oubliée, une prop `variants` reçue et non
 * transmise.
 */

const source = (path) => readFileSync(repoPath(path), 'utf8');

const OPEN = '{([';
const CLOSE = '}])';

/**
 * Balises ouvrantes `<motion.* ...>`, une par entrée.
 *
 * Deux pièges, tous deux rencontrés en écrivant ce helper :
 *
 *   1. une classe `className` de plusieurs lignes place `variants` loin de la
 *      balise — un motif trop serré échoue sans rien dire du défaut cherché ;
 *   2. une flèche `onClick={(e) => ...}` contient un `>` qui n'est pas la fin de
 *      la balise. Un découpage naïf s'arrête là et perd tout ce qui suit.
 *
 * D'où un parcours qui tient compte des accolades, parenthèses et crochets :
 * le `>` recherché n'est retenu qu'au niveau d'imbrication zéro.
 */
function motionTags(code) {
  const tags = [];

  for (let start = code.indexOf('<motion.'); start !== -1; start = code.indexOf('<motion.', start + 1)) {
    let depth = 0;
    let i = start;

    for (; i < code.length; i += 1) {
      const c = code[i];
      if (OPEN.includes(c)) depth += 1;
      else if (CLOSE.includes(c)) depth -= 1;
      else if (c === '>' && depth === 0) break;
    }

    if (i >= code.length) break;
    tags.push(code.slice(start, i));
  }

  return tags;
}

/** Les balises `motion` qui portent une variante. */
const animated = (code) => motionTags(code).filter((tag) => /\bvariants=/.test(tag));

describe('Sheet', () => {
  const code = source('src/shared/components/ui/Sheet.jsx');

  it('anime le panneau avec une variante, pas seulement le fond', () => {
    // Régression : `Sheet` passe par `AnimatePresence`, mais son panneau pouvait
    // redevenir une `div` — la feuille serait alors apparue d'un bloc alors que
    // son fond, lui, glissait.
    expect(animated(code).length).toBeGreaterThanOrEqual(2);
  });

  it('choisit le bord d’entrée', () => {
    expect(code).toContain("side === 'bottom' ? sheetPanel : sidePanel");
  });

  it('laisse AnimatePresence gérer la présence', () => {
    expect(code).toContain('<AnimatePresence>');
    // Le minuteur de démontage appartenait à `useOverlay` : il pouvait retirer
    // une feuille en plein milieu de sa réouverture.
    expect(source('src/shared/components/ui/useOverlay.js')).not.toContain('setRender');
  });
});

describe('Modal', () => {
  const code = source('src/shared/components/ui/Modal.jsx');

  it('anime le fond et le panneau', () => {
    const tags = animated(code);
    expect(tags.length).toBeGreaterThanOrEqual(2);
    expect(tags.some((tag) => tag.includes('panelVariants'))).toBe(true);
  });

  it('floute son fond comme les deux autres surfaces', () => {
    // Régression : `Sheet` et `Dialog` l'étaient, la modale non. Trois surfaces
    // qui se recouvrent de la même façon ne peuvent pas se lire différemment.
    expect(code).toMatch(/bg-checkers backdrop-blur/);
  });
});

describe('Dialog', () => {
  const code = source('src/shared/components/ui/Dialog.jsx');

  it('relève la variante que le parent injecte', () => {
    // Régression : `Dialog` passait `variants` au panneau par `cloneElement`,
    // mais `DialogContent` ne la déclarait pas dans sa signature — elle
    // tombait donc dans le vide. Le dialogue n'avait de mouvement que sur son
    // fond : la boîte, elle, apparaissait d'un bloc.
    expect(code).toMatch(/export function DialogContent\(\{[\s\S]*?variants,/);
  });

  it('la transmet au panneau rendu', () => {
    // C'est l'étape qui manquait. Une variante perdue ne se voit dans aucun
    // rendu : il faut donc vérifier que la prop est transmise, pas qu'elle
    // existe quelque part dans le fichier.
    const panel = motionTags(code).find((tag) => tag.includes('forwardedRef'));

    expect(panel, 'le panneau n’est pas un élément motion').toBeDefined();
    expect(panel, 'la variante est reçue mais non transmise').toMatch(/\bvariants=\{variants\}/);
  });
});

describe('boutons d’icône', () => {
  const code = source('src/shared/components/ui/IconButton.jsx');

  it('s’enfonce sous le doigt', () => {
    expect(code).toContain('whileTap');
  });

  it('ne délègue pas l’échelle à un survol CSS', () => {
    // Un `:hover` CSS reste collé après un tap sur mobile : l'icône et son
    // fond resteraient survolés. `whileHover` se désengage sur `pointerleave`,
    // que le tactile produit correctement.
    //
    // La couleur, elle, reste en CSS : elle ne bouge pas, et n'a donc aucune
    // des raisons d'être en JavaScript.
    expect(code).toContain('whileHover');
    expect(code).not.toMatch(/hover:scale/);
  });

  it('ne bouge pas quand il est désactivé', () => {
    expect(code).toMatch(/whileTap=\{disabled \? undefined/);
    expect(code).toMatch(/whileHover=\{disabled \? undefined/);
  });
});
