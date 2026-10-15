import { useCallback, useState } from "react";
import { cn } from "@/shared/utils";
import { BrandMark } from "@/shared/components/layout/BrandMark.jsx";
import { Skeleton } from "./Skeleton.jsx";

const LOADING = "loading";
const LOADED = "loaded";
const FAILED = "failed";

/**
 * Image avec placeholders. `priority` marque l'image comme candidate LCP : le
 * navigateur la découvre alors avant même l'analyse du HTML, et React émet le
 * preload qui va avec.
 *
 * Un échec de chargement affiche un bloc neutre plutôt que rien : sans lui, une
 * image morte resterait à `opacity-0` au-dessus d'un cadre vide, invisible pour
 * l'internaute comme pour un lecteur d'écran.
 */
export function ImageWithSkeleton({
  src,
  alt,
  ratio = "aspect-4/3",
  className,
  frameClassName,
  skeletonClassName,
  eager = false,
  priority = false,
  srcSet,
  sizes,
  ...rest
}) {
  const [status, setStatus] = useState(src ? LOADING : FAILED);
  const [trackedSrc, setTrackedSrc] = useState(src);

  if (src !== trackedSrc) {
    setTrackedSrc(src);
    setStatus(src ? LOADING : FAILED);
  }

  const attachImage = useCallback((node) => {
    if (node?.complete && node.naturalWidth > 0) setStatus(LOADED);
  }, []);

  return (
    <div className={cn("relative overflow-hidden", ratio, frameClassName)}>
      {status === LOADING && (
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 flex h-full w-full items-center justify-center rounded-none",
            skeletonClassName,
          )}
        >
          <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
          <BrandMark size={16} className="relative text-primary-500/45" />
        </div>
      )}

      {status === FAILED && (
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 h-full w-full rounded-none bg-gray-200",
            skeletonClassName,
          )}
        />
      )}

      {src && (
        <img
          ref={attachImage}
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={priority || eager ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          onLoad={() => setStatus(LOADED)}
          onError={() => setStatus(FAILED)}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-500 motion-reduce:transition-none",
            status === LOADED ? "opacity-100" : "opacity-0",
            className,
          )}
          {...rest}
        />
      )}
    </div>
  );
}
