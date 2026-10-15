import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "@/shared/components/ui/Link.jsx";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useAuthContext } from "@/shared/context/AuthContext.jsx";
import { useAuthModal } from "@/shared/context/AuthModalContext.jsx";
import { useNotification } from "@/shared/context/NotificationContext.jsx";
import { Button } from "@/shared/components/ui/Button.jsx";
import { FormField } from "@/shared/components/ui/FormField.jsx";
import { PasswordInput } from "@/shared/components/ui/PasswordInput.jsx";
import { PhoneInput } from "@/shared/components/ui/PhoneInput.jsx";
import { StepIndicator } from "@/shared/components/ui/StepIndicator.jsx";
import { Checkbox } from "@/shared/components/ui/Checkbox.jsx";
import { useForm } from "@/shared/hooks/useForm.js";
import {
  checkPassword,
  FIELD_STATUS,
  fieldValidator,
  PASSWORD_RULES,
  useFieldStatus,
} from "@/shared/hooks/useFieldStatus.js";
import { isHopelessPhone, MOBILE_HINT } from "@/shared/utils/normalizePhone.js";
import { registerClientSchema } from "@/shared/utils/validators.js";
import { registerClient } from "../services/auth.service.js";
import { ROUTES } from "@/shared/lib/constants.js";
import { submitLabel } from "@/shared/utils/submitLabel.js";
import { TERMS_VERSION } from "@/shared/content/terms.js";

const INITIAL = {
  firstName: "",
  lastName: "",
  phone: "",
  password: "",
  consent: false,
};
const STEPS = ["Identité", "Sécurité"];

export function RegisterClientForm({ bare = false } = {}) {
  const { user, login } = useAuthContext();
  const { close: closeModal } = useAuthModal();
  const navigate = useNavigate();
  const { toast } = useNotification();
  const [step, setStep] = useState(1);
  const [confirmPassword, setConfirmPassword] = useState("");

  const { values, errors, submitting, setField, handleSubmit, setErrors } =
    useForm(registerClientSchema, INITIAL, async (data) =>
      registerClient(data),
    );

  useEffect(() => {
    if (user) navigate(ROUTES.DASHBOARD_CLIENT, { replace: true });
  }, [user, navigate]);

  const validateFirstName = useMemo(
    () => fieldValidator(registerClientSchema, "firstName"),
    [],
  );
  const validateLastName = useMemo(
    () => fieldValidator(registerClientSchema, "lastName"),
    [],
  );
  const validatePhone = useMemo(
    () => fieldValidator(registerClientSchema, "phone", isHopelessPhone),
    [],
  );

  const firstNameStatus = useFieldStatus(validateFirstName, values.firstName);
  const lastNameStatus = useFieldStatus(validateLastName, values.lastName);
  const phoneStatus = useFieldStatus(validatePhone, values.phone);
  const passwordCheck = useMemo(
    () => checkPassword(values.password),
    [values.password],
  );
  const passwordStatus = useFieldStatus(null, values.password, {
    rules: PASSWORD_RULES,
  });

  const confirmStatus = useMemo(() => {
    if (!confirmPassword)
      return { status: FIELD_STATUS.IDLE, missing: 0, total: 1 };
    const matches = confirmPassword === values.password;
    return {
      status: matches ? FIELD_STATUS.OK : FIELD_STATUS.WRONG,
      message: "Les deux mots de passe ne correspondent pas.",
      missing: matches ? 0 : 1,
      total: 1,
    };
  }, [confirmPassword, values.password]);

  const setPassword = (value) => {
    setField("password", value);
    setConfirmPassword("");
  };

  const identityReady =
    firstNameStatus.status === FIELD_STATUS.OK &&
    lastNameStatus.status === FIELD_STATUS.OK &&
    phoneStatus.status === FIELD_STATUS.OK;

  const securityReady =
    passwordStatus.status === FIELD_STATUS.OK &&
    confirmStatus.status === FIELD_STATUS.OK &&
    Boolean(values.consent);

  const formReady = identityReady && securityReady;

  const identityButton = submitLabel(
    {
      firstName: firstNameStatus.status,
      lastName: lastNameStatus.status,
      phone: phoneStatus.status,
    },
    ["firstName", "lastName", "phone"],
    "Suivant",
  );

  const securityButton = submitLabel(
    {
      password: passwordStatus.status,
      confirm: confirmStatus.status,
      consent: values.consent ? FIELD_STATUS.OK : FIELD_STATUS.IDLE,
    },
    ["password", "confirm", "consent"],
    "Créer mon compte",
  );

  const onSubmit = async (e) => {
    if (!formReady) return;
    const res = await handleSubmit(e);
    if (res.ok) {
      login(res.result);
      toast({ message: "Compte créé avec succès !", type: "success" });
      closeModal();
      navigate(ROUTES.DASHBOARD_CLIENT, { replace: true });
    } else if (res.error?.errors) {
      const field = Object.keys(res.error.errors)[0];
      if (field && !["password", "consent"].includes(field)) setStep(1);
      setErrors((prev) => ({ ...prev, ...res.error.errors }));
      toast({
        message: res.error.message || "Veuillez corriger les erreurs.",
        type: "error",
      });
    } else if (res.error?.message)
      toast({ message: res.error.message, type: "error" });
  };

  return (
    <aside className={bare ? "p-4 sm:p-5" : "p-5 sm:p-8"}>
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
        Créer un compte
      </h1>

      <p className="mt-1 min-h-10 text-sm text-gray-500">
        {step === 1
          ? "En 1 minute, créez votre compte pour contacter des artisans qualifiés."
          : "Presque terminé : choisissez un mot de passe solide."}
      </p>

      <StepIndicator steps={STEPS} current={step} />

      <form
        className="mt-5 space-y-3 sm:mt-6 sm:space-y-4"
        onSubmit={onSubmit}
        noValidate
      >
        {step === 1 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="rc-firstName"
                label="Prénom(s)"
                required
                error={errors.firstName}
                liveStatus={firstNameStatus}
                value={values.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                autoComplete="given-name"
              />
              <FormField
                id="rc-lastName"
                label="Nom(s)"
                required
                error={errors.lastName}
                liveStatus={lastNameStatus}
                value={values.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                autoComplete="family-name"
              />
            </div>

            <FormField
              id="rc-phone"
              label="Numéro de téléphone"
              required
              error={errors.phone}
              liveStatus={phoneStatus}
              hint={MOBILE_HINT}
            >
              <PhoneInput
                id="rc-phone"
                value={values.phone}
                onChange={(value) => setField("phone", value)}
                autoComplete="tel"
                error={errors.phone}
                success={phoneStatus.status === FIELD_STATUS.OK}
              />
            </FormField>

            <Button
              type="button"
              onClick={() => setStep(2)}
              disabled={!identityReady}
              size="lg"
              className="w-full"
            >
              {identityReady ? (
                <>
                  Suivant
                  <ArrowRight size={16} className="inline" aria-hidden />
                </>
              ) : (
                identityButton
              )}
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <FormField
              id="rc-password"
              label="Mot de passe"
              required
              error={errors.password}
              as="input"
              liveStatus={passwordStatus}
              passwordRules={values.password ? passwordCheck.rules : null}
            >
              <PasswordInput
                id="rc-password"
                value={values.password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                error={errors.password}
                success={passwordStatus.status === FIELD_STATUS.OK}
                placeholder="Au moins 8 caractères"
              />
            </FormField>

            <FormField
              id="rc-confirm"
              label="Confirmer le mot de passe"
              required
              as="input"
              liveStatus={confirmStatus}
            >
              <PasswordInput
                id="rc-confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                error={confirmStatus.status === FIELD_STATUS.WRONG}
                success={confirmStatus.status === FIELD_STATUS.OK}
                placeholder="Retapez le mot de passe"
              />
            </FormField>

            <div>
              <Checkbox
                id="rc-consent"
                label={
                  <span className="text-sm leading-5 text-gray-700">
                    J’accepte les{" "}
                    <a
                      href={ROUTES.TERMS}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary-700 hover:underline"
                    >
                      conditions d’utilisation de KOP
                    </a>{" "}
                    (version {TERMS_VERSION}).
                  </span>
                }
                checked={Boolean(values.consent)}
                onChange={(e) => setField("consent", e.target.checked)}
                error={errors.consent}
              />
              {errors.consent && (
                <p role="alert" className="mt-1 text-xs text-danger-500">
                  {errors.consent}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => setStep(1)}
                className="w-1/3"
              >
                Précédent
                <ArrowLeft size={16} className="inline" aria-hidden />
              </Button>
              <Button
                type="submit"
                loading={submitting}
                disabled={!securityReady}
                size="lg"
                className="flex-1"
              >
                {securityReady ? "Créer mon compte" : securityButton}
              </Button>
            </div>
          </>
        )}
      </form>

      <div className="pt-4 pl-4 text-sm text-gray-600">
        Déjà inscrit ?{" "}
        <Link
          className="link-underline font-medium text-primary-700"
          href={ROUTES.LOGIN}
        >
          Se connecter
        </Link>
      </div>
    </aside>
  );
}
