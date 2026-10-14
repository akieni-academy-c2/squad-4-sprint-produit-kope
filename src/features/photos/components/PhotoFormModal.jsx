import { useState } from 'react';
import { Button } from '@/shared/components/ui/Button.jsx';
import { Input } from '@/shared/components/ui/Input.jsx';
import { Textarea } from '@/shared/components/ui/Textarea.jsx';
import { FormField } from '@/shared/components/ui/FormField.jsx';
import { FileUpload } from '@/shared/components/ui/FileUpload.jsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/Dialog.jsx';
import { addPhotoSchema, validateFrontend } from '@/shared/utils/validators.js';
import { useFormReadiness } from '@/shared/hooks/useFormReadiness.js';

export function PhotoFormModal({ open, photo, onClose, onSubmit, submitting, remaining }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState(photo?.title || photo?.caption || '');
  const [description, setDescription] = useState(photo?.description || '');
  const [errors, setErrors] = useState({});

  const reset = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setErrors({});
  };

  const close = () => {
    if (submitting) return;
    onClose?.();
    reset();
  };

  const { ready } = useFormReadiness(addPhotoSchema, { title, description });
  const canSubmit = ready && Boolean(photo || file);

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!canSubmit) return;
    const check = validateFrontend(addPhotoSchema, { title, description });
    if (!check.success) {
      setErrors(check.errors);
      return;
    }
    if (!photo && !file) {
      setErrors({ file: 'Choisissez une image' });
      return;
    }
    setErrors({});
    const res = await onSubmit(photo ? null : file, {
      title: check.data.title,
      description: check.data.description,
    });
    if (res?.ok) reset();
    else if (res?.errors) setErrors((prev) => ({ ...prev, ...res.errors }));
  };

  const remainingLabel = `${remaining} emplacement${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''}.`;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent className="max-w-lg p-8" onClose={close}>
        <DialogHeader>
          <DialogTitle>{photo ? 'Modifier la photo' : 'Ajouter une photo'}</DialogTitle>
          <DialogDescription>
            {photo
              ? 'Modifiez le titre et la description de cette réalisation. L\'image reste inchangée.'
              : `Image, titre et description de votre réalisation · ${remainingLabel}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate className="space-y-4">
          {!photo && (
            <div>
              <FileUpload
                label={file ? "Changer l'image" : 'Choisir une image'}
                hint="JPG ou PNG · 5 Mo maximum"
                value={file}
                onChange={(next) => {
                  setFile(next);
                  if (next) setErrors((prev) => ({ ...prev, file: undefined }));
                }}
                capture="environment"
                disabled={submitting}
              />
              {errors.file && <p role="alert" className="mt-1 text-xs text-danger-500">{errors.file}</p>}
            </div>
          )}

          <FormField
            id="ap-title"
            label="Titre"
            required
            error={errors.title}
            counter={
              <span className={title.length < 3 || title.length > 100 ? 'text-danger-500 font-semibold' : ''}>
                {title.length}/100
              </span>
            }
          >
            <Input
              id="ap-title"
              placeholder="Ex : Réparation d'une fuite cuisine"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              maxLength={100}
              disabled={submitting}
            />
          </FormField>

          <FormField
            id="ap-description"
            label="Description"
            required
            as="textarea"
            error={errors.description}
            counter={
              <span className={description.length < 10 || description.length > 500 ? 'text-danger-500 font-semibold' : ''}>
                {description.length}/500
              </span>
            }
          >
            <Textarea
              id="ap-description"
              rows={3}
              placeholder="Ex : Intervention le jour même, changement du siphon et test d'étanchéité complet."
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              maxLength={500}
              disabled={submitting}
            />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="ghost" size="md" onClick={close} disabled={submitting}>
              Annuler
            </Button>
            <Button type="submit" size="md" loading={submitting} disabled={!canSubmit}>
              {photo ? 'Enregistrer' : 'Publier la photo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}