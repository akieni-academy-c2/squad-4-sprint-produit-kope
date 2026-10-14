import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { repoPath } from '../support/repoRoot.js';

const ROOTS = ['src', 'server', 'public'];
const EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.css']);
const SKIP = new Set(['node_modules', 'dist', '.git']);

function walk(dir, visit) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, visit);
    else if (EXTENSIONS.has(path.extname(entry.name))) visit(full);
  }
}

const files = [];
for (const root of ROOTS) if (fs.existsSync(repoPath(root))) walk(repoPath(root), (f) => files.push(f));

const isCommentStart = (line) =>
  /^\s*(\/\/|\/\*|\*\/|\{\/\*)/.test(line) && !/eslint-disable/.test(line);

const isCssComment = (line) => /\/\*/.test(line) && !/\*\//.test(line);

describe('depôt sans commentaires', () => {
  it.each(files)('%s', (file) => {
    const offenders = fs
      .readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .map((line, i) => ({ i: i + 1, line }))
      .filter((l) => (path.extname(file) === '.css' ? isCssComment(l.line) : isCommentStart(l.line)))
      .map((l) => `${path.relative(repoPath(), file)}:${l.i}`);

    expect(offenders).toEqual([]);
  });
});

describe('encodage des sources', () => {
  const FORBIDDEN = [0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];

  it.each(files)('%s', (file) => {
    const rel = path.relative(repoPath(), file);
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

    const replacement = lines.flatMap((line, i) => (line.includes('\uFFFD') ? [`${rel}:${i + 1}`] : []));
    expect(replacement).toEqual([]);

    const controls = lines.flatMap((line, i) =>
      [...line].some((c) => FORBIDDEN.includes(c.codePointAt(0))) ? [`${rel}:${i + 1}`] : [],
    );
    expect(controls).toEqual([]);
  });
});