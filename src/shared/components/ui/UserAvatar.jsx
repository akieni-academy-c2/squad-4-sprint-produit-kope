import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/shared/utils';

export function UserAvatar({
  user,
  name,
  className = 'h-8 w-8',
  fallbackClassName = 'bg-primary-100 text-primary-800',
  src,
  iconSize = 16,
  rounded = 'rounded-full',
}) {
  const [failed, setFailed] = useState(false);
  const label = name || [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || user?.displayName || 'Profil';

  const photoUrl = src ?? user?.avatarUrl;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFailed(false);
  }, [photoUrl]);

  if (photoUrl && !failed)
    return (
      <img
        src={photoUrl}
        alt={label}
        decoding="async"
        className={cn(className, rounded, 'object-cover')}
        onError={() => setFailed(true)}
      />
    );

  return (
    <span className={cn(className, rounded, 'inline-flex items-center justify-center font-semibold', fallbackClassName)}>
      <User size={iconSize} aria-hidden />
    </span>
  );
}
