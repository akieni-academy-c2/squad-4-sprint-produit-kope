import { Link } from "@/shared/components/ui/Link.jsx";
import { Ban, Calendar, Check, Phone } from "lucide-react";
import { Badge, Button, Tooltip, UserAvatar } from "@/shared/components/ui";
import { ROLES, ROUTES } from "@/shared/lib/constants.js";
import { formatDateFr } from "@/shared/utils";
import { getUserName, ROLE_LABELS, ROLE_VARIANTS } from "./adminUserOptions.js";
import { formatPhoneFR } from "@/shared/utils";

export function AdminUserRow({ user, isSelf, onToggleBlock }) {
  const name = getUserName(user);
  const blocked = Boolean(user.blockedAt);
  const isPro = user.role === ROLES.PRO;

  const avatar = (
    <UserAvatar
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      }}
      name={name}
      className="h-11 w-11"
    />
  );

  return (
    <li
      className={`flex flex-col overflow-hidden rounded-lg border bg-white ${
        blocked ? "border-rose-200 bg-rose-50/40" : "border-gray-200"
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        {isPro ? (
          <Link
            href={ROUTES.PROFESSIONAL(user.id)}
            className="shrink-0 rounded-full transition hover:opacity-80"
            aria-label={`Voir la fiche publique de ${name}`}
          >
            {avatar}
          </Link>
        ) : (
          avatar
        )}

        <div className="min-w-0 flex-1">
          {isPro ? (
            <Link
              href={ROUTES.PROFESSIONAL(user.id)}
              className="block truncate font-semibold text-gray-900 transition hover:text-primary-700 hover:underline"
            >
              {name}
            </Link>
          ) : (
            <p className="truncate font-semibold text-gray-900">{name}</p>
          )}
          {user.phone && (
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{formatPhoneFR(user.phone)}</span>
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge variant={ROLE_VARIANTS[user.role] || "neutral"}>
            {ROLE_LABELS[user.role] || user.role}
          </Badge>
          {blocked && <Badge variant="danger">Bloqué</Badge>}
        </div>
      </div>

      <div className="  flex items-center justify-between gap-1 border-t border-gray-100 bg-gray-50/80 p-4 ">
        {user.createdAt && (
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            Inscrit le {formatDateFr(user.createdAt)}
          </p>
        )}

        {isSelf ? (
          <span className="text-xs text-gray-400">Votre compte</span>
        ) : blocked ? (
          <Tooltip content="Débloquer le compte">
            <Button
              size="icon-sm"
              variant="ghost"
              className="bg-gray-300/20! border-gray-200/60! border "
              onClick={() => onToggleBlock(user, false)}
              aria-label={`Débloquer ${name}`}
            >
              <Check className="size-3.5" />
            </Button>
          </Tooltip>
        ) : (
          <Tooltip side="" content="Bloquer le compte">
            <Button
              size="sm"
              variant="subtle"
              className="text-danger-500 hover:bg-rose-50 hover:text-danger-600"
              onClick={() => onToggleBlock(user, true)}
              aria-label={`Bloquer ${name}`}
            >
              Bloquer
              <Ban className="size-3.5" />
            </Button>
          </Tooltip>
        )}
      </div>
    </li>
  );
}
