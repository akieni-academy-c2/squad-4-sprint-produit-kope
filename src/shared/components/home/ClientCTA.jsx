import { Button } from "@/shared/components/ui/Button.jsx";
import { useAuthModal } from "@/shared/context/AuthModalContext.jsx";
import { AUTH_MODAL_MODES } from "@/shared/context/authModalModes.js";
import { ClientCtaMotif } from "@/shared/components/ui/ClientCtaMotif.jsx";

export function ClientCTA() {
  const { open: openModal } = useAuthModal();
  return (
    <section className="relative overflow-hidden border-y border-primary-100 bg-primary-50 py-8 lg:py-16">
      <ClientCtaMotif />
      <div className="container-kop relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            Prêt à chercher ou à laisser un avis ?
          </h2>
          <p className="mt-2 text-sm leading-7 text-gray-700">
            Inscrivez-vous gratuitement et gardez vos contacts et vos avis au
            même endroit.
          </p>
        </div>
        <Button
          onClick={() => openModal(AUTH_MODAL_MODES.REGISTER_CLIENT)}
          size="lg"
        >
          Créer mon compte gratuit
        </Button>
      </div>
    </section>
  );
}
