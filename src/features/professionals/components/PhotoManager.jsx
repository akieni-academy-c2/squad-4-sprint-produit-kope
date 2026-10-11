import { useState } from 'react';
import { Button } from '@/shared/components/ui/Button.jsx';
import { Modal } from '@/shared/components/ui/Modal.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { MAX_PHOTOS, ALLOWED_MIME, MAX_FILE_SIZE_BYTES } from '@/shared/lib/constants.js';
import { addPhoto, updatePhoto, deletePhoto } from '@/features/photos/services/photos.service.js';
import { AddPhotoSlot } from '@/features/photos/components/AddPhotoSlot.jsx';
import { PhotoCard } from '@/features/photos/components/PhotoCard.jsx';
import { PhotoFormModal } from '@/features/photos/components/PhotoFormModal.jsx';
import { pickFormErrors } from '@/features/photos/components/photoFormErrors.js';
import { cn } from '@/shared/utils';

const MIN_SLOTS = 3;

export function PhotoManager({ photos = [], onChange }) {
  const { toast } = useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmPhoto, setConfirmPhoto] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (photo) => {
    setEditing(photo);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setFormOpen(false);
    setEditing(null);
  };

  const closeFormAndReset = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const remaining = Math.max(0, MAX_PHOTOS - photos.length);
  const full = remaining <= 0;
  const slotCount = full ? 0 : Math.max(MIN_SLOTS - photos.length, 1);

  /** Contrôles côté client avant d'envoyer le fichier : le serveur les revalide. */
  const checkFile = (file) => {
    if (!ALLOWED_MIME.includes(file.type)) return 'Format non autorisé : seulement JPG ou PNG.';
    if (file.size > MAX_FILE_SIZE_BYTES) return 'Fichier trop volumineux (max 5 Mo).';
    return null;
  };

  const handleAdd = async (file, { title, description }) => {
    if (!file) return { ok: false };
    const fileError = checkFile(file);
    if (fileError) {
      toast({ message: fileError, type: 'error' });
      return { ok: false };
    }
    if (photos.length >= MAX_PHOTOS) {
      toast({ message: `Limite de ${MAX_PHOTOS} photos atteinte.`, type: 'error' });
      return { ok: false };
    }
    setSubmitting(true);
    try {
      const created = await addPhoto(file, { title, description });
      onChange?.([...photos, created]);
      toast({ message: 'Photo ajoutée avec succès.', type: 'success' });
      closeFormAndReset();
      return { ok: true };
    } catch (err) {
      const fieldErrors = pickFormErrors(err);
      if (fieldErrors) return { ok: false, errors: fieldErrors };
      toast({ message: err?.errors?.photo || err?.message || "Erreur lors de l'ajout de la photo.", type: 'error' });
      return { ok: false };
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async ({ title, description }) => {
    if (!editing) return { ok: false };
    setSubmitting(true);
    try {
      const updated = await updatePhoto(editing.id, { title, description });
      onChange?.(photos.map((p) => (p.id === updated.id ? updated : p)));
      toast({ message: 'Photo mise à jour.', type: 'success' });
      closeFormAndReset();
      return { ok: true };
    } catch (err) {
      const fieldErrors = pickFormErrors(err);
      if (fieldErrors) return { ok: false, errors: fieldErrors };
      toast({ message: err?.message || 'Erreur lors de la mise à jour de la photo.', type: 'error' });
      return { ok: false };
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!confirmPhoto) return;
    setDeletingId(confirmPhoto.id);
    try {
      await deletePhoto(confirmPhoto.id);
      onChange?.(photos.filter((p) => p.id !== confirmPhoto.id));
      toast({ message: 'Photo supprimée.', type: 'success' });
    } catch (err) {
      toast({ message: err?.message || 'Erreur de suppression.', type: 'error' });
    } finally {
      setDeletingId(null);
      setConfirmPhoto(null);
    }
  };

  return (
    <>
      <div className="mb-8 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Photos de réalisations</h2>
          <p className="text-sm text-gray-500">
            Ajoutez jusqu'à <b>{MAX_PHOTOS}</b> photos (JPG ou PNG, 5 Mo max). Une vignette est générée automatiquement.
          </p>
        </div>
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-semibold',
            full ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' : 'bg-primary-50 text-primary-700 ring-1 ',
          )}
        >
          {photos.length}/{MAX_PHOTOS}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            isDeleting={deletingId === photo.id}
            onEdit={openEdit}
            onRequestDelete={setConfirmPhoto}
          />
        ))}

        {Array.from({ length: slotCount }, (_, index) => (
          <AddPhotoSlot
            key={`slot-${index}`}
            slotNumber={photos.length + index + 1}
            slotCount={slotCount}
            onClick={openAdd}
          />
        ))}
      </div>

      <PhotoFormModal
        key={editing ? `edit-${editing.id}` : 'add'}
        open={formOpen}
        photo={editing}
        onClose={closeForm}
        onSubmit={(file, fields) => (editing ? handleUpdate(fields) : handleAdd(file, fields))}
        submitting={submitting}
        remaining={remaining}
      />

      <Modal
        open={!!confirmPhoto}
        onClose={() => !deletingId && setConfirmPhoto(null)}
        dismissable={!deletingId}
        title="Supprimer la photo ?"
        description="Cette action est irréversible. La photo disparaîtra aussi de votre fiche publique."
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirmPhoto(null)} disabled={!!deletingId}>
              Annuler
            </Button>
            <Button variant="danger" onClick={confirmDelete} loading={!!deletingId}>
              Supprimer
            </Button>
          </>
        }
      />
    </>
  );
}