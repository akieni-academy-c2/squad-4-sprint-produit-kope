import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/Dialog.jsx";
import { useAuthModal } from "@/shared/context/AuthModalContext.jsx";
import {
  AUTH_MODAL_LABELS,
  AUTH_MODAL_DEFAULT_LABEL,
} from "@/shared/context/authModalModes.js";
import { useAuthContext } from "@/shared/context/AuthContext.jsx";
import { LoginForm } from "../pages/LoginPage.jsx";
import { RegisterClientForm } from "../pages/RegisterClientPage.jsx";
import { BecomeProForm } from "./BecomeProForm.jsx";
import { ChangePasswordForm } from "./ChangePasswordForm.jsx";
import { ROLES } from "@/shared/lib/constants.js";
import confiance from "@/shared/assets/confiance.png";
import form from "@/shared/assets/form.png";
import { Card } from "@/shared/components/ui/Card.jsx";
import { FloatingCaption } from "@/shared/components/ui/FloatingCaption.jsx";
import { ImageWithSkeleton } from "@/shared/components/ui/ImageWithSkeleton.jsx";
import { User } from "lucide-react";
import { AuthPanelMotif } from "@/shared/components/ui/AuthPanelMotif.jsx";

const DIALOG_LABEL = AUTH_MODAL_LABELS;
const DEFAULT_DIALOG_LABEL = AUTH_MODAL_DEFAULT_LABEL;

const SIDE_PANEL = {
  "register-pro": {
    image: form,
    imageAlt: "Professionnelle KOP à son atelier",
    title: "Votre savoir-faire mérite d’être à portée.",
    description:
      "Un profil pour présenter votre activité. Un espace pour retrouver les demandes de vos futurs clients.",
  },
  default: {
    image: confiance,
    imageAlt: "",
    title: "Les belles rencontres commencent tout près.",
    description:
      "Retrouvez les professionnels de votre quartier et gardez une trace de vos demandes, au même endroit.",
  },
};

export function AuthModal() {
  const { mode, close } = useAuthModal();
  const { user } = useAuthContext();

  const side = SIDE_PANEL[mode] ?? SIDE_PANEL.default;

  const renderPro = () => {
    if (!user) return <LoginForm bare />;

    if (user.role === ROLES.ADMIN)
      return (
        <p className="p-2 text-sm text-gray-600">
          Un compte administrateur ne peut pas devenir professionnel.
        </p>
      );

    if (user.role === ROLES.PRO)
      return (
        <p className="p-2 text-sm text-gray-600">
          Votre compte est déjà professionnel.
        </p>
      );

    return <BecomeProForm bare />;
  };

  return (
    <Dialog open={mode != null} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-4xl p-2  " onClose={close}>
        <DialogTitle className="sr-only">
          {DIALOG_LABEL[mode] ?? DEFAULT_DIALOG_LABEL}
        </DialogTitle>
        <div className="grid lg:grid-cols-2 lg:items-start min-h-140">
          <aside className="relative hidden h-full lg:flex flex-col justify-between gap-3 overflow-hidden rounded-[16px] bg-radial from-[#28604B] to-[#183E30] p-2 text-white">
            <AuthPanelMotif />
            <div className="relative z-10 space-y-2 p-6">
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
            {mode === "login" && <LoginForm bare />}
            {mode === "register-client" && <RegisterClientForm bare />}
            {mode === "register-pro" && renderPro()}
            {mode === "change-password" && <ChangePasswordForm bare />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
