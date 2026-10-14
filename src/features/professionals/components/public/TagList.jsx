import { Badge } from '@/shared/components/ui/Badge.jsx';

/**
 * Tags rendus par `Badge` et posés dans un conteneur qui se coupe. Desktop et
 * mobile passent par le même composant, faute de quoi ils divergeaient à chaque
 * retouche. `variant` explicite : la valeur vide retombait silencieusement.
 */
export function TagList({ tags }) {
  if (!tags?.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Badge key={tag} variant="neutral" size="sm">
          {tag}
        </Badge>
      ))}
    </div>
  );
}
