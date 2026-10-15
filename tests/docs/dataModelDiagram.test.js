import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { repoPath } from "@test/support/repoRoot.js";

/**
 * La vue published_professionals est redefinee par plusieurs migrations successives.
 * Seule la derniere compte : citer une version perimee resterait du SQL valide,
 * donc passerait tous les controles, tout en decrivant une regle qui n'est plus
 * appliquee. Ce test compare le SQL cite au SQL de la derniere migration qui
 * redefinit la vue.
 */
const VIEW =
  /CREATE\s+(?:OR\s+REPLACE\s+)?VIEW\s+published_professionals\s+AS[\s\S]*?;/i;

function currentViewSql() {
  const dir = repoPath("server/db/migrations");
  const latest = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .filter((f) => VIEW.test(readFileSync(join(dir, f), "utf8")))
    .at(-1);
  return readFileSync(join(dir, latest), "utf8").match(VIEW)[0];
}

/** Le SQL cite est relu dans le bloc ```sql, jamais dans la prose. */
function citedViewSql() {
  const block = doc.match(/```sql\n([\s\S]*?)```/);
  return block?.[1] ?? "";
}

const doc = readFileSync(
  repoPath("docs/data-science/schema-diagram.md"),
  "utf8",
);
const block = doc.match(/```mermaid\n([\s\S]*?)```/);

const OPEN = /^([A-Z][A-Z0-9_]*)\s*\{$/;
const CLOSE = /^\}$/;
const RELATION =
  /^([A-Z][A-Z0-9_]*)\s+(?:\|o|\|\||o\||\|)\s*--\s*[o|][o{|]*\s+([A-Z][A-Z0-9_]*)\s*:\s*"[^"]*"$/;
const ATTRIBUTE =
  /^[a-z][a-z0-9_]*(?:[ ]+[a-z][a-z0-9_]*)?[ ]+[a-z_][a-z0-9_]*[ ]*(?:(?:PK|FK|UK)(?:[ ]*,[ ]*(?:PK|FK|UK))*[ ]*)?(?:"[^"]*")?[ ]*$/;

function parse() {
  const declared = new Set();
  const drawn = new Set();
  const relations = [];
  const errors = [];
  let inBlock = false;
  let attributes = 0;

  (block?.[1] ?? "").split("\n").forEach((raw, i) => {
    const line = raw.trim();
    const n = i + 1;
    if (!line || line === "erDiagram") return;

    if (CLOSE.test(line)) {
      if (!inBlock) errors.push(`ligne ${n} : accolade fermante sans bloc`);
      inBlock = false;
      return;
    }

    if (inBlock) {
      if (ATTRIBUTE.test(line)) attributes += 1;
      else errors.push(`ligne ${n} : attribut invalide - ${line}`);
      return;
    }

    const open = line.match(OPEN);
    if (open) {
      declared.add(open[1]);
      drawn.add(open[1]);
      inBlock = true;
      return;
    }

    const relation = line.match(RELATION);
    if (relation) {
      declared.add(relation[1]);
      declared.add(relation[2]);
      relations.push(relation);
      return;
    }

    if (/^[A-Z][A-Z0-9_]*$/.test(line)) {
      declared.add(line);
      return;
    }

    errors.push(`ligne ${n} : ligne non reconnue - ${line}`);
  });

  if (inBlock) errors.push("bloc d'attributs jamais refermé");
  for (const [, left, right] of relations)
    if (!drawn.has(left) || !drawn.has(right))
      errors.push(`relation vers une entité non dessinée : ${left} / ${right}`);
  for (const name of declared)
    if (!drawn.has(name)) errors.push(`entité sans bloc d'attributs : ${name}`);

  return { drawn, relations, errors, attributes };
}

const { drawn, relations, errors, attributes } = parse();

describe("Diagramme relationnel", () => {
  it("contient un bloc Mermaid", () => {
    expect(
      block,
      "docs/data-science/schema-diagram.md sans bloc mermaid",
    ).not.toBeNull();
  });

  it("est syntaxiquement valide, sinon le lecteur voit une erreur au rendu", () => {
    expect(errors).toEqual([]);
  });

  it("couvre toutes les tables métier de la base", () => {
    const schema = readFileSync(
      repoPath("docs/data-science/schema.md"),
      "utf8",
    );
    /**
     * La section des vues suit celle des tables. Une vue n'est pas une table,
     * et elle n'a pas sa place dans un diagramme de classes.
     */
    const section =
      schema.split("## Tables métier")[1]?.split(/\n## /)[0] ?? "";
    const tables = [...section.matchAll(/^### `([a-z_]+)`/gm)].map((m) => m[1]);

    expect(tables.length).toBeGreaterThan(0);
    expect([...drawn].sort()).toEqual(
      tables.map((t) => t.toUpperCase()).sort(),
    );
  });

  it("donne un attribut à chaque entité", () => {
    expect(attributes).toBeGreaterThanOrEqual(drawn.size);
  });

  it("exprime les cardinalités plutôt que des liens sans multiplicité", () => {
    expect(relations.length).toBeGreaterThanOrEqual(drawn.size);
  });

  it("propose une version texte couvrant les mêmes entités", () => {
    const text = doc.split("## Version texte")[1] ?? "";

    expect(text).toContain("```text");
    for (const entity of drawn) expect(text, entity).toContain(entity);
  });

  it("décrit autant de relations en texte que dans le diagramme", () => {
    const text = doc.split("## Version texte")[1] ?? "";
    const rows = text
      .split("\n")
      .filter((line) => /^ {2}[A-Z_]+\s+\d+(?:\.\.\d+)?\s*[→←]/.test(line));

    expect(rows).toHaveLength(relations.length);
    for (const row of rows) expect(row, row).toMatch(/[a-z_]+\.[a-z_]+/);
  });

  it("cite la definition courante de published_professionals", () => {
    expect(citedViewSql(), "le document ne cite pas la vue").toContain(
      "published_professionals",
    );
    const expected = currentViewSql();
    expect(
      citedViewSql().replace(/\s+/g, " ").trim(),
      "le SQL cite n'est plus celui de la derniere migration",
    ).toBe(expected.replace(/\s+/g, " ").trim());
  });
});
