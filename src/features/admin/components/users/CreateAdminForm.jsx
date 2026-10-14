import { Plus, ShieldCheck, UserPlus, X } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import { PhoneInput } from '@/shared/components/ui/PhoneInput.jsx';
import { useFormReadiness } from '@/shared/hooks/useFormReadiness.js';
import { PASSWORD_RULES } from '@/shared/hooks/useFieldStatus.js';
import { createAdminSchema } from '@/shared/utils/validators.js';

const INPUT_CLASS =
  'h-9 rounded-sm border border-gray-300 bg-white px-2.5 text-sm outline-none focus:border-primary-500';

const FIELDS = [
  { key: 'firstName', placeholder: 'Prénom', type: 'text', autoFocus: true },
  { key: 'lastName', placeholder: 'Nom', type: 'text' },
];

const PASSWORD_FIELD = {
  key: 'password',
  placeholder: 'Mot de passe (8 caractères min.)',
  type: 'password',
};

export function CreateAdminForm({ draft, error, saving, onChange, onSubmit, onOpen, onCancel }) {

  const { ready } = useFormReadiness(createAdminSchema, draft ?? {}, {
    rules: { password: PASSWORD_RULES },
  });

  if (!draft)
    return (
      <Button hidden variant="secondary" size="sm" className="mt-4" onClick={onOpen}>
        <Plus className="h-4 w-4" />
        Nouvel administrateur
      </Button>
    );

  return (
    <form onSubmit={onSubmit} className="mt-4 rounded-lg border border-primary-200 bg-primary-50 p-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-bold text-primary-700">
        <UserPlus className="h-4 w-4" />
        Nouvel administrateur
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map(({ key, placeholder, type, autoFocus }) => (
          <input
            key={key}
            type={type}
            {...(autoFocus ? { autoFocus } : {})}
            value={draft[key]}
            onChange={(e) => onChange(key, e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className={INPUT_CLASS}
          />
        ))}


        <PhoneInput
          id="create-admin-phone"
          value={draft.phone}
          onChange={(value) => onChange('phone', value)}
          aria-label="Téléphone"
          className="sm:col-span-1"
        />

        <input
          key={PASSWORD_FIELD.key}
          type={PASSWORD_FIELD.type}
          value={draft[PASSWORD_FIELD.key]}
          onChange={(e) => onChange(PASSWORD_FIELD.key, e.target.value)}
          placeholder={PASSWORD_FIELD.placeholder}
          aria-label={PASSWORD_FIELD.placeholder}
          className={INPUT_CLASS}
        />
      </div>

      {error && <p className="mt-2 text-sm text-danger-500">{error}</p>}

      <div className="mt-3 flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
          Annuler
        </Button>
        <Button type="submit" size="sm" loading={saving} disabled={!ready}>
          <ShieldCheck className="h-4 w-4" />
          Créer
        </Button>
      </div>
    </form>
  );
}