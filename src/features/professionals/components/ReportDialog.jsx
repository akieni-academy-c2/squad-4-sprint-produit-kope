import { REPORT_REASON_OPTIONS } from "@/shared/constants/reports.js";
import { reportProfessional } from "../services/professionals.service.js";
import {
  ReportDialog,
  ReportTrigger,
} from "@/features/reports/components/ReportDialog.jsx";

export function ReportProfessionalDialog({ open, onClose, professionalId }) {
  return (
    <ReportDialog
      open={open}
      onClose={onClose}
      title="Signaler ce profil"
      reasonOptions={REPORT_REASON_OPTIONS}
      notice="Un signalement par profil et par compte. Les signalements répétés ou abusifs peuvent entraîner le blocage du compte."
      submit={(payload) => reportProfessional(professionalId, payload)}
    />
  );
}

export { ReportTrigger };
