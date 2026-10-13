import { cn } from '@/shared/utils';
import { Spinner } from './Spinner.jsx';

const VARIANTS = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 focus-visible:bg-primary-600 disabled:bg-primary-300 disabled:text-white/80',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 disabled:text-gray-400',
  danger:
    'bg-danger-500 text-white hover:bg-rose-700 disabled:bg-rose-300 disabled:text-white/80',
  'danger-outline':
    'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:text-gray-400 disabled:border-gray-200',
  outline:
    'bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200',
  secondary:
    'bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400',
  // Actions groupées d'une fiche. Le fond translucide les détache du texte de
  // la carte sans rivaliser avec l'action principale, qui reste en `primary`.
  subtle:
    'bg-gray-200/20 border border-gray-200 text-gray-700 hover:bg-gray-200/40 hover:text-gray-900 disabled:text-gray-400 disabled:border-gray-200',
  mint:
    'bg-mint-50 text-primary-700 border border-mint-200 hover:bg-mint-100 disabled:opacity-60',
  dark:
    'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-white/80',
};

const SIZES = {
  xs:   'h-8 px-2.5 text-[12px] rounded-[8px] gap-1 font-semibold',
  sm:   'h-9 px-3.5 text-sm rounded-[8px] gap-1.5 font-semibold',
  md:   'h-11 px-5 text-sm rounded-[8px] gap-2 font-semibold',
  lg:   'h-[48px] px-[20px] text-[15px] rounded-[8px] gap-2 font-bold',
  icon: 'h-11 w-11 rounded-xl',
  'icon-sm': 'h-8 w-8 rounded-[8px] gap-0 p-0',
};

/**
 * Enfoncement sous le doigt.
 *
 * ## Pourquoi du CSS et non un ressort de Framer Motion
 *
 * C'est la question à se poser, et la réponse est « du CSS », pour une raison
 * concrète : **au relâchement, le doigt est déjà parti.** La seule chose qu'un
 * ressort apporte de plus est de conserver la vitesse courante quand
 * l'animation est interrompue — ce qui compte pour une feuille qu'on rouvre à
 * mi-parcours, et pas pour un appui. Ici, personne ne voit la vitesse de retour.
 *
 * En échange, un ressort coûte à chaque bouton de l'application : un type
 * `motion` à construire, une instance à abonner à la boucle d'animation, une
 * props `whileTap` à propager à travers `as={Link}`. Pour 30 ms de retour que
 * `:active` rend gratuitement, sur le compositeur, en JavaScript zéro.
 *
 * Le ressort est réservé à ce qui peut **vraiment** être interrompu et repris —
 * voir `src/shared/motion/timing.js`.
 *
 * ## Les valeurs
 *
 * `0.97` : en dessous de `0.95` le bouton s'enfonce au lieu de s'appuyer ; au
 * dessus de `0.98`, le retour est plus court que l'appui et ça tremble.
 *
 * `100 ms` à l'aller, `150 ms` au retour — un ressort appliqué à la main ferait
 * exactement la même chose, sans la dépendance.
 *
 * `active:` disparaît sur un bouton désactivé grâce à `disabled:active:scale-100`
 * : sinon l'interface dirait « tu peux appuyer » le temps du geste.
 */
const PRESS =
  'transition-[color,background-color,border-color,box-shadow,transform] duration-100 ease-out active:scale-[0.97] active:duration-150 disabled:active:scale-100';

export function Button({
  as: As = 'button',
  variant = 'primary',
  size = 'md',
  className,
  loading,
  children,
  disabled,
  type = 'button',
  ...rest
}) {
  const isDisabled = Boolean(disabled || loading);
  return (
    <As
      type={As === 'button' ? type : undefined}
      disabled={isDisabled}
      aria-busy={Boolean(loading)}
      className={cn(
        'cursor-pointer relative inline-flex select-none items-center justify-center leading-none whitespace-nowrap',
        'focus-ring focus:outline-none',
        PRESS,
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        isDisabled && 'cursor-not-allowed opacity-80',
        className,
      )}
      {...rest}
    >
      {loading && <Spinner size="xs" className={children ? '' : 'mx-auto'} />}
      {loading ? (
        <span className="opacity-0 absolute pointer-events-none">{children}</span>
      ) : (
        children
      )}
    </As>
  );
}
