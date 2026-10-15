import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { repoPath } from "../support/repoRoot.js";

const ROOTS = ["src", "server", "public", "scripts", "tests", "api"];
const ROOT_FILES = ["vite.config.js", "eslint.config.js", "vitest.config.js"];
const EXTENSIONS = new Set([".js", ".jsx", ".mjs", ".css"]);
const SKIP = new Set(["node_modules", "dist", ".git"]);

function walk(dir, visit) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, visit);
    else if (EXTENSIONS.has(path.extname(entry.name))) visit(full);
  }
}

const files = [];
for (const root of ROOTS)
  if (fs.existsSync(repoPath(root))) walk(repoPath(root), (f) => files.push(f));
for (const name of ROOT_FILES)
  if (fs.existsSync(repoPath(name))) files.push(repoPath(name));

const isCommentStart = (line) =>
  /^\s*(\/\/|\/\*|\*\/|\{\/\*)/.test(line) && !/eslint-disable/.test(line);

const isCssComment = (line) => /\/\*/.test(line) && !/\*\//.test(line);

const MAX_JSDOC_LINES = 12;

function commentOffenders(file) {
  const isCss = path.extname(file) === ".css";
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const offenders = [];
  let inJsdoc = false;
  let jsdocLength = 0;

  lines.forEach((line, i) => {
    const loc = `${path.relative(repoPath(), file)}:${i + 1}`;

    if (inJsdoc) {
      jsdocLength += 1;
      if (line.includes("*/")) inJsdoc = false;
      if (jsdocLength > MAX_JSDOC_LINES) offenders.push(loc);
      return;
    }

    if (isCss) {
      if (isCssComment(line)) offenders.push(loc);
      return;
    }

    if (/^\s*\/\*\*/.test(line)) {
      inJsdoc = true;
      jsdocLength = 1;
      if (line.includes("*/")) inJsdoc = false;
      return;
    }

    if (isCommentStart(line)) offenders.push(loc);
  });

  return offenders;
}

describe("commentaires limités au jsdoc", () => {
  it.each(files)("%s", (file) => {
    expect(commentOffenders(file)).toEqual([]);
  });
});

describe("encodage des sources", () => {
  const FORBIDDEN = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
    24, 25, 26, 27, 28, 29, 30, 31,
  ];

  it.each(files)("%s", (file) => {
    const rel = path.relative(repoPath(), file);
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

    const replacement = lines.flatMap((line, i) =>
      line.includes("\uFFFD") ? [`${rel}:${i + 1}`] : [],
    );
    expect(replacement).toEqual([]);

    const controls = lines.flatMap((line, i) =>
      [...line].some((c) => FORBIDDEN.includes(c.codePointAt(0)))
        ? [`${rel}:${i + 1}`]
        : [],
    );
    expect(controls).toEqual([]);
  });
});
