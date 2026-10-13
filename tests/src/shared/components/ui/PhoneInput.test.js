import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { repoPath, REPO_ROOT } from '@test/support/repoRoot.js';
import { formatPhoneDisplay, stripCountryCode, toNational } from '@/shared/utils/phoneField.js';

/**
 * Le champ téléphone, partout.
 *
 * ## Ce que le test vérifie
 *
 * L'indicatif `+242` est un **préfixe affiché**, pas du texte à saisir. Il
 * n'existe qu'à un seul endroit dans l'application : `PhoneInput`. Ce fichier
 * vérifie qu'aucun formulaire n'a réintroduit un champ libre à côté.
 *
 * ## Pourquoi une règle de dépôt et pas une simple relecture
 *
 * Il y a quatre formulaires avec un numéro — inscription, connexion, profil
 * professionnel, création d'administrateur. Trois d'entre eux avaient un champ
 * texte ordinaire, avec des exemples différents : `+242 06 000 00 00` à la
 * connexion, `+242...` pour WhatsApp, `Téléphone (06 12 34 56 7)` côté admin.
 *
 * Aucune de ces trois ne cassait : `normalizePhone` tolère les deux formes. Mais
 * l'utilisateur, lui, devait deviner laquelle taper. Et un jour, quelqu'un
 * aurait écrit une validation stricte.
 */

const srcRoot = repoPath('src');
const SEP = /[\\/]/;

/** Tous les `.jsx` de `src`, chemins relatifs au dépôt, séparateur oblique. */
function sourceFiles() {
  const walk = (dir) =>
    readdirSync(dir).flatMap((entry) => {
      const path = join(dir, entry);
      return statSync(path).isDirectory() ? walk(path) : [path];
    });

  return walk(srcRoot)
    .filter((f) => f.endsWith('.jsx'))
    .map((f) => f.slice(REPO_ROOT.length + 1).replace(SEP, '/'));
}

/** Un fichier qui porte une saisie de numéro doit passer par `PhoneInput`. */
const TOUCHES_A_NUMBER = [
  /inputMode=["']tel["']/,
  /type=["']tel["']/,
  /placeholder=["'][^"']*\+242/,
  /placeholder=["']T.l.phon/,
];

describe('champ téléphone', () => {
  it('affiche l’indicatif et son séparateur', () => {
    const code = readFileSync(repoPath('src/shared/components/ui/PhoneInput.jsx'), 'utf8');

    // L'indicatif est figé à gauche…
    expect(code).toContain('+242');
    // …séparé de la saisie par un filet, sur toute la hauteur et non sur 16 px.
    // `items-stretch` + `self-stretch` : sans eux le trait est centré et
    // ressemble à une apostrophe au lieu de marquer la frontière.
    expect(code).toContain('items-stretch');
    expect(code).toContain('self-stretch');
  });

  it('n’affiche jamais l’indicatif dans le placeholder du champ de saisie', () => {
    // S'il était aussi dans le placeholder, l'utilisateur le taperait et il
    // s'afficherait deux fois.
    const code = readFileSync(repoPath('src/shared/components/ui/PhoneInput.jsx'), 'utf8');
    const placeholder = /placeholder="([^"]*)"/.exec(code)?.[1];
    expect(placeholder).not.toContain('+242');
  });

  it('est le seul champ de numéro de toute l’application', () => {
    const offenders = [];

    for (const file of sourceFiles()) {
      if (file.endsWith('PhoneInput.jsx')) continue;
      const code = readFileSync(repoPath(file), 'utf8');
      if (TOUCHES_A_NUMBER.some((re) => re.test(code))) offenders.push(file);
    }

    expect(offenders, 'formulaire avec une saisie de numéro hors PhoneInput').toEqual([]);
  });

  it('est utilisé dans les quatre formulaires qui demandent un numéro', () => {
    const expected = [
      'src/features/auth/pages/RegisterClientPage.jsx',
      'src/features/auth/pages/LoginPage.jsx',
      'src/features/professionals/components/profile/ProfileEditForm.jsx',
      'src/features/admin/components/users/CreateAdminForm.jsx',
    ];

    for (const file of expected) 
      expect(readFileSync(repoPath(file), 'utf8'), `${file} n’utilise pas PhoneInput`).toContain(
        '<PhoneInput',
      );
    
  });
});

describe('saisie du numéro', () => {
  it('retire l’indicatif collé', () => {
    // Un utilisateur qui recopie depuis son carnet d’adresses ne doit pas voir
    // son `+242` disparaître de la fiche… mais le voir disparaître du champ.
    expect(stripCountryCode('+242 06 889 88 88')).toBe(' 06 889 88 88');
    // `00` est le préfixe international, puis `242` : cinq caractères en tout.
    expect(stripCountryCode('00242068898888')).toBe('068898888');
  });

  it('ne garde que les chiffres nationaux', () => {
    expect(toNational('+242 06 889 88 88')).toBe('068898888');
    expect(toNational('06 889 88 88')).toBe('068898888');
  });

  it('borne à neuf chiffres', () => {
    // Au-delà, le numéro n’est pas un mobile congolais : on ne laisse pas
    // l’utilisateur taper un dixième chiffre pour découvrir qu’il a tort.
    expect(toNational('0688988889999')).toBe('068898888');
  });

  it('groupe comme l’exemple annoncé par le placeholder', () => {
    // C’est le contrat entre l’exemple affiché et ce que fait le champ. Ils
    // divergeaient : le placeholder annonçait `06 12 34 56 7`, le champ
    // produisait `06 123 45 67`. L’utilisateur tapait l’exemple et voyait ses
    // groupes se réécrire — ce qui se lit comme une correction, pas un formatage.
    const placeholder = /placeholder="([^"]*)"/.exec(
      readFileSync(repoPath('src/shared/components/ui/PhoneInput.jsx'), 'utf8'),
    )[1];

    expect(formatPhoneDisplay('068898888')).toBe(placeholder);
  });

  it('complète progressivement', () => {
    expect(formatPhoneDisplay('0')).toBe('0');
    expect(formatPhoneDisplay('06')).toBe('06');
    expect(formatPhoneDisplay('068')).toBe('06 8');
    expect(formatPhoneDisplay('06889')).toBe('06 889');
    expect(formatPhoneDisplay('068898888')).toBe('06 889 88 88');
  });
});
