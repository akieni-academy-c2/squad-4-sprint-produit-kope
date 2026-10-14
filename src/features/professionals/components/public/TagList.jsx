import { Badge } from '@/shared/components/ui/Badge.jsx';


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
