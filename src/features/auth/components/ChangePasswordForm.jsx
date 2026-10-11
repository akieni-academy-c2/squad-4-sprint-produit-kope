import { useMemo, useState } from 'react';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { changePassword } from '../services/auth.service.js';
import { Button } from '@/shared/components/ui/Button.jsx';
import { FormField } from '@/shared/components/ui/FormField.jsx';
import { PasswordInput } from '@/shared/components/ui/PasswordInput.jsx';
import { checkPassword, FIELD_STATUS, PASSWORD_RULES, useFieldStatus } from '@/shared/hooks/useFieldStatus.js';

export function ChangePasswordForm({ bare = false } = {}) {
  const { toast } = useNotification();
  const { close: closeModal } = useAuthModal();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordCheck = useMemo(() => checkPassword(newPassword), [newPassword]);
  const newStatus = useFieldStatus(null, newPassword, { rules: PASSWORD_RULES });

  const confirmStatus = useMemo(() => {
    if (!confirmPassword) return { status: FIELD_STATUS.IDLE, missing: 0, total: 1 };
    const matches = confirmPassword === newPassword;
    return { status: matches ? FIELD_STATUS.OK : FIELD_STATUS.NEAR, missing: matches ? 0 : 1, total: 1 };
  }, [confirmPassword, newPassword]);

  // Bouton actif seulement quand les trois champs sont conformes.
  const ready =
    currentPassword.length > 0 &&
    newStatus.status === FIELD_STATUS.OK &&
    confirmStatus.status === FIELD_STATUS.OK;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!ready) return;
    if (newPassword !== confirmPassword) {
      toast({ message: 'Les deux mots de passe ne correspondent pas.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({ message: 'Mot de passe mis à jour. Les autres appareils ont été invalidés.', type: 'success' });
      closeModal();
    } catch (err) {
      toast({ message: err?.message || 'Erreur.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={bare ? 'w-full px-5' : 'mx-auto w-full max-w-md px-5'}>
      <h2 className="text-2xl font-extrabold tracking-tight text-primary-500">Changer le mot de passe</h2>
      <p className="mb-6 mt-2 text-sm text-gray-500">Votre session reste active sur cet appareil. Les autres appareils seront invalidés.</p>
      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <FormField label="Mot de passe actuel" id="change-current">
          <PasswordInput
            id="change-current"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            placeholder="Votre mot de passe actuel"
          />
        </FormField>

        <FormField
          label="Nouveau mot de passe"
          id="change-new"
          liveStatus={newStatus}
          passwordRules={newPassword ? passwordCheck.rules : null}
        >
          <PasswordInput
            id="change-new"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            success={newStatus.status === FIELD_STATUS.OK}
            required
            placeholder="Au moins 8 caractères"
          />
        </FormField>

        <FormField
          label="Confirmer le nouveau mot de passe"
          id="change-confirm"
          liveStatus={confirmStatus}
          hint="Les deux saisies doivent être identiques"
        >
          <PasswordInput
            id="change-confirm"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            success={confirmStatus.status === FIELD_STATUS.OK}
            required
            placeholder="Confirmez le nouveau mot de passe"
          />
        </FormField>

        <Button type="submit" loading={loading} disabled={!ready} variant="primary" className="w-full">Mettre à jour</Button>
      </form>
    </div>
  );
}