import { useMemo } from 'react';

/**
 * Motif décoratif de fond, tiré au sort mais stable. Un `Math.random()` dans le
 * rendu redessine tout le motif à chaque rendu ; la graine le rend reproductible.
 * SVG : des formes CSS demanderaient autant d'éléments que de motifs, et ne
 * donnent ni cercles partiels, ni anneaux, ni losanges.
 */

const SHAPES = ['circle', 'ring', 'diamond', 'dot'];

/** Générateur congruentiel linéaire : même graine, même suite. */
function seeded(seed) {
  let state = (seed % 2147483647) + 1;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function Shape({ kind, random, tone }) {
  const cx = Math.round(random() * 100);
  const cy = Math.round(random() * 100);
  const size = 8 + random() * 26;
  const opacity = 0.04 + random() * 0.09;

  const style = { opacity };

  if (kind === 'circle') return <circle cx={cx} cy={cy} r={size / 2} fill={tone} style={style} />;
  if (kind === 'ring')
    return <circle cx={cx} cy={cy} r={size / 2} fill="none" stroke={tone} strokeWidth="1.5" style={style} />;
  if (kind === 'dot') return <circle cx={cx} cy={cy} r={1.5 + random() * 2} fill={tone} style={style} />;

  const half = size / 2;
  return (
    <rect
      x={cx - half}
      y={cy - half}
      width={size}
      height={size}
      rx={3 + random() * 5}
      fill={tone}
      transform={`rotate(${Math.round(random() * 90)} ${cx} ${cy})`}
      style={style}
    />
  );
}

/**
 * @param {number} [props.count=14]    nombre de formes
 * @param {string} [props.seed=1]      graine : même graine, même motif
 * @param {string} [props.tone='#fff'] couleur des formes
 * @param {string} [props.className]   classes du `<svg>`
 */
export function MotifBackdrop({ count = 14, seed = 1, tone = '#fff', className }) {
  const shapes = useMemo(() => {
    const random = seeded(seed);
    return Array.from({ length: count }, (_, index) => ({
      key: index,
      kind: SHAPES[Math.floor(random() * SHAPES.length)],
      draw: random,
    }));
  }, [count, seed]);

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      {shapes.map((shape) => (
        <Shape key={shape.key} kind={shape.kind} random={shape.draw} tone={tone} />
      ))}
    </svg>
  );
}