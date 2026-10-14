import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';


const MARKER = ['server/app.js', 'src/main.jsx'];

function findRepoRoot(from) {
  let dir = from;
  for (;;) {
    if (MARKER.every((rel) => existsSync(join(dir, rel)))) return dir;
    const up = dirname(dir);
    if (up === dir) return from;
    dir = up;
  }
}

export const REPO_ROOT = findRepoRoot(dirname(fileURLToPath(import.meta.url)));


export const repoPath = (...parts) => resolve(REPO_ROOT, ...parts);
