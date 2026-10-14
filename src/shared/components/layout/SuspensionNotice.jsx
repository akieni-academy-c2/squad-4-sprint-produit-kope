import { useEffect, useState } from 'react';
import { Link } from '@/shared/components/ui/Link.jsx';
import { LifeBuoy, Mail, Phone } from 'lucide-react';
import { Button, Modal } from '@/shared/components/ui';
import { SUSPENDED_EVENT } from '@/shared/lib/api.js';
import { SUPPORT_EMAIL, SUPPORT_MAILTO, SUPPORT_PHONE, SUPPORT_TEL } from '@/shared/constants/support.js';
import { ROUTES } from '@/shared/lib/constants.js';


export function SuspensionNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onSuspended = () => setOpen(true);
    window.addEventListener(SUSPENDED_EVENT, onSuspended);
    return () => window.removeEventListener(SUSPENDED_EVENT, onSuspended);
  }, []);

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title="Votre compte a été suspendu"
      description="Votre compte ne peut plus être utilisé pour le moment."
      actions={
        <>
          <Button as="a" href={SUPPORT_MAILTO} variant="secondary">
            <Mail size={16} aria-hidden /> Contester par email
          </Button>
          <Button as="a" href={SUPPORT_TEL} variant="primary">
            <Phone size={16} aria-hidden /> Appeler le service client
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-sm bg-amber-50 p-3">
          <LifeBuoy size={18} className="mt-0.5 shrink-0 text-amber-600" aria-hidden />
          <p className="text-sm leading-6 text-gray-700">
            Votre compte a été suspendu après plusieurs signalements. Vous pouvez contester cette décision : notre
            service client examine votre dossier.
          </p>
        </div>

        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-gray-500">
              <Mail size={14} className="shrink-0 text-gray-400" aria-hidden />
              Email
            </dt>
            <dd>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-primary-700 hover:underline">
                {SUPPORT_EMAIL}
              </a>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-gray-500">
              <Phone size={14} className="shrink-0 text-gray-400" aria-hidden />
              Téléphone
            </dt>
            <dd>
              <a href={SUPPORT_TEL} className="font-semibold text-primary-700 hover:underline">
                {SUPPORT_PHONE}
              </a>
            </dd>
          </div>
        </dl>

        <p className="text-xs text-gray-500">
          Vous pouvez aussi{' '}
          <Link href={ROUTES.SEARCH} onClick={() => setOpen(false)} className="font-semibold text-primary-700 hover:underline">
            continuer à parcourir les professionnels
          </Link>{' '}
          sans votre compte.
        </p>
      </div>
    </Modal>
  );
}
