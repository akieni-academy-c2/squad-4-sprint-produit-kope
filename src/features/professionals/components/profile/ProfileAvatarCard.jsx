import { Camera } from "lucide-react";
import { Card } from "@/shared/components/ui/Card.jsx";
import { UserAvatar } from "@/shared/components/ui/UserAvatar.jsx";

/**
 * Carte d'avatar. L'envoi est piloté par le parent : il fournit la progression
 * et neutralise le sélecteur pendant l'upload, le composant ne fait qu'afficher.
 */
export function ProfileAvatarCard({
  user,
  avatar,
  name,
  tradeName,
  editing,
  uploading,
  uploadProgress,
  onAvatarChange,
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-5 bg-mint-50/40 p-6">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full">
          <UserAvatar user={user} src={avatar} className="h-full w-full" />
          {editing && (
            <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 text-white">
              <Camera size={18} aria-hidden />
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="sr-only"
                disabled={uploading}
                onChange={onAvatarChange}
              />
            </label>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-lg font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">
            {tradeName || "Professionnel"}
          </p>
          {uploading && (
            <div className="mt-2 w-40 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-primary-500 transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
