import fs from 'node:fs';
import path from 'node:path';

const roots = ['src', 'server', 'tests'];
const exts = new Set(['.js', '.jsx', '.sql', '.css', '.json', '.mjs']);
const skip = new Set(['node_modules', 'dist', '.git']);

const bad = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (exts.has(path.extname(entry.name))) check(full);
  }
};

function check(file) {
  const text = fs.readFileSync(file, 'utf8');
  text.split(/\r?\n/).forEach((line, i) => {
    // Caractere de remplacement U+FFFD : un fichier qui a été réécrit avec un
    // mauvais encodage. Indétectable a l'oeil sur une ligne entiere.
    if (line.includes('\uFFFD')) bad.push(`${file}:${i + 1}  ${line.trim().slice(0, 90)}`);
    // Caracteres de controle inattendus (tout sauf la tabulation).
    if (/[\u0000-\u0008\u000B-\u001F]/.test(line)) bad.push(`${file}:${i + 1}  [controle] ${line.trim().slice(0, 90)}`);
  });
}

for (const root of roots) walk(root);

if (bad.length === 0) console.log('Aucun caractere casse trouve.');
else bad.forEach((b) => console.log(b));
console.log(`\n${bad.length} probleme(s).`);