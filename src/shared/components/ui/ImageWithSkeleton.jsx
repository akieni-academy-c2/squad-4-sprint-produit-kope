import { useCallback, useState } from 'react';
import { cn } from '@/shared/utils';
import { Skeleton } from './Skeleton.jsx';

const LOADING = 'loading';
const LOADED = 'loaded';
const FAILED = 'failed';

/**
 * Le squelette porte la même classe de ratio : la hauteur est réservée avant
 * le téléchargement. L'état est local à chaque instance, un drapeau global
 * ferait scintiller toute la page.
 */
export function ImageWithSkeleton({
  src,
  alt,
  ratio = 'aspect-4/3',
  className,
  frameClassName,
  skeletonClassName,
  eager = false,
  ...rest
}) {
  const [status, setStatus] = useState(src ? LOADING : FAILED);
  const [trackedSrc, setTrackedSrc] = useState(src);

  if (src !== trackedSrc) {
    setTrackedSrc(src);
    setStatus(src ? LOADING : FAILED);
  }

  // Une image déjà en cache peut être décodée avant que React n'abonne
  // `onLoad` : l'événement ne se déclencherait jamais et le squelette resterait
  // épinglé sur une image visible.
  const attachImage = useCallback((node) => {
    if (node?.complete && node.naturalWidth > 0) setStatus(LOADED);
  }, []);

  return (
    <div className={cn('relative overflow-hidden', ratio, frameClassName)}>
      {status === LOADING && (
        <Skeleton className={cn('absolute inset-0 h-full w-full rounded-none', skeletonClassName)} />
      )}

      {src && (
        <img
          ref={attachImage}
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setStatus(LOADED)}
          onError={() => setStatus(FAILED)}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-500 motion-reduce:transition-none',
            status === LOADED ? 'opacity-100' : 'opacity-0',
            className,
          )}
          {...rest}
        />
      )}
    </div>
  );
}