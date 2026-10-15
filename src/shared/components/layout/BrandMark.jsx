import { Drill } from "lucide-react";
import { cn } from "@/shared/utils";

/**
 * Marque du site : la perceuse et le mot-symbole. Extraite de la barre de
 * navigation pour être réutilisée telle quelle dans les placeholders, qui
 * doivent montrer la même identité que la page qui les remplace.
 * @param {number} [size] taille de l'icône, en pixels
 * @param {string} [className] classes additionnelles
 * @returns {import("react").ReactElement} la marque, décorative
 */
export function BrandMark({ size = 20, className }) {
  return (
    <span
      aria-hidden
      className={cn("flex select-none items-center gap-1.5", className)}
    >
      <Drill size={size} />
      <span
        className="moo-lah-lah-regular -ml-0.5 font-extrabold tracking-tight"
        style={{ fontSize: size * 1.35 }}
      >
        KOP
      </span>
    </span>
  );
}
