import { MotifSvg } from "@/shared/components/ui/MotifSvg.jsx";

/**
 * Motif decoratif de fond du panneau lateral du modal.
 */
export function AuthPanelMotif() {
  return (
    <MotifSvg viewBox="0 0 640 960">
      <circle cx="60" cy="60" r="50" fill="#ffffff" opacity="0.05" />
      <circle cx="600" cy="900" r="70" fill="#ffffff" opacity="0.05" />
      <rect
        x="80"
        y="700"
        width="60"
        height="60"
        rx="14"
        transform="rotate(18 110 730)"
        fill="#ffffff"
        opacity="0.06"
      />
      <rect
        x="480"
        y="140"
        width="56"
        height="56"
        rx="13"
        transform="rotate(-14 508 168)"
        fill="#ffffff"
        opacity="0.06"
      />
      <polygon points="240,560 300,490 360,560" fill="#ffffff" opacity="0.05" />
      <circle
        cx="320"
        cy="140"
        r="22"
        fill="none"
        stroke="#ffffff"
        strokeWidth="6"
        opacity="0.1"
      />
      <circle cx="160" cy="170" r="11" fill="#ffffff" opacity="0.1" />
      <polygon points="520,700 556,714 528,734" fill="#ffffff" opacity="0.1" />
      <path
        d="M40 800 Q100 760 160 790"
        stroke="#ffffff"
        strokeWidth="5"
        opacity="0.09"
      />
      <circle
        cx="130"
        cy="420"
        r="16"
        fill="none"
        stroke="#ffffff"
        strokeWidth="5"
        opacity="0.09"
      />
      <rect
        x="280"
        y="90"
        width="28"
        height="28"
        rx="8"
        transform="rotate(28 294 104)"
        fill="#ffffff"
        opacity="0.08"
      />
      <rect
        x="420"
        y="820"
        width="40"
        height="40"
        rx="10"
        transform="rotate(-22 440 840)"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        opacity="0.1"
      />
      <circle cx="500" cy="420" r="8" fill="#ffffff" opacity="0.12" />
      <circle
        cx="230"
        cy="60"
        r="6"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        opacity="0.12"
      />
      <path
        d="M460 90 q27 -19 54 0 q27 19 54 0"
        stroke="#ffffff"
        strokeWidth="5"
        opacity="0.08"
      />
      <polygon
        points="60,300 120,300 90,340"
        fill="#ffffff"
        opacity="0.06"
        transform="rotate(-16 90 320)"
      />
    </MotifSvg>
  );
}
