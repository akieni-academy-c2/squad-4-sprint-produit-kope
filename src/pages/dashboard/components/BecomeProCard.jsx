import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { AUTH_MODAL_MODES } from '@/shared/context/authModalModes.js';
import { Button } from '@/shared/components/ui/Button.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';

export function BecomeProCard() {
  const { open: openModal } = useAuthModal();

  return (
    <Card className="border border-primary-100 p-5 bg-linear-to-br from-white to-primary-50">
      <h3 className="text-xl font-extrabold text-gray-900">Devenez prestataire</h3>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        Présentez vos réalisations et recevez des demandes.
      </p>
      <Button
        variant="primary"
        size="md"
        className="mt-4 w-full"
        onClick={() => openModal(AUTH_MODAL_MODES.REGISTER_PRO)}
      >
        Devenir prestataire
      </Button>
    </Card>
  );
}