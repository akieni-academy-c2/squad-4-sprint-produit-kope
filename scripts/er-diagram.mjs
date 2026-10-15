import pg from 'pg';

/**
 * Diagrammes entité-association rendus en SVG, sans dépendance de rendu.
 *
 * Les liens sont routés orthogonalement dans des gouttières verticales, une
 * verticale par lien, et jamais dans la marge extérieure : deux liens qui se
 * croisent ne partagent alors aucun segment. Douze entités ne tiennent pas
 * lisibles sur une seule page A4 paysage, le modèle est donc rendu en deux
 * planches, chacune avec ses colonnes.
 */

const SHORT_TYPE = {
  'character varying': 'varchar',
  'timestamp with time zone': 'timestamptz',
  'timestamp without time zone': 'timestamp',
  'double precision': 'float8',
};

const ENUM_TYPES = ['user_role', 'contact_status', 'contact_channel'];

export function abbreviate(type) {
  if (ENUM_TYPES.some((t) => type.includes(t))) return type;
  const [base, ...rest] = type.split('(');
  const short = SHORT_TYPE[base] ?? base;
  return rest.length ? `${short}(${rest.join('(')}` : short;
}

const BOX = { width: 300, header: 28, row: 14.5, padX: 12, padY: 8, gap: 22 };
const GUTTER = 86;
const MARGIN = 16;
const LEFT_CHANNEL = 52;
const FONT = "Inter, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

/** Planche 1 : qui existe, ce qu'il propose, où. */
const SHEET_CORE = {
  id: 'core',
  title: 'Cœur du modèle - comptes, profils, référentiels',
  columns: [
    ['TRADE_CATEGORIES', 'TRADES', 'CITIES', 'ZONES'],
    ['USERS', 'PROFESSIONALS'],
    ['PROFESSIONAL_ZONES', 'PHOTOS'],
  ],
  relations: [
    ['TRADE_CATEGORIES', 'TRADES', '1', '0..n'],
    ['CITIES', 'ZONES', '1', '0..n'],
    ['TRADES', 'PROFESSIONALS', '1', '0..n'],
    ['CITIES', 'PROFESSIONALS', '0..1', '0..n'],
    ['USERS', 'PROFESSIONALS', '1', '0..1'],
    ['ZONES', 'PROFESSIONAL_ZONES', '1', '0..n'],
    ['PROFESSIONALS', 'PROFESSIONAL_ZONES', '1', '0..n'],
    ['PROFESSIONALS', 'PHOTOS', '1', '0..n'],
  ],
};

/** Planche 2 : ce que les comptes se renvoient. */
const SHEET_SOCIAL = {
  id: 'social',
  title: 'Retours, contacts et modération',
  columns: [
    ['USERS', 'PROFESSIONALS'],
    ['REVIEWS', 'CONTACTS'],
    ['ACCOUNT_REPORTS', 'REVIEW_REPORTS'],
  ],
  relations: [
    ['USERS', 'REVIEWS', '1', '0..n'],
    ['PROFESSIONALS', 'REVIEWS', '1', '0..n'],
    ['USERS', 'CONTACTS', '1', '0..n'],
    ['USERS', 'ACCOUNT_REPORTS', '1', '0..n'],
    ['USERS', 'REVIEW_REPORTS', '1', '0..n'],
    ['REVIEWS', 'REVIEW_REPORTS', '1', '0..n'],
  ],
};

export const SHEETS = [SHEET_CORE, SHEET_SOCIAL];

/** Entités citées par une planche sans y être dessinées. */
const CONTEXT = {
  social: new Set(['PROFESSIONALS']),
};

const escapeXml = (value) =>
  String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

/** Le SVG réduit les espaces en succession : l'insécable reste, lui. */
const NBSP = ' ';

function layout(sheet, entities) {
  const boxes = new Map();
  const columns = [];
  let height = 0;

  sheet.columns.forEach((names, index) => {
    const x = MARGIN + LEFT_CHANNEL + index * (BOX.width + GUTTER);
    let y = MARGIN;
    const stack = [];

    for (const name of names) {
      const entity = entities.get(name);
      if (!entity) continue;
      const height = BOX.header + entity.columns.length * BOX.row + BOX.padY;
      const box = { ...entity, x, y, width: BOX.width, height, column: index };
      boxes.set(name, box);
      stack.push(box);
      y += height + BOX.gap;
    }

    columns.push({ x, boxes: stack, index });
    height = Math.max(height, y - BOX.gap);
  });

  return {
    boxes,
    columns,
    width: MARGIN * 2 + LEFT_CHANNEL + sheet.columns.length * BOX.width + (sheet.columns.length - 1) * GUTTER,
    height: height + MARGIN,
  };
}

const crowFoot = (x, y, sign) =>
  `<path d="M${x} ${y} l${9 * sign} -5.5 M${x} ${y} l${9 * sign} 0 M${x} ${y} l${9 * sign} 5.5"
     stroke="#5f6368" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;

const oneBar = (x, y, sign) =>
  `<path d="M${x} ${y} l${8 * sign} 0" stroke="#5f6368" stroke-width="1.2" stroke-linecap="round"/>`;

const zeroMark = (x, y) =>
  `<circle cx="${x}" cy="${y}" r="3.2" fill="#fff" stroke="#5f6368" stroke-width="1.2"/>`;

function cardinality(x, y, value, sign) {
  const optional = value.startsWith('0');
  if (value.endsWith('n')) {
    const foot = crowFoot(x, y, sign);
    return optional ? foot + zeroMark(x + 15 * sign, y) : foot;
  }
  const bar = oneBar(x + 8 * sign, y, sign);
  return optional ? bar + zeroMark(x + 16 * sign, y) : bar;
}

function drawEntity(box, isContext) {
  const stroke = isContext ? '#c8ccd0' : '#dadce0';
  const head = isContext ? '#f8f9fa' : '#f1f3f4';
  const radius = 7;

  const rows = box.columns
    .map((column, i) => {
      const y = box.y + BOX.header + i * BOX.row + BOX.row - 4.5;
      const badges = [
        column.pk ? '<tspan fill="#1967d2" font-weight="700">PK</tspan>' : '',
        column.fk ? '<tspan fill="#188038" font-weight="700">FK</tspan>' : '',
        column.uk ? '<tspan fill="#a142f4" font-weight="700">UK</tspan>' : '',
      ].filter(Boolean);
      const label = escapeXml(column.name);
      const type = escapeXml(abbreviate(column.type));

      return `<text x="${box.x + BOX.padX}" y="${y}" font-size="10" fill="#3c4043"
        font-family="${FONT}" opacity="${isContext ? 0.72 : 1}">${label}
        <tspan fill="#80868b">${type}</tspan>${
          badges.length
            ? `<tspan fill="#c4c7c5">${NBSP}·${NBSP}</tspan>${badges.join(`<tspan fill="#c4c7c5">${NBSP}</tspan>`)}`
            : ''
        }</text>`;
    })
    .join('');

  return `<g opacity="${isContext ? 0.85 : 1}">
    <rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="${radius}"
      fill="#ffffff" stroke="${stroke}" stroke-width="1"/>
    <path d="M${box.x} ${box.y + radius} a${radius} ${radius} 0 0 1 ${radius} -${radius}
      h${box.width - radius * 2} a${radius} ${radius} 0 0 1 ${radius} ${radius}
      v${BOX.header - radius} h${-box.width} z" fill="${head}"/>
    <path d="M${box.x} ${box.y + BOX.header} h${box.width}" stroke="#e8eaed" stroke-width="1"/>
    <text x="${box.x + BOX.padX}" y="${box.y + 19.5}" font-size="11.5" font-weight="700"
      fill="#202124" font-family="${FONT}">${escapeXml(box.name)}${
        isContext ? '<tspan fill="#9aa0a6" font-weight="500" font-size="9">  (rappel)</tspan>' : ''
      }</text>
    ${rows}
  </g>`;
}

/** Une verticale libre par lien : deux liens qui se croisent ne se recouvrent jamais. */
function routeRelations(sheet, boxes, columns) {
  const lanes = new Map();

  for (const [fromName, toName, fromCard, toCard] of sheet.relations) {
    const from = boxes.get(fromName);
    const to = boxes.get(toName);
    if (!from || !to) continue;

    const lo = Math.min(from.column, to.column);
    const hi = Math.max(from.column, to.column);
    const same = lo === hi;
    const gutter = same ? Math.max(0, lo - 1) : lo;

    if (!lanes.has(gutter)) lanes.set(gutter, { same: [], cross: [] });
    lanes.get(gutter)[same ? 'same' : 'cross'].push({ from, to, fromCard, toCard });
  }

  const parts = [];

  for (const [gutter, groups] of lanes) {
    const left = columns[gutter].x;
    const right = left + BOX.width;
    const start = right + 8;

    const cross = [...groups.cross].sort((p, q) => p.from.y - q.from.y || p.to.y - q.to.y);
    cross.forEach((link, index) => {
      const step = (GUTTER - 16) / (cross.length + 1);
      const channel = start + step * (index + 1);
      const x1 = link.from.column < link.to.column ? right : left;
      const x2 = link.to.column > link.from.column ? columns[gutter + 1].x : right;
      const y1 = link.from.y + link.from.height / 2;
      const y2 = link.to.y + link.to.height / 2;
      const fromSign = x1 < channel ? 1 : -1;
      const toSign = x2 < channel ? 1 : -1;

      parts.push(
        `<g><path d="M${x1} ${y1} H${channel} V${y2} H${x2}" fill="none" stroke="#c4c7c5"
            stroke-width="1.1" stroke-linejoin="round"/>
          ${cardinality(x1 + 11 * fromSign, y1, link.fromCard, fromSign)}
          ${cardinality(x2 - 11 * toSign, y2, link.toCard, toSign)}
        </g>`,
      );
    });

    const same = [...groups.same].sort((p, q) => p.from.y - q.from.y || p.to.y - q.to.y);
    const laneStart = gutter === 0 ? MARGIN + 4 : left - LEFT_CHANNEL + 4;
    same.forEach((link, index) => {
      const laneWidth = gutter === 0 ? LEFT_CHANNEL - 8 : LEFT_CHANNEL - 8;
      const channel = laneStart + (laneWidth / (same.length + 1)) * (index + 1);
      const y1 = link.from.y + link.from.height / 2;
      const y2 = link.to.y + link.to.height / 2;
      const fromSign = left < channel ? -1 : 1;
      const toSign = left < channel ? -1 : 1;

      parts.push(
        `<g><path d="M${left} ${y1} H${channel} V${y2} H${left}" fill="none" stroke="#c4c7c5"
            stroke-width="1.1" stroke-linejoin="round" stroke-dasharray="4 3"/>
          ${cardinality(left + 11 * fromSign, y1, link.fromCard, fromSign)}
          ${cardinality(left + 11 * toSign, y2, link.toCard, toSign)}
        </g>`,
      );
    });
  }

  return parts.join('\n');
}

export function renderSheet(sheet, entities) {
  const { boxes, columns, width, height } = layout(sheet, entities);
  const links = routeRelations(sheet, boxes, columns);
  const context = CONTEXT[sheet.id] ?? new Set();
  const bodies = [...boxes.values()].map((box) => drawEntity(box, context.has(box.name))).join('\n');

  return { sheet, svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"
  width="${width}" height="${height}" role="img" aria-label="${escapeXml(sheet.title)}">
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  ${links}
  ${bodies}
</svg>` };
}

export function renderErDiagrams(entities) {
  return SHEETS.map((sheet) => renderSheet(sheet, entities));
}

export async function loadEntities(pool) {
  const { rows: tables } = await pool.query(`
    SELECT c.relname AS name
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = current_schema() AND c.relkind = 'r' AND c.relname <> 'session'
     ORDER BY c.relname`);

  /**
   * La disposition s'écrit en majuscules parce que c'est la forme attendue par
   * le SVG et par Mermaid, alors que PostgreSQL rend les noms en minuscules. On
   * apparie donc sans tenir compte de la casse, sans quoi la liste sortirait
   * vide et les planches seraient rendues vides sans lever la moindre erreur.
   */
  const byLowerName = new Map(tables.map((t) => [t.name.toLowerCase(), t.name]));
  const wanted = [...new Set(SHEETS.flatMap((s) => s.columns.flat()))]
    .map((name) => byLowerName.get(name.toLowerCase()))
    .filter(Boolean);

  if (!wanted.length) return new Map();
  const placeholders = wanted.map((_, i) => `$${i + 1}`).join(',');

  /**
   * `attnum` est renvoyé explicitement car il ne correspond pas à la position
   * dans la liste dès qu'une colonne a été supprimée, et c'est lui que
   * référencent les clés étrangères.
   */
  const [{ rows: columns }, { rows: cons }] = await Promise.all([
    pool.query(
      `SELECT c.relname AS table_name, a.attname AS name, a.attnum,
              format_type(a.atttypid, a.atttypmod) AS type
         FROM pg_attribute a
         JOIN pg_class c ON c.oid = a.attrelid
         JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = current_schema() AND c.relname = ANY (ARRAY[${placeholders}])
          AND a.attnum > 0 AND NOT a.attisdropped
        ORDER BY c.relname, a.attnum`,
      wanted,
    ),
    pool.query(
      `SELECT c.relname AS table_name, con.contype, con.conkey
         FROM pg_constraint con
         JOIN pg_class c ON c.oid = con.conrelid
         JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = current_schema() AND c.relname = ANY (ARRAY[${placeholders}])
          AND con.contype IN ('p', 'u', 'f')`,
      wanted,
    ),
  ]);

  const entities = new Map();

  for (const name of wanted) {
    const own = columns.filter((c) => c.table_name === name);
    const pkColumns = new Set();
    const ukColumns = new Set();
    const fkColumns = new Set();

    for (const con of cons.filter((x) => x.table_name === name)) {
      for (const attnum of con.conkey) {
        const column = own.find((c) => c.attnum === attnum);
        if (!column) continue;
        if (con.contype === 'p') pkColumns.add(column.name);
        else if (con.contype === 'u') ukColumns.add(column.name);
        else fkColumns.add(column.name);
      }
    }

    entities.set(name.toUpperCase(), {
      name: name.toUpperCase(),
      columns: own.map((c) => ({
        name: c.name,
        type: c.type,
        pk: pkColumns.has(c.name),
        fk: fkColumns.has(c.name),
        uk: ukColumns.has(c.name),
      })),
    });
  }

  return entities;
}
