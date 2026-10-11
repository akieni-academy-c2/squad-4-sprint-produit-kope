export const groupKeyOf = (groupId) => (groupId == null ? null : Number(groupId));

const GROUP_TINTS = [
  { band: 'bg-primary-500', dot: 'bg-primary-200' },
  { band: 'bg-primary-400', dot: 'bg-primary-100' },
  { band: 'bg-[#6d8a58]', dot: 'bg-[#c3d6b4]' },
  { band: 'bg-[#3f8a78]', dot: 'bg-[#b6dbd1]' },
  { band: 'bg-[#5b7fa8]', dot: 'bg-[#bcd0e4]' },
  { band: 'bg-[#7a8098]', dot: 'bg-[#c8ccd8]' },
  { band: 'bg-[#8b6d9a]', dot: 'bg-[#d2c0dc]' },
  { band: 'bg-[#9b6157]', dot: 'bg-[#e2c4bd]' },
  { band: 'bg-[#a17a3c]', dot: 'bg-[#e6d2ab]' },
  { band: 'bg-[#9b6d82]', dot: 'bg-[#dfc6d2]' },
  { band: 'bg-[#7b8b98]', dot: 'bg-[#c8d4dc]' },
  { band: 'bg-[#8a7d58]', dot: 'bg-[#d8d0b6]' },
];

export function tintFor(name) {
  let hash = 0;
  const seed = String(name || '');
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 1000003;
  return GROUP_TINTS[hash % GROUP_TINTS.length];
}

export const usedBy = (count) => `Utilisé par ${count} pro${count > 1 ? 's' : ''}`;

export function groupItems(items, groups, groupByKey) {
  const map = new Map(groups.map((g) => [groupKeyOf(g.id), []]));
  for (const item of items) map.get(groupKeyOf(item[groupByKey]))?.push(item);
  return map;
}

/**
 * Entrées affichées d'un groupe pendant un déplacement.
 * La carte déplacée reste montée dans sa liste (`gap` ou `dragging`) et la
 * position d'arrivée est matérialisée par une copie distincte (`preview`).
 */
export function displayEntries(cards, draggingItem, preview, groupKey) {
  if (!draggingItem) return cards.map((item) => ({ item, state: 'normal', entryKey: item.id }));

  const gapAt = cards.findIndex((i) => i.id === draggingItem.id);
  const sourceState = gapAt < 0 ? null : preview && preview.key !== groupKey ? 'gap' : 'dragging';
  const entries = cards.map((item) => ({
    item,
    state: item.id === draggingItem.id ? sourceState : 'normal',
    entryKey: item.id,
  }));

  if (!preview || preview.key !== groupKey) return entries;

  const position = Math.max(0, Math.min(preview.index, cards.length - (gapAt < 0 ? 0 : 1)));
  const insertAt = gapAt < 0 ? position : position > gapAt ? position + 1 : position;
  entries.splice(insertAt, 0, {
    item: draggingItem,
    state: 'preview',
    entryKey: `preview-${draggingItem.id}`,
  });
  return entries;
}

/** Convertit un index d'entrée (liste incluant le trou) en index de destination. */
export function destinationIndex(cards, entryIndex, draggingItem) {
  const gapAt = cards.findIndex((i) => draggingItem && i.id === draggingItem.id);
  if (gapAt < 0) return entryIndex;
  return entryIndex > gapAt ? entryIndex - 1 : entryIndex;
}
