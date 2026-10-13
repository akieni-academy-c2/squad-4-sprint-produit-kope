import { Dialog, DialogContent, DialogTitle } from '@/shared/components/ui/Dialog.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { LoginForm } from '../pages/LoginPage.jsx';
import { RegisterClientForm } from '../pages/RegisterClientPage.jsx';
import { BecomeProForm } from './BecomeProForm.jsx';
import { ChangePasswordForm } from './ChangePasswordForm.jsx';
import { ROLES } from '@/shared/lib/constants.js';
import confiance from '@/shared/assets/confiance.png';
import form from '@/shared/assets/form.png';
import { Card } from '@/shared/components/ui/Card.jsx';
import { FloatingCaption } from '@/shared/components/ui/FloatingCaption.jsx';
import { ImageWithSkeleton } from '@/shared/components/ui/ImageWithSkeleton.jsx';
import { User } from 'lucide-react';

const DIALOG_LABEL = {
  login: 'Connexion',
  register: 'Inscription',
  pro: 'Devenir professionnel',
  password: 'Changer le mot de passe',
};

/**
 * Le panneau de gauche accompagne le formulaire affiché : un visiteur qui
 * s'inscrit comme particulier et un professionnel qui se présente ne doivent
 * pas lire la même promesse. Seul le visuel et le texte changent, la mise en
 * page reste celle partagée par toutes les modales.
 */
const SIDE_PANEL = {
  'register-pro': {
    image: form,
    imageAlt: 'Professionnelle KOP à son atelier',
    title: 'Votre savoir-faire mérite d’être à portée.',
    description:
      'Un profil pour présenter votre activité. Un espace pour retrouver les demandes de vos futurs clients.',
  },
  default: {
    image: confiance,
    imageAlt: '',
    title: 'Les belles rencontres commencent tout près.',
    description:
      'Retrouvez les professionnels de votre quartier et gardez une trace de vos demandes, au même endroit.',
  },
};

export function AuthModal() {
  const { mode, close } = useAuthModal();
  const { user } = useAuthContext();

  const side = SIDE_PANEL[mode] ?? SIDE_PANEL.default;

  const renderPro = () => {

    if (!user) return <LoginForm bare />

    if (user.role === ROLES.ADMIN)
      return <p className="p-2 text-sm text-gray-600">Un compte administrateur ne peut pas devenir professionnel.</p>;

    if (user.role === ROLES.PRO)
      return <p className="p-2 text-sm text-gray-600">Votre compte est déjà professionnel.</p>;

    return <BecomeProForm bare />;
  };

  return (
    <Dialog open={mode != null} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-4xl p-2  " onClose={close}>
        <DialogTitle className="sr-only">{DIALOG_LABEL[mode] ?? 'Compte'}</DialogTitle>
        <div className="grid lg:grid-cols-2 lg:items-start min-h-140">
          <aside className="relative hidden h-full lg:flex flex-col justify-between gap-3 overflow-hidden rounded-[16px] bg-radial from-[#28604B] to-[#183E30] p-2 text-white">
            <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 640 960" preserveAspectRatio="xMidYMid slice" fill="none">
              <circle cx="60" cy="60" r="50" fill="#ffffff" opacity="0.05" />
              <circle cx="600" cy="900" r="70" fill="#ffffff" opacity="0.05" />
              <rect x="80" y="700" width="60" height="60" rx="14" transform="rotate(18 110 730)" fill="#ffffff" opacity="0.06" />
              <rect x="480" y="140" width="56" height="56" rx="13" transform="rotate(-14 508 168)" fill="#ffffff" opacity="0.06" />
              <polygon points="240,560 300,490 360,560" fill="#ffffff" opacity="0.05" />
              <circle cx="320" cy="140" r="22" fill="none" stroke="#ffffff" strokeWidth="6" opacity="0.1" />
              <circle cx="160" cy="170" r="11" fill="#ffffff" opacity="0.1" />
              <polygon points="520,700 556,714 528,734" fill="#ffffff" opacity="0.1" />
              <path d="M40 800 Q100 760 160 790" stroke="#ffffff" strokeWidth="5" opacity="0.09" />
              <circle cx="130" cy="420" r="16" fill="none" stroke="#ffffff" strokeWidth="5" opacity="0.09" />
              <rect x="280" y="90" width="28" height="28" rx="8" transform="rotate(28 294 104)" fill="#ffffff" opacity="0.08" />
              <rect x="420" y="820" width="40" height="40" rx="10" transform="rotate(-22 440 840)" fill="none" stroke="#ffffff" strokeWidth="4" opacity="0.1" />
              <circle cx="500" cy="420" r="8" fill="#ffffff" opacity="0.12" />
              <circle cx="230" cy="60" r="6" fill="none" stroke="#ffffff" strokeWidth="4" opacity="0.12" />
              <path d="M460 90 q27 -19 54 0 q27 19 54 0" stroke="#ffffff" strokeWidth="5" opacity="0.08" />
              <polygon points="60,300 120,300 90,340" fill="#ffffff" opacity="0.06" transform="rotate(-16 90 320)" />
            </svg>
            <div className='relative z-10 space-y-2 p-6'>
              <h2 className="text-3xl font-semibold tracking-tight leading-tight text-white!">
                {side.title}
              </h2>
              <p className="text-sm leading-6 text-white/80">
                {side.description}
              </p>
            </div>
            <Card className="relative z-10 flex flex-1 flex-col overflow-hidden rounded-sm! border-0! transition">
              <div className="relative h-full overflow-hidden ">
                <ImageWithSkeleton
                  src={side.image}
                  alt={side.imageAlt}
                  ratio="h-full"
                  skeletonClassName="bg-gray-100"
                  className="transition duration-500 group-hover:scale-[1.04]"
                />
                <FloatingCaption
                  icon={User}
                  title="Les mains qui font votre quartier"
                  subtitle="Des professionnels, près de chez vous."
                />
              </div>

            </Card>
          </aside>
          <div className="min-w-0 h-full grid place-content-center px-4 py-10 sm:px-6 sm:py-4">
            {mode === 'login' && <LoginForm bare />}
            {mode === 'register-client' && <RegisterClientForm bare />}
            {mode === 'register-pro' &&  renderPro() }
            {mode === 'change-password' && <ChangePasswordForm bare />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
