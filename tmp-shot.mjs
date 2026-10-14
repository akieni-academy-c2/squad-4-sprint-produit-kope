import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SRC = path.resolve('docs/data-science/KOP_dictionnaire_des_donnees.html');
const TMP = 'D:/.caches/WindowsTemp/opencode';
const html = fs.readFileSync(SRC, 'utf8');

/** N'affiche qu'un fragment, pour inspecter une maquette à la fois. */
function isolate(selector, keep, width, height) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8" />
<style>
  body { background: #fff; }
  body > *:not(.${keep}) { display: none !important; }
  .${keep} { position: static !important; }
  ${selector ? `.${keep} > ${selector} { display: none !important; }` : ''}
  @page { size: ${width === 1123 ? 'A4 landscape' : 'A4'}; margin: ${width === 1123 ? '12mm' : '18mm 16mm 16mm'}; }
</style></head><body>${html.replace(/<body>/, '<body>').replace(/<div class="fixed-foot">[\s\S]*?<\/div>\s*<\/body>/, '</body>')}</body></html>`;
}

const shots = [
  ['cover', 'cover', '', 794, 1123],
  ['sheet', 'sheet', '', 1123, 794],
  ['chapter', 'chapter', '', 794, 1123],
];

for (const [name, keep, selector, w, h] of shots) {
  const file = path.join(TMP, `preview-${name}.html`);
  fs.writeFileSync(file, isolate(selector, keep, w, h), 'utf8');
  const png = path.join(TMP, `preview-${name}.png`);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'kop-shot-'));
  execFileSync(
    CHROME,
    ['--headless=new', '--disable-gpu', '--no-sandbox', `--user-data-dir=${profile}`,
     `--window-size=${w},${h}`, `--screenshot=${png}`,
     `file:///${file.replace(/\\/g, '/')}`],
    { stdio: 'ignore' },
  );
  fs.rmSync(profile, { recursive: true, force: true });
  const size = fs.statSync(png).size;
  console.log(`${name}: ${(size / 1024).toFixed(0)} Ko`);
}
