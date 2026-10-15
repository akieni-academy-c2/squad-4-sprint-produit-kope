import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

process.loadEnvFile();

const OUT = path.resolve('docs/data-science');
const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL absente : impossible d\'extraire le schéma');

const pool = new pg.Pool({ connectionString: url, connectionTimeoutMillis: 20_000 });

const q = (text, params) => pool.query(text, params);

/** Tables gérées par l'outillage, sans valeur métier pour l'analyse. */
const TECHNICAL = new Set(['pgmigrations', 'session', 'rate_limits', 'playing_with_neon']);

/** Libellés lisibles des actions de clé étrangère (confdeltype). */
const FK_ACTION = { a: 'aucune', r: 'RESTRICT', c: 'CASCADE', n: 'SET NULL', d: 'SET DEFAULT' };

/** Identifiant SQL, pour une position `FROM`. */
const qIdent = (name) => `"${String(name).replaceAll('"', '""')}"`;

/** Littéral SQL, pour une comparaison suivie d'un cast `::regclass`. */
const qLiteral = (name) => `'${String(name).replaceAll("'", "''")}'`;

async function enums() {
  const { rows } = await q(`
    SELECT t.typname AS name,
           string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) AS values
      FROM pg_type t
      JOIN pg_enum e ON e.enumtypid = t.oid
      JOIN pg_namespace n ON n.oid = t.typnamespace
     WHERE n.nspname = current_schema()
     GROUP BY t.typname
     ORDER BY t.typname`);
  return rows;
}

async function tables() {
  const { rows } = await q(`
    SELECT c.relname AS name
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = current_schema() AND c.relkind = 'r'
     ORDER BY c.relname`);
  return rows.map((r) => r.name);
}

async function views() {
  const { rows } = await q(`
    SELECT table_name AS name, view_definition AS definition
      FROM information_schema.views
     WHERE table_schema = current_schema()
     ORDER BY table_name`);
  return rows;
}

async function columns(table) {
  const { rows } = await q(`
    SELECT a.attname AS name,
           format_type(a.atttypid, a.atttypmod) AS type,
           NOT a.attnotnull AS nullable,
           pg_get_expr(d.adbin, d.adrelid) AS default_value,
           col_description(a.attrelid, a.attnum) AS comment
      FROM pg_attribute a
      LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
     WHERE a.attrelid = ${qLiteral(table)}::regclass
       AND a.attnum > 0 AND NOT a.attisdropped
     ORDER BY a.attnum`);
  return rows;
}

async function constraints(table) {
  const { rows } = await q(`
    SELECT con.conname AS name,
           con.contype AS type,
           pg_get_constraintdef(con.oid) AS definition,
           (SELECT string_agg(a.attname, ', ' ORDER BY k.ord)
              FROM unnest(con.conkey) WITH ORDINALITY AS k(attnum, ord)
              JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = k.attnum
           ) AS columns
      FROM pg_constraint con
     WHERE con.conrelid = ${qLiteral(table)}::regclass
     ORDER BY con.contype, con.conname`);
  return rows;
}

async function foreignKeys(table) {
  const { rows } = await q(`
    SELECT con.conname AS name,
           (SELECT string_agg(a.attname, ', ')
              FROM unnest(con.conkey) WITH ORDINALITY AS k(attnum, ord)
              JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = k.attnum
           ) AS columns,
           c2.relname AS target_table,
           (SELECT string_agg(a.attname, ', ')
              FROM unnest(con.confkey) WITH ORDINALITY AS k(attnum, ord)
              JOIN pg_attribute a ON a.attrelid = con.confrelid AND a.attnum = k.attnum
           ) AS target_columns,
           con.confdeltype AS on_delete,
           con.confupdtype AS on_update
      FROM pg_constraint con
      JOIN pg_class c1 ON c1.oid = con.conrelid
      JOIN pg_class c2 ON c2.oid = con.confrelid
     WHERE con.contype = 'f' AND c1.relname = $1
     ORDER BY con.conname`, [table]);
  return rows;
}

async function indexes(table) {
  const { rows } = await q(`
    SELECT indexname AS name, indexdef AS definition
      FROM pg_indexes
     WHERE schemaname = current_schema() AND tablename = $1
     ORDER BY indexname`, [table]);
  return rows;
}

async function rowCount(table) {
  const { rows } = await q(`SELECT count(*)::bigint AS n FROM ${qIdent(table)}`);
  return Number(rows[0].n);
}

function mdEscape(value) {
  return String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
}

/** `pg_get_constraintdef` agrège déjà les colonnes : on les scinde pour la liste. */
function listColumns(value) {
  return String(value ?? '')
    .split(', ')
    .map((column) => `\`${column}\``)
    .join(', ');
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const [enumList, tableList, viewList, counts] = await Promise.all([
    enums(),
    tables(),
    views(),
    tables().then((list) => Promise.all(list.map(async (t) => [t, await rowCount(t)]))),
  ]);
  const countByTable = new Map(counts);

  const business = tableList.filter((t) => !TECHNICAL.has(t));
  const technical = tableList.filter((t) => TECHNICAL.has(t));

  const parts = [];
  parts.push('# Schéma de la base KOP');
  parts.push('');
  parts.push('> Document généré par `npm run schema:doc` à partir de la base vivante.');
  parts.push('> Ne pas éditer à la main : toute modification passe par une migration.');
  parts.push('');
  parts.push(
    `${business.length} tables métier, ${viewList.length} vue, ${enumList.length} types énumérés, ` +
      `${technical.length} tables techniques sans valeur d'analyse.`,
  );
  parts.push('');

  parts.push('## Volume actuel');
  parts.push('');
  parts.push('| Table métier | Lignes |');
  parts.push('| :--- | ---: |');
  for (const t of business) parts.push(`| \`${t}\` | ${countByTable.get(t) ?? 0} |`);
  parts.push('');
  parts.push(
    'Tables techniques, à ignorer pour toute analyse : ' +
      technical.map((t) => `\`${t}\``).join(', ') +
      '.',
  );
  parts.push('');

  if (enumList.length) {
    parts.push('## Types énumérés');
    parts.push('');
    for (const e of enumList) {
      parts.push(`- **\`${e.name}\`** : ${e.values}`);
    }
    parts.push('');
  }

  parts.push('## Tables métier');
  parts.push('');
  for (const table of business) {
    const [cols, cons, fks, idx] = await Promise.all([
      columns(table),
      constraints(table),
      foreignKeys(table),
      indexes(table),
    ]);

    const pk = cons.find((c) => c.type === 'p');
    const uniques = cons.filter((c) => c.type === 'u');
    const checks = cons.filter((c) => c.type === 'c' && !c.definition.includes('NOT NULL'));

    parts.push(`### \`${table}\``);
    parts.push('');
    parts.push(`*${countByTable.get(table) ?? 0} ligne(s)*`);
    parts.push('');
    parts.push('| Colonne | Type | Null | Défaut |');
    parts.push('| :--- | :--- | :--- | :--- |');
    for (const col of cols) {
      const isPk = pk?.columns?.split(', ').includes(col.name);
      parts.push(
        `| ${isPk ? '**' : ''}\`${col.name}\`${isPk ? '**' : ''} | \`${col.type}\` | ${
          col.nullable ? 'oui' : 'non'
        } | ${col.default_value ? `\`${mdEscape(col.default_value)}\`` : '-'} |`,
      );
    }
    parts.push('');

    if (pk) parts.push(`- Clé primaire : ${listColumns(pk.columns)}`);
    for (const u of uniques) parts.push(`- Unicité : ${listColumns(u.columns)}`);
    for (const f of fks)
      parts.push(
        `- \`${f.columns}\` → \`${f.target_table}.${f.target_columns}\` (suppression : ${
          FK_ACTION[f.on_delete] ?? f.on_delete
        })`,
      );
    for (const c of checks) parts.push(`- Contrainte : \`${mdEscape(c.definition)}\``);
    parts.push('');

    parts.push('<details><summary>Index</summary>');
    parts.push('');
    for (const i of idx) parts.push(`- \`${i.name}\` : \`${mdEscape(i.definition)}\``);
    parts.push('');
    parts.push('</details>');
    parts.push('');
  }

  if (viewList.length) {
    parts.push('## Vues');
    parts.push('');
    for (const v of viewList) {
      parts.push(`### \`${v.name}\``);
      parts.push('');
      parts.push('```sql');
      parts.push(v.definition);
      parts.push('```');
      parts.push('');
    }
  }

  parts.push('## Cardinalités');
  parts.push('');
  parts.push('```text');
  parts.push('users 1──0..1 professionals        (un compte, au plus un profil artisan)');
  parts.push('users 1──*    reviews               (un avis par client et par artisan)');
  parts.push('trades 1──*  professionals');
  parts.push('zones  1──*  professional_zones    (n-association : plusieurs zones par artisan)');
  parts.push('zones  1──*  cities                 (une zone appartient à une ville)');
  parts.push('professionals 1──* photos');
  parts.push('users 1──*    account_reports       (signalements, client ou artisan visé)');
  parts.push('users 1──*    review_reports        (signalements d\'avis)');
  parts.push('```');
  parts.push('');

  fs.writeFileSync(path.join(OUT, 'schema.md'), parts.join('\n'), 'utf8');
  console.log(
    `docs/data-science/schema.md - ${business.length} tables métier, ${viewList.length} vue`,
  );
}

await main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

