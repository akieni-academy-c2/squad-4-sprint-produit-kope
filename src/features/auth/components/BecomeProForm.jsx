import { useMemo, useState } from "react";
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { Button } from '@/shared/components/ui/Button.jsx';
import { FormField } from '@/shared/components/ui/FormField.jsx';
import { Input } from '@/shared/components/ui/Input.jsx';
import { CustomSelect } from '@/shared/components/ui/CustomSelect.jsx';
import { Textarea } from '@/shared/components/ui/Textarea.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';
import { Skeleton } from '@/shared/components/ui/Skeleton.jsx';
import { useForm } from '@/shared/hooks/useForm.js';
import { becomeProfessionalSchema } from '@/shared/utils/validators.js';
import { useFormReadiness } from '@/shared/hooks/useFormReadiness.js';
import { becomeProfessional } from '../services/auth.service.js';
import { useReferenceData } from '@/features/reference/hooks/useReferenceData.js';
import { ROUTES } from '@/shared/lib/constants.js';
import { MultiSelect } from "@/shared/components/ui/MultiSelect.jsx";

const INITIAL = { displayName: '', tradeId: '', zoneIds: [], yearsExperience: '', description: '' };
const STEP1_FIELDS = { displayName: true, tradeId: true, zoneIds: true };

export function BecomeProForm({ bare = false } = {}) {
  const { refresh } = useAuthContext();
  const { close: closeModal } = useAuthModal();
  const navigate = useNavigate();
  const { toast } = useNotification();
  const { trades, zones, loading: loadingRefs } = useReferenceData();
  const [step, setStep] = useState(1);

  const { values, errors, submitting, setField, handleSubmit, setErrors } = useForm(
    becomeProfessionalSchema,
    INITIAL,
    async (data) => becomeProfessional(data),
  );

  // Étape 1 : nom affiché, métier et zones doivent être valides pour continuer.
  const step1Schema = useMemo(() => becomeProfessionalSchema.pick(STEP1_FIELDS), []);
  const { ready: step1Ready } = useFormReadiness(step1Schema, values);
  const { ready: allReady } = useFormReadiness(becomeProfessionalSchema, values);

  const goNext = () => {
    const r = becomeProfessionalSchema.pick(STEP1_FIELDS).safeParse(values);
    if (!r.success) {
      const fe = z.flattenError(r.error).fieldErrors;
      setErrors(Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v[0]])));
      return;
    }
    setErrors({});
    setStep(2);
  };

  const onSubmit = async (e) => {
    const res = await handleSubmit(e);
    if (res.ok) {
      toast({ message: 'Votre compte est maintenant professionnel !', type: 'success' });
      closeModal();
      await refresh();
      navigate(ROUTES.DASHBOARD_PRO, { replace: true });
    } else if (res.error?.errors) {
      setErrors((prev) => ({ ...prev, ...res.error.errors }));
      toast({ message: res.error.message || 'Veuillez corriger les erreurs.', type: 'error' });
    } else if (res.error?.message)
      toast({ message: res.error.message, type: 'error' });

  };

  return (
    <Card className={bare ? 'p-5 border-0 shadow-none' : 'p-6 sm:p-8'}>
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Faites connaître votre métier.</h1>
      <p className="mt-1 text-sm text-gray-500">
        Commencez par l'essentiel. Vous compléterez votre profil ensuite.
      </p>
      {loadingRefs && (
        <div className="mt-6 space-y-3" aria-busy="true">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      )}
      <form className="mt-6 space-y-5" onSubmit={onSubmit} noValidate hidden={loadingRefs}>
        {step === 1 && (
          <>
            <FormField
              id="bp-display"
              label="Nom affiché (votre nom plus le grand public)"
              required
              error={errors.displayName}
              placeholder="Ex : Plomberie Makélékélé Services"
              help="1 à 100 caractères"
              counter={
                <span className={(values.displayName || '').length > 100 ? 'text-danger-500 font-semibold' : ''}>
                  {(values.displayName || '').length}/100
                </span>
              }
              value={values.displayName}
              onChange={(e) => setField('displayName', e.target.value.slice(0, 100))}
            />
            <FormField id="bp-trade" label="Métier" required error={errors.tradeId}>
              <CustomSelect
                id="bp-trade"
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
                aria-describedby={errors.tradeId ? 'bp-trade-error' : undefined}
              />
            </FormField>
            <MultiSelect
              label="Zone"
              required
              hint="Sélectionnez au moins une zone."
              error={errors.zoneIds}
              options={zones.map((z) => ({ value: z.id, label: z.name }))}
              value={values.zoneIds || []}
              onChange={(ids) => setField('zoneIds', ids)}
            />
            <Button type="button" onClick={goNext} disabled={!step1Ready} size="lg" className="w-full">
              Suivant
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <FormField
              id="bp-years"
              label="Années d'expérience"
              required
              help="Indiquez vos années d'expérience"
              as="input"
            >
              <Input
                id="bp-years"
                type="number"
                min="0"
                max="60"
                value={values.yearsExperience}
                onChange={(e) => setField('yearsExperience', e.target.value)}
                placeholder="Ex : 5"
                error={errors.yearsExperience}
              />
            </FormField>
            <FormField
              id="bp-description"
              label="Description"
              required
              error={errors.description}
              help="30 à 500 caractères : décrivez vos services, votre secteur, votre expérience."
              counter={
                <span className={(values.description || '').length < 30 || (values.description || '').length > 500 ? 'text-danger-500 font-semibold' : ''}>
                  {(values.description || '').length}/500
                </span>
              }
              as="textarea"
            >
              <Textarea
                id="bp-description"
                rows={3}
                value={values.description}
                onChange={(e) => setField('description', e.target.value.slice(0, 500))}
                placeholder="Décrivez vos services, votre secteur, votre expérience..."
              />
            </FormField>
            <div className="flex items-center gap-3">
              <Button type="button" variant="secondary" size="lg" onClick={() => setStep(1)} className="w-1/2">
                Précédent
              </Button>
              <Button type="submit" loading={submitting} disabled={!allReady} size="lg" className="w-1/2">
                Valider
              </Button>
            </div>
          </>
        )}
      </form>
    </Card>
  );
}
