import { useAuthModal } from "@/shared/context/AuthModalContext.jsx";
import { AUTH_MODAL_MODES } from "@/shared/context/authModalModes.js";
import { PromoCard } from "@/shared/components/ui/PromoCard.jsx";

export function BecomeProCard({ userId = 1 }) {
  const { open: openModal } = useAuthModal();

  return (
    <PromoCard
      seed={userId}
      title="Devenez prestataire"
      text="Présentez vos réalisations et recevez des demandes."
      action="Devenir prestataire"
      onAction={() => openModal(AUTH_MODAL_MODES.REGISTER_PRO)}
    />
  );
}
