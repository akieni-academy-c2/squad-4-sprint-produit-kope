import { Button } from '@/shared/components/ui/Button.jsx';
import { FormField } from '@/shared/components/ui/FormField.jsx';
import { PhoneInput } from '@/shared/components/ui/PhoneInput.jsx';
import { FIELD_STATUS } from '@/shared/hooks/useFieldStatus.js';
import { MOBILE_HINT } from '@/shared/utils/normalizePhone.js';
import { CustomSelect } from '@/shared/components/ui/CustomSelect.jsx';
import { MultiSelect } from '@/shared/components/ui/MultiSelect.jsx';
import { Textarea } from '@/shared/components/ui/Textarea.jsx';
import { DESC_MAX, DESC_MIN } from './profileForm.js';
import { ProfileSection } from './ProfileSection.jsx';

/**
 * `{ status, total }` attendu par `FormField`.
 *
 * Un champ absent de `statuses` — le cas tant qu'aucune saisie n'a eu lieu —
 * rend `undefined` et non un objet vide : `FormField` teste
 * `liveStatus?.status === OK`, un objet `{ status: undefined }` passerait le
 * `&&` et poserait une ligne d'état vide sous le champ.
 */
function statusOf(statuses, field) {
  const status = statuses?.[field];
  return status ? { status, missing: 0, total: 1 } : undefined;
}

export function ProfileEditForm({
  onSubmit,
  values,
  errors,
  submitting,
  setField,
  trades,
  zones,
  cities = [],
  loadingRefs,
  account,
  accountErrors = {},
  accountStatuses = {},
  onAccountField,
  canSubmit = true,
  submitHint = null,
}) {
  const descLen = String(values.description ?? '').length;

  // Brazzaville par défaut : c'est la ville de la quasi-totalité des
  // professionnels de la démo, et laisser le champ vide les forcerait à
  // descendre le voir avant de choisir quoi que ce soit. Le défaut est
  // appliqué à la ville *affichée*, pas enregistré : tant que le formulaire
  // n'est pas soumis, `cityId` reste vide et le professionnel peut changer
  // d'avis sans avoir modifié quoi que ce soit.
  const defaultCity = cities.find((c) => /brazzaville/i.test(c.name)) ?? null;
  const effectiveCityId = values.cityId ?? defaultCity?.id ?? null;
  const cityZones = zones.filter((z) => String(z.cityId) === String(effectiveCityId));

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <ProfileSection title="Informations personnelles">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="pe-firstName"
            label="Prénom(s)"
            value={account.firstName}
            onChange={(e) => onAccountField('firstName', e.target.value)}
            error={accountErrors.firstName}
            liveStatus={statusOf(accountStatuses, 'firstName')}
          />
          <FormField
            id="pe-lastName"
            label="Nom(s)"
            value={account.lastName}
            onChange={(e) => onAccountField('lastName', e.target.value)}
            error={accountErrors.lastName}
            liveStatus={statusOf(accountStatuses, 'lastName')}
          />
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
            error={accountErrors.phone}
            liveStatus={statusOf(accountStatuses, 'phone')}
            hint={MOBILE_HINT}
          >
            {/*
              Même composant que l'inscription et la connexion : un numéro se
              saisit partout de la même façon, indicatif compris. Trois
              implémentations du même champ auraient divergé au premier ajustement
              — et c'est ce qui s'était produit.
            */}
            <PhoneInput
              id="pe-phone"
              value={account.phone}
              onChange={(value) => onAccountField('phone', value)}
              error={accountErrors.phone}
              success={statusOf(accountStatuses, 'phone').status === FIELD_STATUS.OK}
            />
          </FormField>

          <FormField
            id="pe-whatsapp"
            label="Numéro WhatsApp"
            error={errors.whatsapp}
            help="Laissez vide pour utiliser votre numéro de compte."
          >
            {/* Même champ, même indicatif : un lien WhatsApp doit partir du même
                numéro que celui affiché sur la fiche. */}
            <PhoneInput
              id="pe-whatsapp"
              value={values.whatsapp}
              onChange={(value) => setField('whatsapp', value)}
              error={errors.whatsapp}
            />
          </FormField>
          {/* En dernier : c'est le canal de repli, celui que le professionnel
              renseigne le moins souvent. Laisser le téléphone et WhatsApp côte à
              côte, puis l'e-mail, suit l'ordre de préférence du contact. */}
          <FormField
            id="pe-email"
            type="email"
            label="E-mail"
            value={account.email ?? ''}
            onChange={(e) => onAccountField('email', e.target.value)}
            error={accountErrors.email}
            liveStatus={statusOf(accountStatuses, 'email')}
            placeholder="vous@exemple.com"
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

          {/* Le catalogue vient de l'espace admin : aucune ville n'est saisie en
              dur, un administrateur peut en ajouter sans intervention du code. */}
          <FormField id="pe-city" label="Ville" error={errors.cityId}>
            <CustomSelect
              id="pe-city"
              name="cityId"
              className="w-full"
              value={effectiveCityId == null ? '' : String(effectiveCityId)}
              placeholder="Choisissez une ville"
              disabled={loadingRefs}
              onChange={(value) => setField('cityId', value === '' ? null : value)}
              options={[
                { value: '', label: 'Non renseignée' },
                ...cities.map((c) => ({ value: String(c.id), label: c.name })),
              ]}
              aria-label="Ville d’exercice"
              aria-invalid={Boolean(errors.cityId) || undefined}
              aria-describedby={errors.cityId ? 'pe-city-error' : undefined}
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

        {/* La ville passe avant les zones, et pas seulement dans l'ordre du
            formulaire : elle les restreint. Une zone appartient à une ville
            (`zones.city_id`), et proposer celles de Pointe-Noire pendant qu'on
            a choisi Brazzaville conduit à un profil incohérent — on ne peut pas
            être à la fois dans les deux.

            Changer de ville ne vide pas la sélection : elle reste visible pour
            que l'utilisateur voie pourquoi elle ne convient plus, et le serveur
            la refusera à l'enregistrement. */}
        <div className="mt-4">
          {/* Les zones affichées sont celles de la ville choisie — rien d'autre. */}
          <MultiSelect
            label="Zones"
            required
            hint={
              effectiveCityId == null
                ? 'Choisissez d’abord une ville pour voir ses zones.'
                : 'Sélectionnez au moins une zone.'
            }
            error={errors.zoneIds}
            disabled={loadingRefs || effectiveCityId == null}
            options={cityZones.map((z) => ({ value: z.id, label: z.name }))}
            value={values.zoneIds || []}
            onChange={(ids) => setField('zoneIds', ids)}
          />
        </div>
      </ProfileSection>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
        {/* Le libellé ne dit pas « Enregistrer » tant qu'un champ est incomplet :
            un bouton grisé sans dire quoi corriger est une impasse. */}
        {submitHint && (
          <span aria-live="polite" className="text-xs text-gray-500">
            {submitHint}
          </span>
        )}
        <Button type="submit" loading={submitting} disabled={!canSubmit} size="md">
          Enregistrer
        </Button>
      </div>
    </form>
  );
}