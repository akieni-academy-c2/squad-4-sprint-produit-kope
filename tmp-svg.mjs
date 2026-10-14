import process from 'node:process';
import fs from 'node:fs';
import pg from 'pg';
import sharp from 'sharp';
import { renderErDiagrams, loadEntities } from './scripts/er-diagram.mjs';

process.loadEnvFile();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 20_000 });
const entities = await loadEntities(pool);
await pool.end();

const sheets = renderErDiagrams(entities);
console.log('entites:', entities.size, '| colonnes:', [...entities.values()].reduce((n, e) => n + e.columns.length, 0));

for (const [index, { sheet, svg }] of sheets.entries()) {
  fs.writeFileSync(`docs/data-science/er-diagram-${sheet.id}.svg`, svg, 'utf8');
  const meta = await sharp(Buffer.from(svg)).metadata();
  console.log(`${sheet.id} : ${meta.width}x${meta.height}  (${(svg.length / 1024).toFixed(0)} Ko)`);
  await sharp(Buffer.from(svg), { density: 100 })
    .flatten({ background: '#ffffff' })
    .png()
    .toFile(`D:/.caches/WindowsTemp/opencode/er-${sheet.id}.png`);
}
