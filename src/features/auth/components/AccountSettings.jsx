import { useState } from 'react';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { updateAccount, changePassword } from '../services/auth.service.js';
import { Button } from '@/shared/components/ui/Button.jsx';
import { FormField } from '@/shared/components/ui/FormField.jsx';
import { Input } from '@/shared/components/ui/Input.jsx';
import { PasswordInput } from '@/shared/components/ui/PasswordInput.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';

export function AccountSettings({ user, passwordOnly = false }) {
  const { refresh } = useAuthContext();
  const { toast } = useNotification();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const submitName = async (e) => {
    e.preventDefault();
    setSavingName(true);
    const payload = { phone: phone.trim() };
    if (user?.role !== 'professional' && user?.role !== 'admin') {
      payload.firstName = firstName.trim();
      payload.lastName = lastName.trim();
    }
    try {
      await updateAccount(payload);
      await refresh();
      toast({ message: 'Informations enregistrées.', type: 'success' });
    } catch (err) {
      toast({ message: err?.message || 'Erreur.', type: 'error' });
    } finally {
      setSavingName(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ message: 'Les deux mots de passe ne correspondent pas.', type: 'error' });
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({ message: 'Mot de passe mis à jour. Les autres appareils ont été invalidés.', type: 'success' });
    } catch (err) {
      toast({ message: err?.message || 'Erreur.', type: 'error' });
    } finally {
      setSavingPassword(false);
    }
  };

  const showNameForm = user?.role !== 'professional' && user?.role !== 'admin';

  return (
    <div className="space-y-6">
      {!passwordOnly && showNameForm && (
        <Card className="p-6">
          <h3 className="text-base font-bold text-gray-900">Informations personnelles</h3>
          <form onSubmit={submitName} className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="Prénom(s)" id="acc-firstname">
              <Input id="acc-firstname" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </FormField>
            <FormField label="Nom(s)" id="acc-lastname">
              <Input id="acc-lastname" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </FormField>
            <FormField label="Téléphone" id="acc-phone">
              <Input id="acc-phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </FormField>
            <div className="flex items-end">
              <Button type="submit" loading={savingName} variant="primary">Enregistrer</Button>
            </div>
          </form>
        </Card>
      )}

      {!passwordOnly && !showNameForm && (
        <Card className="p-6">
          <h3 className="text-base font-bold text-gray-900">Numéro de téléphone</h3>
          <form onSubmit={submitName} className="mt-4 max-w-md space-y-4">
            <FormField label="Téléphone" id="acc-phone-pro">
              <Input id="acc-phone-pro" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </FormField>
            <Button type="submit" loading={savingName} variant="primary">Enregistrer</Button>
          </form>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-base font-bold text-gray-900">Changer le mot de passe</h3>
        <form onSubmit={submitPassword} className="mt-4 space-y-4 max-w-md">
          <FormField label="Mot de passe actuel" id="acc-current" as="input">
            <PasswordInput
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Votre mot de passe actuel"
              required
            />
          </FormField>
          <FormField label="Nouveau mot de passe" id="acc-new" help="Au moins 8 caractères." as="input">
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="8 caractères minimum"
              required
              minLength={8}
            />
          </FormField>
          <FormField label="Confirmer le nouveau mot de passe" id="acc-confirm" as="input">
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmez le nouveau mot de passe"
              required
            />
          </FormField>
          <Button type="submit" loading={savingPassword} variant="primary">Mettre à jour</Button>
        </form>
      </Card>
    </div>
  );
}
