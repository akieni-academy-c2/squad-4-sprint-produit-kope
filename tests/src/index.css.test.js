import { describe, expect, it } from 'vitest';
import { repoPath } from '@test/support/repoRoot.js';
import { readFileSync } from 'node:fs';


const css = readFileSync(repoPath('src/index.css'), 'utf8');


function baseLayerContent(source) {
  const start = source.indexOf('@layer base');
  if (start === -1) return '';

  const open = source.indexOf('{', start);
  let depth = 0;
  let index = open;

  while (index < source.length) {
    const char = source[index];

    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(open + 1, index);
    }

    index += 1;
  }

  return '';
}

const baseLayer = baseLayerContent(css);

describe('Curseur des éléments cliquables', () => {
  const POINTEURS = ['button:not(:disabled)', '[role=\'button\']', 'a[href]', 'select:not(:disabled)', 'summary', 'label[for]'];

  it.each(POINTEURS)('déclare un curseur sur %s', (selecteur) => {
    expect(baseLayer).toContain(selecteur);
  });

  it('place la règle dans @layer base pour laisser les utilitaires gagner', () => {
    expect(baseLayer).toContain('cursor: pointer');
    expect(baseLayer.length).toBeGreaterThan(0);
  });

  it('exclut les éléments désactivés', () => {
    expect(baseLayer).toContain('button:not(:disabled)');
    expect(baseLayer).toContain('select:not(:disabled)');
  });

  it('ne touche pas aux champs de saisie', () => {
    expect(baseLayer).not.toMatch(/^\s*input[^-]/m);
    expect(baseLayer).not.toContain('input:not(:disabled)');
    expect(baseLayer).not.toContain('textarea');
  });
});



function layerContent(source, name) {
  const start = source.indexOf(`@layer ${name}`);
  if (start === -1) return '';

  const open = source.indexOf('{', start);
  let depth = 0;
  for (let index = open; index < source.length; index++) {
    const char = source[index];
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) return source.slice(open + 1, index);
  }
  return '';
}

const utilitiesLayer = layerContent(css, 'utilities');

describe('cascades Tailwind', () => {
  it('declare le bloc @layer utilities', () => {
    expect(utilitiesLayer.length).toBeGreaterThan(0);
  });

  it.each([
    ['.animate-fade-in'],
    ['.animate-scale-in'],
    ['.container-kop'],
    ['.page-padding'],
    ['.bg-checkers'],
    ['.nav-link-active'],
    ['.bg-dots'],
    ['.focus-ring'],
    ['.link-underline'],
    ['.bg-kop-mint'],
  ])('place %s dans @layer utilities', (selector) => {
    expect(utilitiesLayer, selector).toContain(selector);
  });

  it('place le line-height des paragraphes dans @layer base', () => {
    expect(baseLayer).toMatch(/\bp\s*\{[^}]*line-height/);
  });
});

describe('jetons de conception', () => {
  it.each([
    '--z-index-overlay',
    '--z-index-popover',
    '--z-index-toast',
    '--color-tint-mint',
    '--color-tint-cream',
    '--color-tint-rose',
    '--radius-sm',
  ])('declare %s dans @theme', (token) => {
    expect(css, token).toContain(token);
  });
});
