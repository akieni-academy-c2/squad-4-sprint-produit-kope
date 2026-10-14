import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import pg from 'pg';
import { renderErDiagrams, loadEntities, abbreviate } from './er-diagram.mjs';
import { PURPOSE, GRAIN, DELETES, INVARIANTS, LIMITS, QUERIES } from './dictionary-content.mjs';

process.loadEnvFile();

const OUT_DIR = path.resolve('docs/data-science');
const PDF_PATH = path.join(OUT_DIR, 'KOP_dictionnaire_des_donnees.pdf');
const HTML_PATH = path.join(OUT_DIR, 'KOP_dictionnaire_des_donnees.html');

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const TODAY = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date());

const CSS = `
  @page { size: A4; margin: 18mm 16mm 16mm; }
  @page landscape { size: A4 landscape; margin: 12mm; }
  @page cover { margin: 0; }

  :root {
    --ink: #202124;
    --ink-soft: #5f6368;
    --ink-faint: #80868b;
    --rule: #dadce0;
    --surface: #f8f9fa;
    --surface-2: #f1f3f4;
    --accent: #1a73e8;
    --green: #188038;
    --violet: #a142f4;
  }

  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    margin: 0;
    font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 9.6pt;
    line-height: 1.55;
    color: var(--ink);
  }

  h1, h2, h3 { margin: 0; font-weight: 600; letter-spacing: -0.01em; }
  h2 { font-size: 16pt; margin: 0 0 3mm; }
  h3 { font-size: 11pt; margin: 0 0 1.5mm; }
  p { margin: 0 0 2.5mm; }
  code, .mono {
    font-family: 'Cascadia Mono', Consolas, 'Courier New', monospace;
    font-size: 8.6pt;
  }

  .chapter { break-before: page; }
  .chapter:first-of-type { break-before: avoid; }

  .lede { color: var(--ink-soft); font-size: 10.5pt; max-width: 150mm; }
  .eyebrow {
    font-size: 8pt; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--accent); margin-bottom: 2mm;
  }
  .rule { height: 2px; background: var(--accent); width: 18mm; margin: 3mm 0 6mm; }

  table { width: 100%; border-collapse: collapse; margin: 0 0 4mm; }
  th {
    text-align: left; font-size: 8pt; font-weight: 700; letter-spacing: 0.04em;
    text-transform: uppercase; color: var(--ink-soft);
    padding: 1.6mm 2mm; background: var(--surface-2);
    border-bottom: 1px solid var(--rule);
  }
  td { padding: 1.6mm 2mm; border-bottom: 1px solid #eceff1; vertical-align: top; }
  tbody tr:last-child td { border-bottom: 1px solid var(--rule); }
  td.name { font-weight: 600; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .type { color: var(--ink-faint); }

  .badge { font-weight: 700; font-size: 7.4pt; letter-spacing: 0.02em; }
  .badge.pk { color: #1967d2; }
  .badge.fk { color: var(--green); }
  .badge.uk { color: var(--violet); }

  .card {
    border: 1px solid var(--rule); border-radius: 6px;
    padding: 3.5mm 4mm; margin: 0 0 3mm; background: #fff;
    break-inside: avoid;
  }
  .card p:last-child { margin-bottom: 0; }
  .card .meta { color: var(--ink-soft); font-size: 8.8pt; }

  .callout {
    border-left: 3px solid var(--accent); background: #f8fbff;
    padding: 3mm 4mm; margin: 0 0 4mm; break-inside: avoid;
  }
  .callout.warn { border-left-color: #d93025; background: #fdf7f7; }
  .callout p:last-child { margin-bottom: 0; }

  pre {
    background: var(--surface); border: 1px solid var(--rule); border-radius: 6px;
    padding: 3mm; overflow: hidden; font-size: 8.2pt; line-height: 1.5;
    white-space: pre-wrap; margin: 0 0 3mm; break-inside: avoid;
  }

  .sheet { page: landscape; break-before: page; break-after: page; }
  .sheet h2 { margin-bottom: 1mm; }
  .sheet .lede { margin-bottom: 3mm; }
  .sheet svg { width: 100%; height: auto; display: block; }
  .sheet .legend { display: flex; gap: 6mm; margin-top: 3mm; font-size: 8pt; color: var(--ink-soft); }

  .cover {
    page: cover; height: 297mm; display: flex; flex-direction: column;
    position: relative; z-index: 2; background: #fff;
  }
  .cover-band { height: 6mm; background: var(--accent); }
  .cover-body { flex: 1; padding: 40mm 22mm 10mm; display: flex; flex-direction: column; }
  .cover h1 { font-size: 30pt; line-height: 1.1; letter-spacing: -0.02em; }
  .cover .sub { font-size: 13pt; color: var(--ink-soft); margin-top: 4mm; max-width: 130mm; }
  .cover .rule { margin: 8mm 0; }
  .cover dl { display: grid; grid-template-columns: 38mm 1fr; gap: 2mm 6mm; margin: 0; font-size: 9.4pt; }
  .cover dt { color: var(--ink-soft); }
  .cover dd { margin: 0; font-weight: 600; }
  .cover-foot { padding: 0 22mm 18mm; color: var(--ink-faint); font-size: 8.4pt; }

  .figures {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 4mm;
    margin-top: auto; padding-top: 10mm;
  }
  .figures div { border-top: 2px solid var(--rule); padding-top: 2.5mm; }
  .figures b { display: block; font-size: 19pt; font-weight: 600; letter-spacing: -0.02em; }
  .figures span { font-size: 8.4pt; color: var(--ink-soft); }

  .toc { break-after: page; }
  .toc ol { list-style: none; padding: 0; margin: 0; counter-reset: s; }
  .toc li { counter-increment: s; padding: 2.2mm 0; border-bottom: 1px solid #f1f3f4; }
  .toc li::before {
    content: counter(s) '. '; color: var(--ink-faint); font-variant-numeric: tabular-nums;
  }
  .toc li span { color: var(--ink-soft); }

  .fixed-foot {
    position: fixed; bottom: 0; left: 0; right: 0;
    display: flex; justify-content: space-between;
    font-size: 7.6pt; color: var(--ink-faint);
    border-top: 1px solid var(--rule); padding-top: 1.5mm; margin: 0 16mm;
  }
`;

function coverPage(figures) {
  return `<section class="cover">
    <div class="cover-band"></div>
    <div class="cover-body">
      <p class="eyebrow">Squad 4 · Sprint Produit KOP</p>
      <h1>Schéma de la base<br />et dictionnaire des données</h1>
      <p class="sub">Document de référence destiné à l’équipe Data Science : structure
        relationnelle, règles métier et limites d’analyse de la plateforme KOP.</p>
      <div class="rule"></div>
      <dl>
        <dt>Périmètre</dt><dd>${escapeHtml(TODAY)}</dd>
        <dt>Socle</dt><dd>PostgreSQL · Neon</dd>
        <dt>Source</dt><dd>Base vivante, extraite par introspection</dd>
        <dt>Généré par</dt><dd class="mono">npm run docs:pdf</dd>
      </dl>
    </div>
    <div class="figures">
      ${figures.map(([value, label]) => `<div><b>${value}</b><span>${label}</span></div>`).join('\n      ')}
    </div>
    <div class="cover-foot">
      KOP — annuaire des artisans du bâtiment à Brazzaville.<br />
      Document produit par extraction automatique : toute évolution du schéma se
      répercute à la prochaine génération.
    </div>
  </section>`;
}

function tocPage() {
  const items = [
    ['Objet et périmètre', 'ce que le document couvre, et ce qu’il ne couvre pas'],
    ['Architecture en une page', 'les trois ensembles de tables et la règle de publication'],
    ['Planche 1 — Cœur du modèle', 'comptes, profils et référentiels'],
    ['Planche 2 — Retours et modération', 'avis, contacts et signalements'],
    ['Dictionnaire des données', 'une entrée par table : rôle, colonnes, règles'],
    ['Grain', 'ce que compte exactement une ligne de chaque table'],
    ['Comportement des suppressions', 'mesuré sur la base, chaque essai annulé'],
    ['Invariants', 'ce qui est garanti en base et ce qui ne l’est pas'],
    ['Limites pour l’analyse', 'trois manques structurels à connaître'],
    ['Requêtes de référence', 'les jointures utiles, exécutées et vérifiées'],
  ];
  return `<section class="toc">
    <p class="eyebrow">Sommaire</p>
    <h2>Ce que contient ce document</h2>
    <ol>${items.map(([t, s]) => `<li><strong>${t}</strong><br /><span>${s}</span></li>`).join('')}</ol>
  </section>`;
}

function scopeSection() {
  return `<section class="chapter">
    <p class="eyebrow">Chapitre 1</p>
    <h2>Objet et périmètre</h2>
    <p class="lede">KOP met en relation des particuliers et des artisans du bâtiment à
      Brazzaville. Un artisan publie un profil, un client le trouve, le contacte et peut
      laisser un avis. Ce document décrit la base qui porte ces usages.</p>

    <div class="callout warn">
      <p><strong>Les volumes présentés sont ceux d’un environnement de développement.</strong>
      Au moment de l’extraction : 4 profils, 10 comptes, 0 avis, 0 signalement. Un modèle
      statistique construit sur ces volumes n’aurait aucun sens — ces données valident la
      chaîne de production, pas une distribution. Pour des volumes réels, interroger la base
      de production, qui répond au même schéma.</p>
      <p>Quatre tables sont à ignorer : <code>pgmigrations</code>, <code>session</code>,
      <code>rate_limits</code> et <code>playing_with_neon</code> — cette dernière est
      l’exemple créé par l’hébergeur, absent du code de l’application.</p>
    </div>

    <h3>Ce que le document contient</h3>
    <p>La structure complète : tables, colonnes, types, clés primaires et étrangères,
    unicité, contraintes et index. Les règles métier qui ne figurent pas dans le schéma,
    parce qu’elles vivent dans une vue ou dans un service. Et les limites du modèle, c’est-à-dire
    ce qu’il ne permet pas de mesurer.</p>

    <h3>Comment il a été produit</h3>
    <p>Par introspection de la base vivante, et non par relecture des migrations. Les
    migrations s’empilent et se modifient : la vue <code>published_professionals</code> a été
    réécrite quatre fois et la table <code>zones</code> a reçu <code>city_id</code> plus tard.
    Lire les migrations reconstitue une intention, pas l’état réel.</p>
  </section>`;
}

function architectureSection(counts) {
  return `<section class="chapter">
    <p class="eyebrow">Chapitre 2</p>
    <h2>Architecture en une page</h2>
    <p class="lede">Douze tables se répartissent en trois ensembles. Les deux planches qui
      suivent les détaillent.</p>

    <div class="card">
      <h3>Identité et offre</h3>
      <p class="meta">Qui existe, et ce qu’il propose.</p>
      <p><code>users</code> porte toutes les identités, tous rôles confondus. Un compte
      devient artisan en passant <code>role</code> à <code>professional</code>, ce qui crée une
      ligne dans <code>professionals</code>. La clé primaire de cette dernière étant
      <code>user_id</code>, un compte porte <strong>au plus un</strong> profil.</p>
    </div>

    <div class="card">
      <h3>Référentiels</h3>
      <p class="meta">Peu de données, beaucoup de contraintes.</p>
      <p><code>trades</code> et <code>trade_categories</code> décrivent les métiers,
      <code>cities</code> et <code>zones</code> la géographie. Ces tables ne se modifient pas
      par accident : toute suppression d’une ligne référencée est refusée par la base
      (voir chapitre 7).</p>
    </div>

    <div class="card">
      <h3>Retours et modération</h3>
      <p class="meta">Ce que les comptes se renvoient.</p>
      <p><code>reviews</code> note les artisans, <code>contacts</code> journalise les échanges,
      <code>account_reports</code> et <code>review_reports</code> portent les signalements. C’est
      l’ensemble le plus exploitable analytiquement, et le plus petit aujourd’hui.</p>
    </div>

    <h3>La règle de publication</h3>
    <p>Un profil n’est visible publiquement que s’il cumule <strong>neuf conditions</strong>, et
    cette logique vit dans la vue <code>published_professionals</code>, pas dans les tables :
    le profil n’est pas masqué, le compte est bien un artisan, il n’est ni bloqué ni suspendu,
    un nom affiché est renseigné, un métier est choisi, au moins une zone d’intervention est
    déclarée, un téléphone est présent, la description fait au moins 30 caractères, et au
    moins une photo a été ajoutée.</p>

    <div class="callout">
      <p><strong>Compter les artisans avec <code>SELECT count(*) FROM professionals</code> est
      faux.</strong> Il faut passer par la vue. L’écart se mesure sur les données actuelles :
      <code>professionals</code> compte 4 lignes, <code>published_professionals</code> n’en
      expose que <strong>3</strong>.</p>
    </div>
  </section>`;
}

function sheetSection(sheet, svg, index) {
  return `<section class="sheet">
    <p class="eyebrow">Planche ${index}</p>
    <h2>${escapeHtml(sheet.title)}</h2>
    ${svg}
    <div class="legend">
      <span><span class="badge pk">PK</span> clé primaire</span>
      <span><span class="badge fk">FK</span> clé étrangère</span>
      <span><span class="badge uk">UK</span> unicité</span>
      <span>Trait pointillé : lien à l’intérieur d’une même colonne</span>
    </div>
  </section>`;
}

function dictionarySection(entities) {
  const order = [
    'users', 'professionals', 'trades', 'trade_categories', 'cities', 'zones',
    'professional_zones', 'photos', 'reviews', 'contacts', 'account_reports', 'review_reports',
  ];

  return `<section class="chapter">
    <p class="eyebrow">Chapitre 5</p>
    <h2>Dictionnaire des données</h2>
    <p class="lede">Une entrée par table. La colonne « Rôle » dit ce que la table représente,
      la colonne « Clés » reprend les contraintes d’unicité et les clés étrangères.</p>
    ${order
      .map((name) => {
        const entity = entities.get(name.toUpperCase());
        const purpose = PURPOSE[name];
        if (!entity || !purpose) return '';
        const foreignKeys = [...new Set(entity.columns.filter((c) => c.fk).map((c) => c.name))];
        const uniques = [...new Set(entity.columns.filter((c) => c.uk).map((c) => c.name))];
        return `<div class="card">
          <h3 class="mono">${escapeHtml(name)}</h3>
          <p class="meta">${escapeHtml(purpose.title)} — ${escapeHtml(purpose.role)}</p>
          <p>${purpose.detail}</p>
          <table>
            <thead><tr>
              <th style="width:34%">Colonne</th><th style="width:22%">Type</th>
              <th style="width:8%">Clés</th><th>Grain</th>
            </tr></thead>
            <tbody>${entity.columns
              .map(
                (column) => `<tr>
                  <td class="name">${escapeHtml(column.name)}</td>
                  <td class="type">${escapeHtml(abbreviate(column.type))}</td>
                  <td>${[
                    column.pk ? '<span class="badge pk">PK</span>' : '',
                    column.fk ? '<span class="badge fk">FK</span>' : '',
                    column.uk ? '<span class="badge uk">UK</span>' : '',
                  ].filter(Boolean).join(' ') || '—'}</td>
                  <td>${escapeHtml(GRAIN[name] ?? '')}</td>
                </tr>`,
              )
              .join('')}</tbody>
          </table>
          <p class="meta">Clés étrangères : ${foreignKeys.length ? foreignKeys.map((f) => `<code>${escapeHtml(f)}</code>`).join(', ') : 'aucune'}${uniques.length ? ` · Unicité : ${uniques.map((u) => `<code>${escapeHtml(u)}</code>`).join(', ')}` : ''}</p>
        </div>`;
      })
      .join('')}
  </section>`;
}

function grainSection() {
  return `<section class="chapter">
    <p class="eyebrow">Chapitre 6</p>
    <h2>Grain</h2>
    <p class="lede">Une ligne de, et le grain exact. Sans cette phrase, un
      <code>count(*)</code> n’a pas de sens interprétable.</p>
    <table>
      <thead><tr><th style="width:32%">Table</th><th>Une ligne par…</th></tr></thead>
      <tbody>${Object.entries(GRAIN)
        .map(([name, grain]) => `<tr><td class="name mono">${escapeHtml(name)}</td><td>${escapeHtml(grain)}</td></tr>`)
        .join('')}</tbody>
    </table>
  </section>`;
}

function deletesSection() {
  return `<section class="chapter">
    <p class="eyebrow">Chapitre 7</p>
    <h2>Comportement des suppressions</h2>
    <p class="lede">Mesuré sur la base : chaque essai a été annulé par
      <code>ROLLBACK</code> avant d’être consigné ici.</p>
    <div class="callout">
      <p><strong>Toutes les clés étrangères sont non deferrable.</strong> Sur une telle clé,
      <code>NO ACTION</code> se comporte comme <code>RESTRICT</code> : la suppression est
      refusée, elle n’est pas différée. Le <code>ON DELETE</code> affiché dans le dictionnaire
      indique donc <code>aucune</code>, mais la réalité est un blocage.</p>
    </div>
    <table>
      <thead><tr>
        <th style="width:26%">Relation</th><th style="width:14%">Déclaré</th><th>Comportement vérifié</th>
      </tr></thead>
      <tbody>${DELETES.map(
        ([relation, declared, effect]) =>
          `<tr><td class="name mono">${escapeHtml(relation)}</td><td>${escapeHtml(declared)}</td><td>${escapeHtml(effect)}</td></tr>`,
      ).join('')}</tbody>
    </table>
    <h3>Ce que cela change pour une analyse</h3>
    <p><strong>Aucun avis ne peut devenir orphelin.</strong> Le blocage de clé étrangère
    empêche la suppression d’un artisan ayant des avis avant qu’elle ne rompe la référence :
    la jointure <code>reviews → professionals → users</code> ne perd donc aucune ligne par
    suppression de compte.</p>
    <p><strong>Mais le <code>CASCADE</code> est neutralisé par ce même blocage.</strong>
    Supprimer un compte cascade vers <code>professionals</code>, qui bute sur
    <code>reviews</code> : l’opération échoue. Pour retirer un compte, il faut d’abord
    supprimer ses avis, ses photos et ses zones.</p>
  </section>`;
}

function invariantsSection() {
  return `<section class="chapter">
    <p class="eyebrow">Chapitre 8</p>
    <h2>Invariants</h2>
    <p class="lede">Une règle écrite dans la base vaut pour tous les écrivains : script,
      migration, console d’administration, ou le code qu’on a oublié. Les règles qui
      n’existent que dans l’application sont signalées comme telles.</p>
    <table>
      <thead><tr>
        <th style="width:44%">Invariant</th><th style="width:16%">Où</th><th>Détail</th>
      </tr></thead>
      <tbody>${INVARIANTS.map(
        ([rule, where, detail]) =>
          `<tr><td>${escapeHtml(rule)}</td><td><strong>${escapeHtml(where)}</strong></td><td class="type">${escapeHtml(detail)}</td></tr>`,
      ).join('')}</tbody>
    </table>
  </section>`;
}

function limitsSection() {
  return `<section class="chapter">
    <p class="eyebrow">Chapitre 9</p>
    <h2>Limites pour l’analyse</h2>
    <p class="lede">Trois manques structurels, à connaître avant de construire un indicateur.</p>
    ${LIMITS.map(
      ([title, detail]) => `<div class="card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(detail)}</p></div>`,
    ).join('')}
  </section>`;
}

function queriesSection() {
  return `<section class="chapter">
    <p class="eyebrow">Chapitre 10</p>
    <h2>Requêtes de référence</h2>
    <p class="lede">Ces requêtes ont été exécutées sur la base avant d’être publiées.</p>
    ${QUERIES.map(
      ([title, sql]) => `<h3>${escapeHtml(title)}</h3><pre><code>${escapeHtml(sql)}</code></pre>`,
    ).join('')}
  </section>`;
}

function appendixSection(migrations) {
  return `<section class="chapter">
    <p class="eyebrow">Annexe</p>
    <h2>Méthode de génération</h2>
    <p class="lede">Ce document ne s’écrit pas à la main.</p>
    <table>
      <thead><tr><th style="width:38%">Élément</th><th>Source</th></tr></thead>
      <tbody>
        <tr><td>Tables, colonnes, types, défauts</td><td class="type mono">information_schema, pg_attribute</td></tr>
        <tr><td>Clés primaires, unicité, clés étrangères</td><td class="type mono">pg_constraint</td></tr>
        <tr><td>Index</td><td class="type mono">pg_indexes</td></tr>
        <tr><td>Comportement des suppressions</td><td class="type mono">essais annulés par ROLLBACK</td></tr>
        <tr><td>Planches</td><td class="type mono">SVG déterministe, sans dépendance de rendu</td></tr>
        <tr><td>Contenu éditorial</td><td class="type mono">scripts/dictionary-content.mjs</td></tr>
      </tbody>
    </table>
    <h3>Évolutivité du schéma</h3>
    <p>${migrations} migrations appliquées au moment de l’extraction. Le schéma évolue par
    migration SQL versionnée dans <code>server/db/migrations</code>, jamais par une
    modification directe en base. Pour régénérer : <code>npm run docs:pdf</code>.</p>
  </section>`;
}

function findChrome() {
  const found = CHROME_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  if (!found) throw new Error('Aucun moteur Chromium trouvé pour produire le PDF');
  return found;
}

async function migrationCount(pool) {
  const { rows } = await pool.query('SELECT count(*)::int AS n FROM pgmigrations');
  return rows[0].n;
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 20_000 });
const entities = await loadEntities(pool);
const counts = await migrationCount(pool);
const volumes = new Map();
for (const [name, entity] of entities) {
  const { rows } = await pool.query(`SELECT count(*)::bigint AS n FROM "${name.toLowerCase()}"`);
  volumes.set(name, Number(rows[0].n));
}
await pool.end();

if (!entities.size) throw new Error('Aucune entité extraite : vérifiez DATABASE_URL');

const sheets = renderErDiagrams(entities);
for (const { sheet, svg } of sheets)
  fs.writeFileSync(path.join(OUT_DIR, `er-diagram-${sheet.id}.svg`), svg, 'utf8');

const volumeRows = [...volumes.entries()]
  .map(([name, n]) => `<tr><td class="name mono">${escapeHtml(name.toLowerCase())}</td><td class="num">${n}</td></tr>`)
  .join('');

const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8" />
<title>KOP — Schéma et dictionnaire des données</title>
<style>${CSS}</style></head>
<body>
${coverPage(figures)}
${tocPage()}
${scopeSection()}
<div>
  <p class="eyebrow" style="margin-top:6mm">Volumes relevés</p>
  <h3>Ce que contient la base aujourd’hui</h3>
  <p class="lede">Relevé au moment de l’extraction, tables techniques exclues.</p>
  <table><thead><tr><th>Table</th><th style="width:18%">Lignes</th></tr></thead>
  <tbody>${volumeRows}</tbody></table>
</div>
${architectureSection(volumes)}
${sheets.map(({ sheet, svg }, index) => sheetSection(sheet, svg, index + 1)).join('\n')}
${dictionarySection(entities)}
${grainSection()}
${deletesSection()}
${invariantsSection()}
${limitsSection()}
${queriesSection()}
${appendixSection(counts)}
<div class="fixed-foot"><span>KOP — Schéma et dictionnaire des données</span><span>${escapeHtml(TODAY)}</span></div>
</body></html>`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(HTML_PATH, html, 'utf8');

const chrome = findChrome();
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'kop-pdf-'));
const url = `file:///${HTML_PATH.replace(/\\/g, '/')}`;

execFileSync(
  chrome,
  ['--headless', '--disable-gpu', '--no-sandbox', '--no-pdf-header-footer', `--user-data-dir=${profile}`, `--print-to-pdf=${PDF_PATH}`, url],
  { stdio: 'ignore' },
);

fs.rmSync(profile, { recursive: true, force: true });

const bytes = fs.statSync(PDF_PATH).size;
const raw = fs.readFileSync(PDF_PATH).toString('latin1');
const pages = (raw.match(/\/Type\s*\/Page[^s]/g) || []).length;
const media = [...new Set((raw.match(/\/MediaBox\s*\[[^\]]*\]/g) || []).map((m) => m.replace(/\s+/g, ' ')))];

console.log(`${path.relative('.', PDF_PATH)} — ${(bytes / 1024).toFixed(0)} Ko, ${pages} pages`);
console.log(`formats : ${media.join(' | ')}`);
console.log(`${path.relative('.', HTML_PATH)} — source reproductible`);
