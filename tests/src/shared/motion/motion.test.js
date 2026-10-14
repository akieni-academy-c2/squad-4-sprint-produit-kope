import { describe, expect, it } from 'vitest';
import { DURATION, PERCEPTIBLE, SPRING, exitOf, isWorthAnimating } from '@/shared/motion/timing.js';
import { staggerChild, staggerParent, MAX_STAGGERED } from '@/shared/motion/stagger.js';
import * as variants from '@/shared/motion/variants.js';




const criticalDamping = ({ stiffness, mass }) => 2 * Math.sqrt(stiffness * mass);


const COMPOSITOR_PROPERTIES = new Set([
  'x', 'y', 'z', 'scale', 'scaleX', 'scaleY', 'rotate', 'rotateX', 'rotateY', 'rotateZ',
  'skew', 'skewX', 'skewY', 'transformPerspective', 'transformOrigin',
  'opacity', 'clipPath',
]);

const STATES = ['initial', 'animate', 'exit'];


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
    for (const [name, spring] of Object.entries(SPRING))
      expect(spring.damping, `${name} rebondit`).toBeGreaterThanOrEqual(criticalDamping(spring));

  });

  it('annule explicitement tout rebond', () => {
    for (const [name, spring] of Object.entries(SPRING))
      expect(spring.bounce, `${name} laisse la bibliothèque choisir`).toBe(0);

  });

  it('donne à chaque ressort une durée visuelle, pas une durée calculée', () => {
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
    for (const [name, seconds] of Object.entries(DURATION))
      expect(seconds, `${name} est sous le seuil de perception`).toBeGreaterThanOrEqual(
        PERCEPTIBLE,
      );

  });

  it('garde la contrainte hors de l’échelle', () => {
    expect(Object.values(DURATION)).not.toContain(PERCEPTIBLE);
  });
});

describe('sortie plus courte que l’entrée', () => {
  it('raccourcit toujours', () => {
    for (const seconds of Object.values(DURATION))
      expect(exitOf(seconds)).toBeLessThan(seconds);

  });

  it('produit une durée exploitable', () => {
    expect(exitOf(DURATION.entrance)).toBeGreaterThanOrEqual(PERCEPTIBLE);
  });
});

describe('amplitude', () => {
  it('juge un décalage trop faible pour être animable', () => {
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
    for (const count of [2, 3, 4, 8, 12, 24, 200])
      expect(stepOf(count), `${count} éléments`).toBeLessThanOrEqual(0.05);

  });

  it('pose le groupe entier dans le temps imparti, quelle que soit sa taille', () => {
    for (const count of [2, 4, 8, 12, 24, 200])
      expect(totalOf(count), `${count} éléments`).toBeLessThanOrEqual(0.34);

  });

  it('n’allonge jamais au-delà du palier', () => {
    expect(totalOf(200)).toBeCloseTo(totalOf(12), 5);
    expect(stepOf(200)).toBeCloseTo(stepOf(12), 5);
  });

  it('ne cadence rien pour un groupe trop petit', () => {
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
      for (const property of animatedProperties(variant))
        expect(
          COMPOSITOR_PROPERTIES.has(property),
          `${name} anime « ${property} », qui force la mise en page`,
        ).toBe(true);

    });

    it(`${name} a une entrée et une sortie`, () => {
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
      if (typeof entryTime(variant) !== 'number') return;
      expect(exitTime(variant)).toBeLessThan(entryTime(variant));
    });

});
