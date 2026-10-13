import { formatPhoneDisplay, toNational } from '@/shared/utils/phoneField.js';
import { cn } from '@/shared/utils';

/**
 * Champ téléphone à indicatif fixe : `[+242 | 06 889 88 88]`
 *
 * ## L'indicatif est un préfixe affiché, pas du texte à saisir
 *
 * Un numéro congolais commence toujours par `+242`. Le laisser à la saisie
 * produit trois erreurs à chaque fois : l'utilisateur tape `+242 242 06…`, il
 * oublie le `+`, ou il met un espace entre l'indicatif et le numéro — et le
 * champ est alors refusé pour une faute de frappe qui n'en était pas une.
 *
 * Le faire figer à gauche retire le problème à la source. Et le séparateur
 * entre l'indicatif et la saisie n'est pas décoratif : il dit **où** finit le
 * préfixe et où commence ce que l'utilisateur tape.
 *
 * Ce qui est collé ou tapé malgré tout est retiré : voir `stripCountryCode`.
 * Un utilisateur qui recopie un numéro depuis son carnet d'adresses doit voir
 * son `+242` disparaître, pas se dupliquer.
 *
 * ## Le placeholder annonce exactement ce que le champ produira
 *
 * Le regroupement est `2 · 3 · 2 · 2` — celui de `formatPhoneDisplay`, couvert
 * par ses tests. Le placeholder et l'indice de saisie alignent leur exemple
 * dessus. Ils annonçaient `06 12 34 56 7` : l'utilisateur tapait l'exemple
 * donné et le champ réécrivait ses groupes sous ses doigts, ce qui se lit comme
 * une correction, pas comme un formatage.
 */
export function PhoneInput({ id, value, onChange, error, success, disabled, className, ...rest }) {
  const emit = (raw) => onChange(toNational(raw));

  const shell = cn(
    'flex w-full items-stretch overflow-hidden rounded-sm border bg-white transition-colors',
    error
      ? 'is-invalid border-danger-500 bg-danger-50/30'
      : success
        ? 'is-valid border-emerald-500 bg-emerald-50/30'
        : 'border-gray-200 hover:border-gray-300',
    'focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/12',
    disabled && 'bg-gray-50 opacity-60',
    className,
  );

  return (
    <div className={shell}>
      <span
        aria-hidden
        className="flex shrink-0 select-none items-stretch border-r border-gray-200 bg-gray-50"
      >
        <span className="flex items-center py-3 pl-3 pr-2.5 text-sm font-semibold text-gray-700">
          +242
        </span>
        {/*
          Séparateur pleine hauteur de la zone de saisie, pas 16 px.

          Un trait de 16 px centré dans une zone de 44 px ressemble à une
          apostrophe et ne marque pas la frontière entre le préfixe et la
          saisie. `w-px` étiré sur toute la hauteur indique l'endroit exact où
          commencer à taper.
        */}
        <span className="w-px self-stretch bg-gray-300" />
      </span>

      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={formatPhoneDisplay(value)}
        disabled={disabled}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => emit(e.target.value)}
        // À la sortie du champ : nettoie une saisie collée avec l'indicatif.
        onBlur={() => emit(value)}
        placeholder="06 889 88 88"
        className="w-full min-w-0 border-0 bg-transparent py-3 pl-3 pr-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
        {...rest}
      />
    </div>
  );
}
