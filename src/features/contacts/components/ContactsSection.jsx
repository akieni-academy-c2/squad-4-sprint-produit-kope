import { useMemo, useState } from "react";
import { MessageCircle, Phone, Users } from "lucide-react";
import { useAsyncData } from "@/shared/hooks/useAsyncData.js";
import { getMyContacts } from "../services/contacts.service.js";
import { Button } from "@/shared/components/ui/Button.jsx";
import { Card } from "@/shared/components/ui/Card.jsx";
import { CustomSelect } from "@/shared/components/ui/CustomSelect.jsx";
import { SearchInput } from "@/shared/components/ui/SearchInput.jsx";
import { DataState } from "@/shared/components/ui/DataState.jsx";
import { EmptyState } from "@/shared/components/ui/EmptyState.jsx";
import { UserAvatar } from "@/shared/components/ui/UserAvatar.jsx";
import { Badge } from "@/shared/components/ui/Badge.jsx";
import { useNotification } from "@/shared/context/NotificationContext.jsx";
import { AccountSectionLayout } from "@/pages/dashboard/components/AccountSectionLayout.jsx";
import {
  AdminFilterGroup,
  AdminFilterPanel,
} from "@/features/admin/components/AdminSectionLayout.jsx";
import { REPORT_REASON_OPTIONS } from "@/shared/constants/reports.js";
import { reportContact } from "@/features/reports/services/reports.service.js";
import {
  ReportDialog,
  ReportTrigger,
} from "@/features/reports/components/ReportDialog.jsx";
import { logContact } from "../services/contacts.service.js";
import { formatDateFr, toWhatsappUrl } from "@/shared/utils";
import { Pagination } from "@/shared/components/ui/Pagination.jsx";

const FETCH_LIMIT = 100;

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: "recent", label: "Du plus récent" },
  { value: "name", label: "Nom (A → Z)" },
];

const ORIGIN_OPTIONS = [
  { value: "all", label: "Tous les contacts" },
  { value: "outgoing", label: "Contactés par moi" },
  { value: "incoming", label: "Qui m’ont contacté" },
];

const CHANNEL_OPTIONS = [
  { value: "all", label: "Tous les canaux" },
  { value: "call", label: "Appels" },
  { value: "whatsapp", label: "WhatsApp" },
];

function ContactRow({ contact, onReach, onReport, reported }) {
  const name = contact.displayName || "Utilisateur";
  const { toast } = useNotification();

  const reach = (channel, href, newTab) => {
    if (newTab) window.open(href, "_blank", "noopener,noreferrer");
    else window.location.href = href;

    logContact(contact.userId, channel)
      .then(() => onReach())
      .catch((err) =>
        toast({
          message: err?.message || "Contact non enregistré.",
          type: "error",
        }),
      );
  };

  const tel = contact.phone
    ? `tel:${String(contact.phone).replace(/\D/g, "")}`
    : null;
  const wa = toWhatsappUrl(contact.phone);

  return (
    <li>
      <Card className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar
              user={{
                firstName: contact.firstName,
                lastName: contact.lastName,
              }}
              src={contact.avatarUrl}
              name={name}
              className="h-11 w-11"
            />
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">{name}</p>
              <p className="truncate text-xs text-gray-500">
                {contact.tradeName ||
                  (contact.role === "professional"
                    ? "Professionnel"
                    : "Client")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={contact.outgoing ? "info" : "primary"} size="sm">
              {contact.outgoing ? "Contacté" : "Vous a contacté"}
            </Badge>

            {reported && (
              <Badge variant="danger" size="sm">
                Signalé
              </Badge>
            )}

            {!reported && (
              <ReportTrigger
                onClick={() => onReport(contact)}
                label="Signaler"
              />
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <span aria-hidden>·</span>
            {formatDateFr(contact.createdAt)}
          </span>

          {contact.phone &&
            (contact.channel === "call" ? (
              <Button
                variant="subtle"
                size="sm"
                onClick={() => reach("call", tel, false)}
              >
                <Phone size={14} aria-hidden /> Appeler
              </Button>
            ) : (
              <Button
                variant="subtle"
                size="sm"
                onClick={() => reach("whatsapp", wa, true)}
              >
                <MessageCircle size={14} aria-hidden /> WhatsApp
              </Button>
            ))}
        </div>
      </Card>
    </li>
  );
}

export function ContactsSection({ rightContainer = null }) {
  const [reload, setReload] = useState(0);
  const [reporting, setReporting] = useState(null);
  const [reportedIds, setReportedIds] = useState([]);
  const {
    data: itemsData,
    loading,
    error,
  } = useAsyncData(async () => {
    const data = await getMyContacts({ pageSize: FETCH_LIMIT });
    return data.items || [];
  }, [reload]);

  const items = useMemo(() => itemsData ?? [], [itemsData]);

  const refresh = () => setReload((n) => n + 1);

  const [q, setQ] = useState("");
  const [sort, setSort] = useState("recent");
  const [origin, setOrigin] = useState("all");
  const [channel, setChannel] = useState("all");
  const [page, setPage] = useState(1);

  const dirty = Boolean(
    q || sort !== "recent" || origin !== "all" || channel !== "all",
  );

  const changeFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const resetFilters = () => {
    setQ("");
    setSort("recent");
    setOrigin("all");
    setChannel("all");
    setPage(1);
  };

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let matched = needle
      ? items.filter(
          (c) =>
            (c.displayName || "").toLowerCase().includes(needle) ||
            (c.tradeName || "").toLowerCase().includes(needle) ||
            (c.phone || "").toLowerCase().includes(needle),
        )
      : items;

    if (origin === "outgoing") matched = matched.filter((c) => c.outgoing);
    if (origin === "incoming") matched = matched.filter((c) => !c.outgoing);
    if (channel !== "all")
      matched = matched.filter((c) => c.channel === channel);

    return [...matched].sort((a, b) =>
      sort === "name"
        ? (a.displayName || "").localeCompare(b.displayName || "", "fr")
        : new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [items, q, sort, origin, channel]);

  const paged = useMemo(
    () => visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [visible, page],
  );

  const filters = (searchId) => (
    <AdminFilterPanel dirty={dirty} onReset={resetFilters}>
      <div className="divide-y divide-gray-100">
        <AdminFilterGroup title="Recherche">
          <SearchInput
            id={searchId}
            value={q}
            onChange={(e) => changeFilter(setQ)(e.target.value)}
            onClear={() => changeFilter(setQ)("")}
            placeholder="Nom, métier ou téléphone..."
            aria-label="Rechercher dans mes contacts"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Origine">
          <CustomSelect
            value={origin}
            onChange={changeFilter(setOrigin)}
            options={ORIGIN_OPTIONS}
            className="w-full"
            aria-label="Filtrer par origine du contact"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Canal">
          <CustomSelect
            value={channel}
            onChange={changeFilter(setChannel)}
            options={CHANNEL_OPTIONS}
            className="w-full"
            aria-label="Filtrer par canal de contact"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Trier par">
          <CustomSelect
            value={sort}
            onChange={changeFilter(setSort)}
            options={SORT_OPTIONS}
            className="w-full"
            aria-label="Trier les contacts"
          />
        </AdminFilterGroup>
      </div>
    </AdminFilterPanel>
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
          Mes contacts
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Les professionnels et clients que vous avez appelés ou écrits.
        </p>
      </div>

      <AccountSectionLayout
        ariaLabel="de mes contacts"
        rightContainer={rightContainer}
        searchId="my-contacts-search"
        filters={filters}
      >
        <DataState
          loading={loading}
          error={error}
          errorPrefix="Impossible de charger vos contacts"
        >
          {visible.length === 0 ? (
            <EmptyState
              icon={Users}
              title={
                items.length === 0
                  ? "Aucun contact pour le moment"
                  : "Aucun résultat"
              }
              description={
                items.length === 0
                  ? "Les clients et les professionnels que vous contactez apparaîtront ici."
                  : "Aucun contact ne correspond à cette recherche."
              }
            />
          ) : (
            <>
              <ul className="space-y-3">
                {paged.map((c) => (
                  <ContactRow
                    key={c.id}
                    contact={c}
                    onReach={refresh}
                    onReport={setReporting}
                    reported={reportedIds.includes(c.userId)}
                  />
                ))}
              </ul>

              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                total={visible.length}
                onPageChange={setPage}
                variant="summary"
              />
            </>
          )}
        </DataState>
      </AccountSectionLayout>

      <ReportDialog
        open={reporting != null}
        onClose={() => setReporting(null)}
        title="Signaler ce contact"
        description={`Votre signalement concerne ${reporting?.displayName || "ce contact"} et sera transmis à l’administration.`}
        reasonOptions={REPORT_REASON_OPTIONS}
        notice="Le signalement est possible uniquement pour un contact avec qui vous avez déjà échangé."
        submit={async (payload) => {
          const id = reporting?.userId;
          await reportContact(id, payload);
          setReportedIds((prev) => [...prev, id]);
        }}
      />
    </div>
  );
}
