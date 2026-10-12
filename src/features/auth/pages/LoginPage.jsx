import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { Button } from '@/shared/components/ui/Button.jsx';
import { FormField } from '@/shared/components/ui/FormField.jsx';
import { Input } from '@/shared/components/ui/Input.jsx';
import { useForm } from '@/shared/hooks/useForm.js';
import { loginSchema } from '@/shared/utils/validators.js';
import { login } from '../services/auth.service.js';
import { ROLES, ROUTES } from '@/shared/lib/constants.js';
import { Lock, LockOpen } from 'lucide-react';

const INITIAL = { phone: '', password: '' };

function dashboardForRole(role) {
  if (role === ROLES.CLIENT) return ROUTES.DASHBOARD_CLIENT;
  if (role === ROLES.PRO) return ROUTES.DASHBOARD_PRO;
  if (role === ROLES.ADMIN) return ROUTES.ADMIN;
  return ROUTES.HOME;
}

export function LoginForm({ bare = false } = {}) {
  const { user, login: setUser } = useAuthContext();
  const { close: closeModal } = useAuthModal();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { toast } = useNotification();
  const [showPassword, setShowPassword] = useState(false);

  const { values, errors, globalError, submitting, setField, handleSubmit, setGlobalError } =
    useForm(loginSchema, INITIAL, async (data) => login(data));

  useEffect(() => {
    if (user) navigate(dashboardForRole(user.role), { replace: true });
  }, [user, navigate]);

  const onSubmit = async (e) => {
    setGlobalError(null);
    const res = await handleSubmit(e);
    if (res.ok) {
      setUser(res.result);
      const rawNext = params.get('next');
      const safeNext = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')
        ? rawNext
        : null;
      const next = safeNext || dashboardForRole(res.result.role);
      toast({ message: 'Bienvenue !', type: 'success' });
      closeModal();
      navigate(next, { replace: true });
    } else if (res.error && !res.error?.errors)
      toast({ message: res.error?.message || 'Identifiants incorrects', type: 'error' });

  };

  return (
    <div className={`${bare ? 'w-full px-5' : 'mx-auto w-full max-w-md px-5'} space-y-4 `}>

      <h1 className="text-3xl font-extrabold tracking-tight text-primary-500!">Connexion</h1>
      <p className=" text-sm mb-8 text-gray-500">
        Accédez à votre espace client, professionnel ou administrateur.
      </p>
      <form className="space-y-4 sm:space-y-5" onSubmit={onSubmit} noValidate>
        {(globalError || errors._global) && (
          <div role="alert" className="rounded-[16px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {globalError || errors._global}
          </div>
        )}
        <FormField
          id="login-phone"
          label="Numéro de téléphone"
          required
          error={errors.phone}
          placeholder="+242 06 000 00 00"
          value={values.phone}
          onChange={(e) => setField('phone', e.target.value)}
          autoComplete="tel"
          inputMode="tel"
        />
        <FormField
          id="login-password"
          label="Mot de passe"
          required
          error={errors.password}
          as="input"
        >
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={values.password}
              autoComplete="current-password"
              error={errors.password}
              onChange={(e) => setField('password', e.target.value)}
              placeholder="8 caractères minimum"
            />
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer"
              type="button" aria-label="Afficher le mot de passe"
              onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <LockOpen size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500" aria-hidden />
              ) : (
                <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
              )}
            </button>
          </div>
        </FormField>
        <Button type="submit" loading={submitting} size="lg" className="w-full!">
          Se connecter
        </Button>
      </form>
      <p className="text-sm">
        Je n'ai pas de compte.
        <Link
          to={ROUTES.REGISTER_CLIENT}
          className="text-primary-500 link-underline  font-semibold hover:text-primary-600 ml-1"
        > S'inscrire</Link>
      </p>
    </div>
  );
}

export function LoginPage() {
  return (
    <div className="container-kop page-padding ">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16 min-h-[72vh]">
        <div className="hidden lg:block">
          <div className="rounded-4xl bg-kop-mint p-10 h-full max-w-130 relative overflow-hidden">
            <p className="text-xs font-bold uppercase tracking-wider text-primary-800/70">KOP</p>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
              Retrouvez votre
              <br />
              <span className="text-primary-700">espace</span>.
            </h2>
            <p className="mt-3 text-base leading-7 text-gray-700/90 max-w-md">
              Un compte pour chercher, contacter et laisser des avis aux pros de votre quartier.
            </p>

          </div>
        </div>
        {/* Right form */}
        <LoginForm />
      </div>
    </div>
  );
}
