import { describe, expect, it } from 'vitest';
import { DURATION, PERCEPTIBLE, SPRING, exitOf, isWorthAnimating } from '@/shared/motion/timing.js';
import { staggerChild, staggerParent, MAX_STAGGERED } from '@/shared/motion/stagger.js';
import * as variants from '@/shared/motion/variants.js';

/**
 * Le système de mouvement.
 *
 * Ces tests ne vérifient pas des pixels - ils vérifient les **invariants**
 * annoncés dans `timing.js`, `stagger.js` et `variants.js`. Ce sont des règles
 * de physique et de coût, pas des»: ça se teste sans navigateur.
 *
 * Un invariant écrit dans un commentaire finit toujours par être contredit par
 * un ajout urgent. Celui-ci non.
 */

/** Seuils physiques : `2 × √(stiffness × masse)`. */
const criticalDamping = ({ stiffness, mass }) => 2 * Math.sqrt(stiffness * mass);

/** Ce que le compositeur sait animer sans refaire la mise en page. */
const COMPOSITOR_PROPERTIES = new Set([
  // Transformations - framer-motion les regroupe sous `transform`.
  'x', 'y', 'z', 'scale', 'scaleX', 'scaleY', 'rotate', 'rotateX', 'rotateY', 'rotateZ',
  'skew', 'skewX', 'skewY', 'transformPerspective', 'transformOrigin',
  // Opacité et découpe - également compositées.
  'opacity', 'clipPath',
]);

const STATES = ['initial', 'animate', 'exit'];

/** Toutes les propriétés qu'une variante anime, récursivement, transitions exclues. */
function animatedProperties(variant) {
  const found = [];
  const visit = (state) => {
    for (const [key, value] of Object.entries(state)) {
      if (key === 'transition') continue;
      found.push(key);
      if (value && typeof value === 'object') visit(value);
    }
  };
  for (const state of STATES) if (variant[state]) visit(variant[state]);
  return [...new Set(found)];
}

describe('ressorts', () => {
  it('n’est jamais sous-amorti - un objet qui dépasse sa cible', () => {
    // Le choix documenté dans `timing.js` : dans une interface professionnelle,
    // un rebond se lit comme un jouet. Le seuil critique vaut
    // 2 × √(stiffness × masse) ; être au-dessus garantit qu'on ne le dépasse
    // jamais.
    for (const [name, spring] of Object.entries(SPRING)) 
      expect(spring.damping, `${name} rebondit`).toBeGreaterThanOrEqual(criticalDamping(spring));
    
  });

  it('annule explicitement tout rebond', () => {
    // `bounce: 0` est le moyen déclaré de le dire ; un ressort sans cette
    // clé prend la valeur par défaut de la bibliothèque, qui n’est pas nulle.
    for (const [name, spring] of Object.entries(SPRING)) 
      expect(spring.bounce, `${name} laisse la bibliothèque choisir`).toBe(0);
    
  });

  it('donne à chaque ressort une durée visuelle, pas une durée calculée', () => {
    // Deux ressorts de paramètres différents se terminent ensemble à l'œil
    // si et seulement si leur `visualDuration` est la même.
    for (const [name, spring] of Object.entries(SPRING)) 
      expect(spring.visualDuration, `${name} n'a pas de durée visuelle`).toBeGreaterThan(0);
    
  });
});

describe('échelle des durées', () => {
  it('est croissante', () => {
    const values = Object.values(DURATION);
    expect(values).toEqual([...values].sort((a, b) => a - b));
  });

  it('ne descend jamais sous le seuil de perception', () => {
    // Sous 60 ms, l'œil voit un clignotement, pas un mouvement. Animé quand
    // même, ça coûte du temps de calcul pour un défaut.
    for (const [name, seconds] of Object.entries(DURATION)) 
      expect(seconds, `${name} est sous le seuil de perception`).toBeGreaterThanOrEqual(
        PERCEPTIBLE,
      );
    
  });

  it('garde la contrainte hors de l’échelle', () => {
    // `PERCEPTIBLE` est une contrainte, pas un cran de l'échelle. Mélangé aux
    // durées, il la rend non ordonnée - et donc invérifiable.
    expect(Object.values(DURATION)).not.toContain(PERCEPTIBLE);
  });
});

describe('sortie plus courte que l’entrée', () => {
  it('raccourcit toujours', () => {
    for (const seconds of Object.values(DURATION)) 
      expect(exitOf(seconds)).toBeLessThan(seconds);
    
  });

  it('produit une durée exploitable', () => {
    // Trop court, la sortie devient un clignotement : `0.7 × instant` est sous
    // le seuil. La règle admet une exception, elle doit rester explicite.
    expect(exitOf(DURATION.entrance)).toBeGreaterThanOrEqual(PERCEPTIBLE);
  });
});

describe('amplitude', () => {
  it('juge un décalage trop faible pour être animable', () => {
    // En deçà de 8 px l'œil ne perçoit pas de déplacement. Animer coûte alors
    // du temps de calcul pour un défaut.
    expect(isWorthAnimating(7)).toBe(false);
    expect(isWorthAnimating(8)).toBe(true);
  });

  it('ignore le sens du déplacement', () => {
    expect(isWorthAnimating(-24)).toBe(isWorthAnimating(24));
  });
});

describe('cascade d’un groupe', () => {
  const stepOf = (count) => staggerParent(count).animate?.transition?.staggerChildren;
  const totalOf = (count) => {
    const step = stepOf(count);
    return step == null ? 0 : step * (Math.min(Math.max(count, 0), MAX_STAGGERED) - 1);
  };

  it('ne fait jamais attendre plus d’un demi-clignement entre deux éléments', () => {
    // C'est la borne qui compte. Borner seulement le total respecte mal le
    // cas limite : un groupe de deux éléments étire alors son unique écart sur
    // 340 ms, et le second arrive après une demi-seconde d'attente.
    for (const count of [2, 3, 4, 8, 12, 24, 200]) 
      expect(stepOf(count), `${count} éléments`).toBeLessThanOrEqual(0.05);
    
  });

  it('pose le groupe entier dans le temps imparti, quelle que soit sa taille', () => {
    // C'est l'invariant central. Un `staggerChildren` fixe - le réflexe - sur
    // 24 cartes étale la dernière à plus de deux secondes ; l'utilisateur a
    // déjà commencé à lire et l'interface paraît charger.
    for (const count of [2, 4, 8, 12, 24, 200]) 
      expect(totalOf(count), `${count} éléments`).toBeLessThanOrEqual(0.34);
    
  });

  it('n’allonge jamais au-delà du palier', () => {
    // Passer de 12 à 200 éléments ne doit rien changer : au-delà du palier,
    // les éléments excédentaires arrivent ensemble.
    expect(totalOf(200)).toBeCloseTo(totalOf(12), 5);
    expect(stepOf(200)).toBeCloseTo(stepOf(12), 5);
  });

  it('ne cadence rien pour un groupe trop petit', () => {
    // Cadencer un élément unique est une division par le nombre d'écarts :
    // le groupe clignote au lieu d'arriver.
    expect(staggerParent(1)).toEqual({ animate: {} });
    expect(staggerParent(0)).toEqual({ animate: {} });
  });

  it('envoie l’enfant comme la même entrée que le groupe', () => {
    expect(staggerChild.animate).toHaveProperty('opacity', 1);
    expect(staggerChild.initial.opacity).toBe(0);
  });
});

describe('propriétés animées', () => {
  for (const [name, variant] of Object.entries(variants)) {
    it(`${name} ne touche que le compositeur`, () => {
      // Animer `height`, `top` ou `margin` force le navigateur à refaire la
      // mise en page à chaque image : la page saccade et l'animation coûte
      // cher sur un téléphone. Ces propriétés sont interdites ici, pas
      // découragées.
      for (const property of animatedProperties(variant)) 
        expect(
          COMPOSITOR_PROPERTIES.has(property),
          `${name} anime « ${property} », qui force la mise en page`,
        ).toBe(true);
      
    });

    it(`${name} a une entrée et une sortie`, () => {
      // La règle du module : ce qui passe par Framer Motion a une sortie. Une
      // variante sans `exit` disparaît sur-le-champ et se lit comme un bug.
      expect(variant.initial, `${name} n'a pas d'état initial`).toBeDefined();
      expect(variant.exit, `${name} n'a pas d'état de sortie`).toBeDefined();
    });
  }
});

describe('sortie plus courte que l’entrée, au niveau des variantes', () => {
  const entryTime = (variant) => variant.animate.transition.duration;
  const exitTime = (variant) => variant.exit.transition.duration;

  for (const [name, variant] of Object.entries(variants)) 
    it(`${name} sort plus vite qu’il n’entre`, () => {
      // Un objet qui met 420 ms à sortir après en avoir mis 420 à entrer
      // donne l'impression que l'interface a ralenti.
      if (typeof entryTime(variant) !== 'number') return;
      expect(exitTime(variant)).toBeLessThan(entryTime(variant));
    });
  
});
