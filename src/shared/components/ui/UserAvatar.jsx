import { useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/shared/utils";

/**
 * Avatar unique de l'application : la photo quand elle existe, l'icône `User`
 * sinon. Le repli couvre les deux cas d'absence - pas d'URL du tout, ou URL
 * morte - pour qu'aucun affichage ne se termine sur une image cassée.
 *
 * `priority` marque l'avatar comme candidat LCP : il doit alors être rendu sans
 * attente, car c'est souvent la première image visible d'une page.
 */
export function UserAvatar({
  user,
  name,
  className = "h-8 w-8",
  fallbackClassName = "bg-primary-100 text-primary-800",
  src,
  iconSize = 16,
  rounded = "rounded-full",
  priority = false,
}) {
  /**
   * Mémorise l'URL morte, pas un booléen : changer de photo doit montrer la
   * nouvelle image dès le rendu suivant. Un booléen remis à zéro par un effet
   * laisserait passer un rendu avec le repli alors que la photo est valide.
   */
  const [failedUrl, setFailedUrl] = useState(null);
  const label =
    name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.displayName ||
    "Profil";

  const photoUrl = src ?? user?.avatarUrl;

  if (photoUrl && failedUrl !== photoUrl)
    return (
      <img
        src={photoUrl}
        alt={label}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={cn(className, rounded, "object-cover")}
        onError={() => setFailedUrl(photoUrl)}
      />
    );

  return (
    <span
      className={cn(
        className,
        rounded,
        "inline-flex items-center justify-center font-semibold",
        fallbackClassName,
      )}
    >
      <User size={iconSize} aria-hidden />
    </span>
  );
}