import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/utils';
import { toOption, useListboxNavigation, useScrollActiveIntoView } from './listbox.js';

const SIZES = {
  sm: 'h-9 text-[13px]',
  md: 'h-10 text-[14px]',
};

const MARGIN = 8;
const MENU_MAX_HEIGHT = 320;
const MENU_FADE_MS = 150;


export function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Sélectionner...',
  className,
  // `className` habille le conteneur (largeur, position) ; le bouton porte
  // son propre cadre. Sans cette prop, seule façon de retirer fond et bordure
  // du champ, et les surcharges finissaient sur le conteneur sans effet.
  triggerClassName,
  menuClassName,
  disabled,
  id,
  name,
  size = 'md',
  'aria-label': ariaLabel,
  ...rest
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // `mounted` garde le menu dans le DOM pendant la fermeture pour pouvoir
  // jouer l'animation de sortie ; `shown` pilote opacité et translation.
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const generatedId = useId();
  const triggerId = id || generatedId;
  const normalizedOptions = options.map(toOption);
  const selected = normalizedOptions.find((o) => String(o.value) === String(value));
  const menuId = `${triggerId}-list`;

  useScrollActiveIntoView({
    open,
    activeIndex,
    optionId: `${triggerId}-opt-${activeIndex}`,
  });

  const close = useCallback(() => setOpen(false), []);

  const handleSelect = (next) => {
    onChange?.(next);
    setOpen(false);
  };

  const onKeyDown = useListboxNavigation({
    open,
    itemCount: normalizedOptions.length,
    activeIndex,
    setActiveIndex,
    onOpen: () => setOpen(true),
    onClose: close,
    onSelect: (index) => {
      const option = normalizedOptions[index];
      if (option) handleSelect(option.value);
    },
    disabled,
  });

  const measure = useCallback(() => {
    const node = rootRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const margin = MARGIN;
    const below = window.innerHeight - rect.bottom - margin;
    const above = rect.top - margin;

    // On ouvre toujours du côté qui offre le plus de place : le menu ne peut
    // ainsi jamais déborder du viewport, quel que soit le défilement.
    const openUp = above > below;
    const available = Math.max(0, openUp ? above : below);
    const maxHeight = Math.max(0, Math.min(MENU_MAX_HEIGHT, available));
    const width = rect.width;
    const left = Math.min(Math.max(margin, rect.left), Math.max(margin, window.innerWidth - width - margin));

    setCoords({
      left,
      width,
      maxHeight,
      openUp,
      // Vers le haut : on ancre le BAS du menu sur le bouton (4 px d'écart), afin
      // qu'il reste collé au champ même s'il contient peu d'options. La hauteur
      // suit alors le contenu, au lieu d'un cadre vide de 320 px.
      ...(openUp
        ? { bottom: Math.min(window.innerHeight - rect.top + 4, window.innerHeight - margin) }
        : { top: rect.bottom + 4 }),
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return undefined;
    measure();
    const onViewportChange = () => measure();
    window.addEventListener('scroll', onViewportChange, true);
    window.addEventListener('resize', onViewportChange);
    // La sidebar est sticky et la mise en page bouge au chargement des résultats :
    // on recalcule si la position ou la taille du champ change.
    const observer = new ResizeObserver(() => measure());
    if (rootRef.current) observer.observe(rootRef.current);
    return () => {
      window.removeEventListener('scroll', onViewportChange, true);
      window.removeEventListener('resize', onViewportChange);
      observer.disconnect();
    };
  }, [open, measure]);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      const frame = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(frame);
    }
    setShown(false);
    const timer = setTimeout(() => setMounted(false), MENU_FADE_MS);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      const inTrigger = rootRef.current?.contains(e.target);
      const inMenu = menuRef.current?.contains(e.target);
      if (!inTrigger && !inMenu) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const menu =
    mounted && coords && typeof document !== 'undefined'      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="listbox"
            aria-labelledby={triggerId}
            style={{
              left: coords.left,
              width: coords.width,
              maxHeight: coords.maxHeight,
              ...(coords.openUp ? { bottom: coords.bottom } : { top: coords.top }),
            }}
            className={cn(
              'fixed z-popover overflow-y-auto overscroll-contain rounded-md border border-gray-200 bg-white p-1 shadow-pop',
              // Même animation d'apparition que le menu du header (animate-scale-in),
              // avec l'origine alignée sur le sens d'ouverture.
              coords.openUp ? 'origin-bottom' : 'origin-top',
              'transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none',
              shown ? 'animate-scale-in motion-reduce:animate-none' : 'scale-[.97] opacity-0 pointer-events-none',
              menuClassName,
            )}
          >
            {normalizedOptions.length === 0 ? (
              <p className="px-2 py-1.5 text-sm text-gray-500">Aucune option</p>
            ) : (
              normalizedOptions.map((o, index) => {
                const isSel = String(o.value) === String(value);
                return (
                  <button
                    key={o.value}
                    id={`${triggerId}-opt-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isSel}
                    onMouseMove={() => setActiveIndex(index)}
                    onClick={() => handleSelect(o.value)}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-left text-[14px] transition-colors',
                      index === activeIndex && !isSel && 'bg-gray-100',
                      isSel && 'bg-mint-50 text-primary-700',
                      index !== activeIndex && !isSel && 'text-gray-700 hover:bg-gray-100',
                    )}
                  >
                    <Check className={cn('h-4 w-4 shrink-0', isSel ? 'opacity-100' : 'opacity-0')} />
                    <span className="truncate">{o.label}</span>
                  </button>
                );
              })
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div ref={rootRef} className={cn('relative', className)}>
        <button
          type="button"
          id={triggerId}
          role="combobox"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={menuId}
          aria-activedescendant={open && normalizedOptions.length ? `${triggerId}-opt-${activeIndex}` : undefined}
          aria-label={typeof ariaLabel === 'string' ? ariaLabel : undefined}
          {...rest}
          onClick={() => !disabled && setOpen((o) => !o)}
          onKeyDown={onKeyDown}
          className={cn(
            'relative flex w-full items-center justify-between gap-2 rounded-sm border border-gray-200 bg-white px-3 text-left text-gray-900 transition-colors hover:border-gray-300 focus-ring disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400',
            SIZES[size] || SIZES.md,
            open && 'border-primary-500',
            triggerClassName,
          )}
        >
          <span className={cn('truncate', !selected && 'text-gray-400')}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className={cn('h-4 w-4 shrink-0 text-gray-500 transition-transform', open && 'rotate-180')} />
        </button>
        {name && <input type="hidden" name={name} value={value ?? ''} />}
      </div>
      {menu}
    </>
  );
}
