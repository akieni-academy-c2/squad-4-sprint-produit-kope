import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/Button.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog.jsx";

export function PhotoLightbox({ photos, index, onClose, onPrev, onNext }) {
  const photo = photos[index];
  if (!photo) return null;

  const close = () => onClose?.();

  return (
    <Dialog open onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-3xl p-5" onClose={close}>
        <DialogHeader>
          <DialogTitle>
            {photo.title ||
              photo.caption ||
              `Photo ${index + 1} / ${photos.length}`}
          </DialogTitle>
          {photo.description && (
            <DialogDescription>{photo.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="relative">
          <img
            src={photo.url || photo.thumbUrl}
            alt={photo.title || photo.caption || "Réalisation"}
            decoding="async"
            className="mx-auto max-h-[65vh] w-auto max-w-full rounded-lg object-contain"
          />
          {photos.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Précédente"
                onClick={onPrev}
                className="absolute left-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-700 shadow-sm hover:bg-white focus-ring"
              >
                <ChevronLeft size={16} aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Suivante"
                onClick={onNext}
                className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-700 shadow-sm hover:bg-white focus-ring"
              >
                <ChevronRight size={16} aria-hidden />
              </button>
            </>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="mr-auto text-xs font-semibold text-gray-500">
            Photo {index + 1} / {photos.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={onPrev}
              disabled={photos.length < 2}
            >
              Précédente
            </Button>
            <Button
              variant="secondary"
              onClick={onNext}
              disabled={photos.length < 2}
            >
              Suivante
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
