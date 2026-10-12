import { useState } from 'react';
import { Camera, Pencil } from 'lucide-react';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { Button } from '@/shared/components/ui/Button.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';
import { UserAvatar } from '@/shared/components/ui/UserAvatar.jsx';
import { updateAccount, uploadAvatar } from '@/features/auth/services/auth.service.js';
import { useFormReadiness } from '@/shared/hooks/useFormReadiness.js';
import { updateAccountSchema } from '@/shared/utils/validators.js';
import { BecomeProCard } from './BecomeProCard.jsx';

function Field({ label, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <input
        className="w-full rounded-sm border border-gray-200 bg-white px-3 py-2 text-sm"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-4 px-6 py-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-semibold text-gray-900">{value}</dd>
    </div>
  );
}

export function ClientProfileSection({ user }) {
  const { refresh } = useAuthContext();
  const { toast } = useNotification();
  const { open: openModal } = useAuthModal();

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatarUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || '-';

  // Formulaire de modification : le bouton n'est actif que si les valeurs
  // sont valides ET différentes de celles enregistrées.
  const { ready, dirty } = useFormReadiness(updateAccountSchema, { firstName, lastName, phone });
  const canSubmit = ready && dirty;

  const save = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      await updateAccount({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() });
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
            <Button variant="outline" size="sm" onClick={() => openModal('change-password')}>
              Changer le mot de passe
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing((v) => !v)}>
            <Pencil size={16} aria-hidden className="inline" /> {editing ? 'Annuler' : 'Modifier'}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        {/* Bandeau d'identité sur dégradé : même composition que la carte de
            statut de `ProSidebar` — dégradé en haut, informations en dessous.
            Deux sections qui affichent la même personne doivent se ressembler. */}
        <div className="bg-gradient-to-r from-primary-50 to-kop-mint/60 p-5 pb-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
              <UserAvatar user={user} src={avatar} className="h-full w-full" rounded="rounded-none" />
              {editing && (
                <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 text-white">
                  <Camera size={18} aria-hidden />
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="sr-only"
                    disabled={uploading}
                    onChange={onAvatarChange}
                  />
                </label>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-gray-900">{name}</p>
              <p className="text-xs text-gray-500">{user?.phone || 'Aucun numéro'}</p>
              {editing &&
                (uploading ? (
                  <div className="mt-2 w-40 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-primary-500 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                ) : (
                  <p className="mt-1 text-[12px] font-semibold text-primary-600">
                    Cliquez sur la photo pour la changer
                  </p>
                ))}
            </div>
          </div>
        </div>

        {editing ? (
          <form onSubmit={save} className="grid gap-4 px-5 py-5 sm:grid-cols-2">
            <Field label="Prénom(s)" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Field label="Nom(s)" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <Field label="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <div className="sm:col-span-2">
              <Button type="submit" loading={saving} disabled={!canSubmit}>Enregistrer</Button>
            </div>
          </form>
        ) : (
          <dl className="divide-y divide-gray-100 text-sm">
            <Detail label="Nom complet" value={name} />
            <Detail label="Téléphone" value={user?.phone || '-'} />
            <Detail label="Rôle" value="Client" />
          </dl>
        )}
      </Card>

      <div className="lg:hidden">
        <BecomeProCard />
      </div>

      <div className="sm:hidden space-y-4">
        <Button variant="outline" size="md" className="w-full" onClick={() => openModal('change-password')}>
          Changer le mot de passe
        </Button>
      </div>
    </div>
  );
}