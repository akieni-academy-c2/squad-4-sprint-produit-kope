import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/shared/components/ui/Button.jsx";
import { useForm } from "@/shared/hooks/useForm.js";
import {
  updateAccountSchema,
  updateProfileSchema,
  validateFrontend,
} from "@/shared/utils/validators.js";
import { useReferenceData } from "@/features/reference/hooks/useReferenceData.js";
import { updateMyProfile } from "../services/professionals.service.js";
import {
  updateAccount,
  uploadAvatar,
} from "@/features/auth/services/auth.service.js";
import { useNotification } from "@/shared/context/NotificationContext.jsx";
import { useAuthContext } from "@/shared/context/AuthContext.jsx";
import { useAuthModal } from "@/shared/context/AuthModalContext.jsx";
import { AUTH_MODAL_MODES } from "@/shared/context/authModalModes.js";
import { ProfileAvatarCard } from "./profile/ProfileAvatarCard.jsx";
import { ProfileDetails } from "./profile/ProfileDetails.jsx";
import { ProfileEditForm } from "./profile/ProfileEditForm.jsx";
import { useFormReadiness } from "@/shared/hooks/useFormReadiness.js";
import { submitLabel } from "@/shared/utils/submitLabel.js";
import { extractInitial, getFullName } from "./profile/profileForm.js";

export function ProfileEditor({ profile, user, onUpdated }) {
  const { trades, zones, cities, loading: loadingRefs } = useReferenceData();
  const { toast } = useNotification();
  const { refresh } = useAuthContext();
  const { open: openModal } = useAuthModal();

  const [editing, setEditing] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatarUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const initial = useMemo(() => extractInitial(profile), [profile]);

  const { values, errors, submitting, setField, handleSubmit, setErrors } =
    useForm(updateProfileSchema, initial, async (data) =>
      updateMyProfile(data),
    );

  const identity = useMemo(
    () => ({ firstName, lastName, phone, email }),
    [firstName, lastName, phone, email],
  );
  const identityForm = useFormReadiness(updateAccountSchema, identity);
  const profileForm = useFormReadiness(updateProfileSchema, values);
  const canSubmit =
    identityForm.ready &&
    profileForm.ready &&
    (identityForm.dirty || profileForm.dirty);

  const buttonLabel =
    submitLabel(
      identityForm.statuses,
      ["firstName", "lastName", "phone", "email"],
      "Enregistrer",
    ) ||
    submitLabel(
      profileForm.statuses,
      Object.keys(updateProfileSchema.shape),
      "Enregistrer",
    );
  const hint = buttonLabel !== "Enregistrer" ? buttonLabel : null;

  const onSubmit = async (e) => {
    const accountCheck = validateFrontend(updateAccountSchema, identity);
    if (!accountCheck.success) {
      setErrors((prev) => ({ ...prev, ...accountCheck.errors }));
      const firstKey = Object.keys(accountCheck.errors || {})[0];
      if (firstKey && typeof document !== "undefined")
        document
          .querySelector(`[id="${firstKey}"], [name="${firstKey}"]`)
          ?.focus?.();

      return;
    }

    const res = await handleSubmit(e);
    if (!res.ok) {
      if (res.error?.errors)
        setErrors((prev) => ({ ...prev, ...res.error.errors }));
      if (res.error?.message)
        toast({ message: res.error.message, type: "error" });
      return;
    }
    try {
      await updateAccount({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
      });
      await refresh();
      setEditing(false);
      toast({ message: "Profil mis à jour avec succès.", type: "success" });
      onUpdated?.(res.result);
    } catch (err) {
      toast({ message: err?.message || "Erreur.", type: "error" });
    }
  };

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadAvatar(file, setUploadProgress);
      if (url) setAvatar(url);
      await refresh();
      setUploadProgress(100);
      toast({ message: "Photo de profil mise à jour.", type: "success" });

      if (!identityForm.dirty && !profileForm.dirty) setEditing(false);
    } catch (err) {
      toast({
        message: err?.message || "Erreur lors du téléversement.",
        type: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const setAccountField = (field, value) => {
    if (field === "firstName") setFirstName(value);
    else if (field === "lastName") setLastName(value);
    else if (field === "email") setEmail(value);
    else setPhone(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
          Mon profil
        </h2>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openModal(AUTH_MODAL_MODES.CHANGE_PASSWORD)}
            >
              Changer le mot de passe
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing((v) => !v)}
          >
            <Pencil size={16} aria-hidden className="inline" />{" "}
            {editing ? "Annuler" : "Modifier"}
          </Button>
        </div>
      </div>

      <ProfileAvatarCard
        user={user}
        avatar={avatar}
        name={getFullName(user)}
        tradeName={profile?.tradeName}
        editing={editing}
        uploading={uploading}
        uploadProgress={uploadProgress}
        onAvatarChange={onAvatarChange}
      />

      {editing ? (
        <ProfileEditForm
          onSubmit={onSubmit}
          values={values}
          errors={errors}
          submitting={submitting}
          setField={setField}
          trades={trades}
          zones={zones}
          cities={cities}
          loadingRefs={loadingRefs}
          account={{ firstName, lastName, phone, email }}
          accountErrors={identityForm.errors}
          accountStatuses={identityForm.statuses}
          onAccountField={setAccountField}
          canSubmit={canSubmit}
          submitHint={hint}
        />
      ) : (
        <ProfileDetails profile={profile} user={user} />
      )}

      <div className="sm:hidden">
        <Button
          variant="outline"
          size="md"
          className="w-full"
          onClick={() => openModal(AUTH_MODAL_MODES.CHANGE_PASSWORD)}
        >
          Changer le mot de passe
        </Button>
      </div>
    </div>
  );
}
