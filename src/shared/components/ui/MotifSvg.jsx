import { cn } from "@/shared/utils";

/**
 * Enveloppe commune aux motifs décoratifs de fond. Tous partagent la même
 * couche : plein cadre, non cliquable, ignoré par l'accessibilité, et découpé
 * pour ne pas se déformer. Un motif ne fournit que ses formes.
 */
export function MotifSvg({ viewBox, className, children }) {
  return (
    <svg
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        className,
      )}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      {children}
    </svg>
  );
}
