import { PROFILE_STATUS } from "@/shared/lib/constants.js";

export const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: PROFILE_STATUS.PUBLISHED, label: "Publiés" },
  { value: PROFILE_STATUS.INCOMPLETE, label: "Incomplets" },
  { value: PROFILE_STATUS.HIDDEN, label: "Masqués" },
];

export const SORT_OPTIONS = [
  { value: "name", label: "Nom (A-Z)" },
  { value: "recent", label: "Plus récents" },
];

export function statusVariant(status) {
  if (status === PROFILE_STATUS.PUBLISHED) return "success";
  if (status === PROFILE_STATUS.HIDDEN) return "danger";
  return "warning";
}

export function getProIdentity(pro) {
  const id = pro.userId || pro.id;
  return {
    id,
    name:
      pro.displayName ||
      [pro.firstName, pro.lastName].filter(Boolean).join(" ") ||
      `#${id}`,
  };
}
