import { Button } from '@/shared/components/ui/Button.jsx';
import { ImageWithSkeleton } from '@/shared/components/ui/ImageWithSkeleton.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { PRO_CTA_IMAGE_LABEL, reserveImage } from '@/shared/assets/placeholders.js';
import { HOME_RESERVED } from '@/shared/content/homeImages.js';

export function ProCTA({ imageLeft = false } = {}) {
  const { open: openModal } = useAuthModal();
  return (
    <section className="bg-[#183E30] py-8 lg:py-16">
      <div className="container-kop">
        <div className=" text-white overflow-hidden relative">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className={imageLeft ? 'lg:order-2' : ''}>
              <p className="text-xs font-bold uppercase tracking-wider text-mint-200">Vous avez le savoir-faire</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tighter sm:leading-15 sm:text-5xl text-white!">
                Faites-vous connaître près de chez vous.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-white/80">
                Prenez votre métier, vos réalisations et vos zones d'intervention.
                Rendez-vous visible aux clients de votre ville et recevez-les directement sur votre fiche publique.
              </p>
              <div className="mt-7">
                <Button
                  onClick={() => openModal('register-pro')}
                  variant="secondary"
                  size="lg"
                  className="bg-white! text-gray-900! hover:bg-gray-100! border-white!"
                >
                  Créer mon profil professionnel
                </Button>
              </div>
            </div>
            <div className={`relative max-w-115 ${imageLeft ? 'lg:order-1 lg:mr-auto' : 'lg:ml-auto'}`}>
<ImageWithSkeleton
                src={reserveImage(PRO_CTA_IMAGE_LABEL, HOME_RESERVED.upTo('cta'))}
                alt="Devenir prestataire KOP"
                // 4/3 plutôt que 16/9 : la section est haute et l'image doit
                // occuper de la hauteur sur mobile comme sur grand écran.
                ratio="aspect-4/3"
                className="rounded-[16px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
