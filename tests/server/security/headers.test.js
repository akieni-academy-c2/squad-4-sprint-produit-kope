import { sign } from "cookie-signature";
import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";

const openSessions = {
  "session-admin": { id: 1, role: "admin" },
  "session-client": { id: 5, role: "client" },
};

function fakePool() {
  return {
    on() {},
    async connect() {
      return { query: fakePool().query, release() {} };
    },
    async query(sql, params = []) {
      if (/FROM\s+"?session"?/i.test(sql) && /\bsid\b/i.test(sql)) {
        const user = openSessions[params[0]];
        if (!user) return { rows: [], rowCount: 0 };
        return {
          rows: [{ sess: JSON.stringify({ user, cookie: {} }) }],
          rowCount: 1,
        };
      }
      return { rows: [], rowCount: 0 };
    },
  };
}

vi.mock("@server/db/pool.js", () => {
  const pool = fakePool();
  return {
    pool,
    withTransaction: async (fn) => fn({ query: pool.query }),
    isDatabaseReachable: async () => true,
  };
});

const { default: app } = await import("@server/app.js");
const { env } = await import("@server/config/env.js");

let server;
let baseUrl;

beforeAll(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

const asBrowser = (extra = {}) => ({
  "Sec-Fetch-Site": "same-origin",
  Origin: baseUrl,
  ...extra,
});
const sessionCookie = (sid) => `sid=s:${sign(sid, env.SESSION_SECRET)}`;

const post = (path, headers = {}) =>
  fetch(`${baseUrl}${path}`, { method: "POST", headers, body: "{}" });

describe("en-têtes de sécurité de l’API", () => {
  it("pose nosniff et refuse le cadrage", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("x-frame-options")).toBe("DENY");
  });

  it("l'API n'est pas signable par le serveur", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.headers.get("x-powered-by")).toBeNull();
  });

  it("ne laisse pas le JSON d’API être mis en cache", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });
});

describe("protection CSRF par origine", () => {
  it("laisse passer une requête mutante venue du même site", async () => {
    const res = await post(
      "/api/auth/login",
      asBrowser({ "Content-Type": "application/json" }),
    );
    expect(res.status).not.toBe(403);
  });

  it("refuse une requête intersite, même accompagnée d’une session valide", async () => {
    const res = await post("/api/auth/login", {
      Cookie: sessionCookie("session-admin"),
      Origin: "https://attaquant.example",
      "Sec-Fetch-Site": "cross-site",
      "Content-Type": "application/json",
    });
    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toMatchObject({ reason: "cross-site" });
  });

  it("refuse une requête qui ne déclare ni origine ni contexte de récupération", async () => {
    const res = await post("/api/auth/login", {
      "Content-Type": "application/json",
    });
    expect(res.status).toBe(403);
  });

  it("refuse une origine tierce même sans en-tête Sec-Fetch-Site", async () => {
    const res = await post("/api/auth/login", {
      Origin: "https://attaquant.example",
      "Content-Type": "application/json",
    });
    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toMatchObject({
      reason: "origine-inconnue",
    });
  });

  it("ne gêne pas la lecture", async () => {
    const res = await fetch(`${baseUrl}/api/professionals`, {
      headers: asBrowser(),
    });
    expect(res.status).not.toBe(403);
  });
});
