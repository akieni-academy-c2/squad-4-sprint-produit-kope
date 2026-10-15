import { Link } from "@/shared/components/ui/Link.jsx";
import {
  Calendar,
  ExternalLink,
  Eye,
  EyeOff,
  MapPin,
  Phone,
  Wrench,
} from "lucide-react";
import { Badge, Button, Tooltip, UserAvatar } from "@/shared/components/ui";
import {
  DEFAULT_CITY,
  DEFAULT_COUNTRY,
  PROFILE_STATUS,
  PROFILE_STATUS_LABELS,
  ROUTES,
} from "@/shared/lib/constants.js";
import { formatDateFr } from "@/shared/utils";
import { getProIdentity, statusVariant } from "./professionalFilters.js";
import { formatPhoneFR } from "@/shared/utils";

export function AdminProfessionalCard({ pro, onToggleVisibility }) {
  const { id, name } = getProIdentity(pro);
  const hidden = pro.status === PROFILE_STATUS.HIDDEN;

  return (
    <li className=" relative flex flex-col rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <Link
          href={ROUTES.PROFESSIONAL(id)}
          className="shrink-0 rounded-full transition hover:opacity-80"
          aria-label={`Voir la fiche publique de ${name}`}
        >
          <UserAvatar
            user={{
              firstName: pro.firstName,
              lastName: pro.lastName,
              avatarUrl: pro.avatarUrl,
            }}
            name={name}
            className="h-11 w-11"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={ROUTES.PROFESSIONAL(id)}
            className="block truncate font-semibold text-gray-900 transition hover:text-primary-700 hover:underline"
          >
            {name}
          </Link>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
            <Wrench className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{pro.trade || "-"}</span>
          </p>
        </div>
        <Badge variant={statusVariant(pro.status)}>
          {PROFILE_STATUS_LABELS[pro.status] || pro.status || "-"}
        </Badge>
      </div>

      <div className="mt-3  pl-3 space-y-2 text-xs text-gray-600">
        <p className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {[pro.city || DEFAULT_CITY, pro.country || DEFAULT_COUNTRY]
              .filter(Boolean)
              .join(", ")}
          </span>
        </p>
        {pro.phone && (
          <p className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{formatPhoneFR(pro.phone)}</span>
          </p>
        )}
        {pro.createdAt && (
          <p className="text-gray-400 flex items-center gap-1.5 text-xs">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            Inscrit le {formatDateFr(pro.createdAt)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 absolute  right-3  bottom-3 overflow-hidden bg-gray-100/50 border border-gray-200   rounded-md">
        <Tooltip content="Voir la fiche">
          <Button
            as={Link}
            href={ROUTES.PROFESSIONAL(id)}
            target="_blank"
            rel="noopener noreferrer"
            size="icon-sm"
            variant="ghost"
            aria-label="Voir la fiche"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Tooltip>
        <span className="border border-gray-200 h-2" />
        {hidden ? (
          <Tooltip content="Réactiver le profil">
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-primary-600 hover:bg-mint-100"
              onClick={() => onToggleVisibility(pro, "show")}
              aria-label="Réactiver le profil"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Tooltip>
        ) : (
          <Tooltip content="Masquer le profil">
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-rose-600 hover:bg-rose-50"
              onClick={() => onToggleVisibility(pro, "hide")}
              aria-label="Masquer le profil"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </Tooltip>
        )}
      </div>
    </li>
  );
}
