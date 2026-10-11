import { ImagePlus } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card.jsx';
import { FloatingCaption } from '@/shared/components/ui/FloatingCaption.jsx';

export function AddPhotoSlot({ slotNumber, slotCount, onClick }) {
  const plural = slotCount > 1;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group h-full text-left focus-ring"
      aria-label={`Ajouter une photo - emplacement ${slotNumber}`}
    >
      <Card className="relative flex h-full flex-col overflow-hidden">
        <span className="relative block h-80 w-full overflow-hidden bg-gray-100">
          <span className="absolute inset-3 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white/80 text-center transition group-hover:border-primary-400 group-hover:bg-white">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <ImagePlus size={20} aria-hidden />
            </span>
            <span className="text-sm font-semibold text-gray-800">Ajouter une photo</span>
            <span className="text-xs text-gray-500">JPG/PNG · 5 Mo</span>
          </span>
          <FloatingCaption
            wide
            icon={ImagePlus}
            title={`Emplacement ${slotNumber}`}
            subtitle={`${slotCount} emplacement${plural ? 's' : ''} vide${plural ? 's' : ''} · cliquez pour ouvrir le formulaire`}
            className="pointer-events-none"
          />
        </span>
      </Card>
    </button>
  );
}