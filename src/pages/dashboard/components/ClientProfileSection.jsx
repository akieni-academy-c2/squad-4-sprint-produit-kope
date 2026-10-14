import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { AUTH_MODAL_MODES } from '@/shared/context/authModalModes.js';
import { Button } from '@/shared/components/ui/Button.jsx';
import { ProfileAvatarCard } from '@/features/professionals/components/profile/ProfileAvatarCard.jsx';
import { ProfileRow, ProfileSection } from '@/features/professionals/components/profile/ProfileSection.jsx';
import { updateAccount, uploadAvatar } from '@/features/auth/services/auth.service.js';
import { useFormReadiness } from '@/shared/hooks/useFormReadiness.js';
import { submitLabel } from '@/shared/utils/submitLabel.js';
import { FormField } from '@/shared/components/ui/FormField.jsx';
import { updateAccountSchema } from '@/shared/utils/validators.js';
import { formatDateFr } from '@/shared/utils';
import { BecomeProCard } from './BecomeProCard.jsx';
import { formatPhoneFR } from '@/shared/utils';

/**
 * `{ status, total }` suffit : `FormField` n'a besoin que du statut pour colorer
 * la bordure et sortir la ligne d'état. `error` reste prioritaire, c'est le
 * message du schéma Zod, plus précis que « presque correct ».
 */
function Field({ label, value, onChange, type = 'text', placeholder, hint, status, error, id }) {
  return (
    <FormField
      id={id}
      label={label}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      help={hint}
      error={error}
      liveStatus={status ? { status, missing: 0, total: 1 } : undefined}
    />
  );
}

export function ClientProfileSection({ user }) {
  const { refresh, logout } = useAuthContext();
  const { toast } = useNotification();
  const { open: openModal } = useAuthModal();

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatarUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || '-';

  // Formulaire de modification : le bouton n'est actif que si les valeurs
  // sont valides ET différentes de celles enregistrées. `statuses` et `errors`
  // portent la même information champ par champ - ils alimentent les bordures
  // et les messages, pour qu'un bouton grisé dise quoi corriger.
  const { ready, dirty, statuses, errors } = useFormReadiness(updateAccountSchema, {
    firstName,
    lastName,
    phone,
    email,
  });
  const canSubmit = ready && dirty;

  // Ordre du formulaire, pas ordre alphabétique : le premier défaut affiché
  // doit être le premier champ à corriger.
  const label = submitLabel(statuses, ['firstName', 'lastName', 'phone', 'email'], 'Enregistrer');

  const save = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      await updateAccount({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        // Vide = retrait de l'adresse. Le serveur distingue `null` (effacer)
        // de l'absence de clé (ne pas toucher), d'où les deux Spread.
        ...(email.trim() ? { email: email.trim() } : { email: null }),
      });
      await refresh();
      setEditing(false);
      toast({ message: 'Informations enregistrées.', type: 'success' });
    } catch (err) {
      toast({ message: err?.message || 'Erreur.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadAvatar(file, setUploadProgress);
      if (url) setAvatar(url);
      await refresh();
      setUploadProgress(100);
      toast({ message: 'Photo de profil mise à jour.', type: 'success' });

      // L'avatar est enregistré à l'instant même, indépendamment du formulaire.
      // Si aucun champ texte n'est modifié, il ne reste donc rien à
      // enregistrer : sans cette sortie, l'utilisateur reste devant un
      // formulaire dont « Enregistrer » est désactivé alors que sa photo vient
      // d'être prise en compte.
      if (!dirty) setEditing(false);
    } catch (err) {
      toast({ message: err?.message || 'Erreur lors du téléversement.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Mon profil</h2>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <Button variant="outline" size="sm" onClick={() => openModal(AUTH_MODAL_MODES.CHANGE_PASSWORD)}>
              Changer le mot de passe
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing((v) => !v)}>
            <Pencil size={16} aria-hidden className="inline" /> {editing ? 'Annuler' : 'Modifier'}
          </Button>
        </div>
      </div>

       <ProfileAvatarCard
        user={user}
        avatar={avatar}
        name={name}
        tradeName="Client"
        editing={editing}
        uploading={uploading}
        uploadProgress={uploadProgress}
        onAvatarChange={onAvatarChange}
      />

        {editing ? (
          <form onSubmit={save} className="space-y-4">
            <ProfileSection title="Informations personnelles">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="profile-firstName"
                  label="Prénom(s)"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  status={statuses.firstName}
                  error={errors.firstName}
                />
                <Field
                  id="profile-lastName"
                  label="Nom(s)"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  status={statuses.lastName}
                  error={errors.lastName}
                />
              </div>
            </ProfileSection>

            <ProfileSection title="Contact">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="profile-phone"
                  label="Téléphone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  status={statuses.phone}
                  error={errors.phone}
                />
                <Field
                  id="profile-email"
                  type="email"
                  label="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  hint="Facultatif - laissez vide pour le retirer."
                  status={statuses.email}
                  error={errors.email}
                />
              </div>
            </ProfileSection>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" loading={saving} disabled={!canSubmit}>{label}</Button>
               {!ready && (
                <span aria-live="polite" className="text-xs text-gray-500">
                  {label}
                </span>
              )}
            </div>
          </form>
        ) : (
          <>
            <ProfileSection title="Informations personnelles">
              <dl className="divide-y divide-gray-100">
                <ProfileRow label="Prénom" value={user?.firstName} />
                <ProfileRow label="Nom" value={user?.lastName} />
                <ProfileRow label="Inscrit depuis" value={formatDateFr(user?.createdAt)} />
              </dl>
            </ProfileSection>

            <ProfileSection
              title="Contact"
              description="Ces coordonnées sont celles que les professionnels utilisent pour vous joindre."
            >
              <dl className="divide-y divide-gray-100">
                <ProfileRow label="Téléphone" value={formatPhoneFR(user?.phone)} />
                <ProfileRow label="E-mail" value={user?.email} />
              </dl>
            </ProfileSection>
          </>
        )}

      {editing && (
        <p className="-mt-2 text-[12px] font-semibold text-primary-600">
          Cliquez sur la photo pour la changer
        </p>
      )}

      <div className="lg:hidden">
        <BecomeProCard />
      </div>

       <div className="space-y-4 sm:hidden">
        <Button variant="outline" size="md" className="w-full" onClick={() => openModal(AUTH_MODAL_MODES.CHANGE_PASSWORD)}>
          Changer le mot de passe
        </Button>
        <Button variant="outline" size="md" className="w-full" onClick={logout}>
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}