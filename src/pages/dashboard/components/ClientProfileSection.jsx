import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { Button } from '@/shared/components/ui/Button.jsx';
import { ProfileAvatarCard } from '@/features/professionals/components/profile/ProfileAvatarCard.jsx';
import { ProfileRow, ProfileSection } from '@/features/professionals/components/profile/ProfileSection.jsx';
import { updateAccount, uploadAvatar } from '@/features/auth/services/auth.service.js';
import { useFormReadiness } from '@/shared/hooks/useFormReadiness.js';
import { updateAccountSchema } from '@/shared/utils/validators.js';
import { formatDateFr } from '@/shared/utils';
import { BecomeProCard } from './BecomeProCard.jsx';

function Field({ label, value, onChange, type = 'text', placeholder, hint }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <input
        type={type}
        className="w-full rounded-sm border border-gray-200 bg-white px-3 py-2 text-sm"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
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
  // sont valides ET différentes de celles enregistrées.
  const { ready, dirty } = useFormReadiness(updateAccountSchema, { firstName, lastName, phone, email });
  const canSubmit = ready && dirty;

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
            <Button variant="outline" size="sm" onClick={() => openModal('change-password')}>
              Changer le mot de passe
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing((v) => !v)}>
            <Pencil size={16} aria-hidden className="inline" /> {editing ? 'Annuler' : 'Modifier'}
          </Button>
        </div>
      </div>

      {/* Même composant que l'espace pro : les deux profils décrivent la même
          personne, ils ne peuvent pas diverger sur la carte d'identité. */}
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
                <Field label="Prénom(s)" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <Field label="Nom(s)" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </ProfileSection>

            <ProfileSection title="Contact">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Téléphone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Field
                  type="email"
                  label="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  hint="Facultatif — laissez vide pour le retirer."
                />
              </div>
            </ProfileSection>

            <Button type="submit" loading={saving} disabled={!canSubmit}>Enregistrer</Button>
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
                <ProfileRow label="Téléphone" value={user?.phone} />
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

      {/* Déconnexion en dernier, seulement sur mobile. Desktop la trouve dans le
          menu compte du header ; ici, ce serait la seule sortie de l'écran. */}
      <div className="space-y-4 sm:hidden">
        <Button variant="outline" size="md" className="w-full" onClick={() => openModal('change-password')}>
          Changer le mot de passe
        </Button>
        <Button variant="outline" size="md" className="w-full" onClick={logout}>
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}