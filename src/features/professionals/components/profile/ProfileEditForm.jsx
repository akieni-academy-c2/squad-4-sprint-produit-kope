import { Button } from '@/shared/components/ui/Button.jsx';
import { FormField } from '@/shared/components/ui/FormField.jsx';
import { CustomSelect } from '@/shared/components/ui/CustomSelect.jsx';
import { MultiSelect } from '@/shared/components/ui/MultiSelect.jsx';
import { Textarea } from '@/shared/components/ui/Textarea.jsx';
import { DESC_MAX, DESC_MIN } from './profileForm.js';
import { ProfileSection } from './ProfileSection.jsx';

function TextInput({ id, label, value, onChange, ...rest }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-semibold text-gray-600">{label}</label>
      <input
        id={id}
        className="w-full rounded-sm border border-gray-200 bg-white px-3 py-2 text-sm"
        value={value}
        onChange={onChange}
        {...rest}
      />
    </div>
  );
}

/** Formulaire de modification du profil professionnel. */
export function ProfileEditForm({
  onSubmit,
  values,
  errors,
  submitting,
  setField,
  trades,
  zones,
  loadingRefs,
  account,
  onAccountField,
  canSubmit = true,
}) {
  const descLen = String(values.description ?? '').length;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <ProfileSection title="Informations personnelles">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput id="pe-firstName" label="Prénom(s)" value={account.firstName} onChange={(e) => onAccountField('firstName', e.target.value)} />
          <TextInput id="pe-lastName" label="Nom(s)" value={account.lastName} onChange={(e) => onAccountField('lastName', e.target.value)} />
        </div>
        <div className="mt-4">
          <FormField
            id="pe-display"
            label="Nom affiché (votre nom pour le grand public)"
            required
            error={errors.displayName}
            placeholder="Ex : Plomberie Makélékélé Services"
            help="1 à 100 caractères"
            counter={
              <span className={values.displayName?.length > 100 ? 'text-danger-500 font-semibold' : ''}>
                {(values.displayName || '').length}/100
              </span>
            }
            value={values.displayName}
            onChange={(e) => setField('displayName', e.target.value.slice(0, 100))}
          />
        </div>
      </ProfileSection>

      <ProfileSection title="Contact">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="pe-phone"
            label="Téléphone"
            value={account.phone}
            onChange={(e) => onAccountField('phone', e.target.value)}
            inputMode="tel"
          />
          <FormField
            id="pe-whatsapp"
            label="Numéro WhatsApp"
            error={errors.whatsapp}
            placeholder="+242... (laisser vide pour utiliser votre numéro de compte)"
            value={values.whatsapp}
            onChange={(e) => setField('whatsapp', e.target.value)}
            inputMode="tel"
          />
        </div>
      </ProfileSection>

      <ProfileSection title="Description">
        <FormField
          id="pe-desc"
          label="Description de votre activité"
          required
          as="textarea"
          error={errors.description}
          help={`${DESC_MIN} à ${DESC_MAX} caractères : décrivez le contexte, la prestation, le résultat.`}
          counter={
            <span className={descLen < DESC_MIN || descLen > DESC_MAX ? 'text-danger-500 font-semibold' : ''}>
              {descLen}/{DESC_MAX}
            </span>
          }
        >
          <Textarea
            id="pe-desc"
            rows={3}
            placeholder="Présentez votre activité, vos services, vos horaires, vos garanties..."
            value={values.description}
            onChange={(e) => setField('description', e.target.value.slice(0, DESC_MAX + 10))}
            error={errors.description}
          />
        </FormField>
      </ProfileSection>

      <ProfileSection title="Informations professionnelles">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="pe-trade" label="Métier" required error={errors.tradeId}>
            <CustomSelect
              id="pe-trade"
              name="tradeId"
              className="w-full"
              value={values.tradeId ?? ''}
              placeholder="Choisissez un métier"
              onChange={(value) => setField('tradeId', value)}
              options={[
                { value: '', label: 'Choisissez un métier' },
                ...trades.map((t) => ({ value: String(t.id), label: t.name })),
              ]}
              aria-label="Métier"
              aria-invalid={Boolean(errors.tradeId) || undefined}
              aria-describedby={errors.tradeId ? 'pe-trade-error' : undefined}
            />
          </FormField>
          <FormField
            id="pe-years"
            label="Années d'expérience"
            required
            error={errors.yearsExperience}
            type="number"
            min={0}
            max={60}
            step={1}
            help="Entier entre 0 et 60"
            value={values.yearsExperience}
            onChange={(e) => setField('yearsExperience', e.target.value)}
          />
        </div>

        <div className="mt-4">
          <MultiSelect
            label="Zone"
            required
            hint="Sélectionnez au moins une zone."
            error={errors.zoneIds}
            disabled={loadingRefs}
            options={zones.map((z) => ({ value: z.id, label: z.name }))}
            value={values.zoneIds || []}
            onChange={(ids) => setField('zoneIds', ids)}
          />
        </div>
      </ProfileSection>

      <div className="flex justify-end gap-3 pt-1">
        <Button type="submit" loading={submitting} disabled={!canSubmit} size="md">Enregistrer</Button>
      </div>
    </form>
  );
}