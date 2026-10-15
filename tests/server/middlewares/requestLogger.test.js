import { describe, it, expect, vi, afterEach } from "vitest";
import { EventEmitter } from "node:events";
import {
  colorsEnabled,
  formatRequestLine,
  requestLogger,
  statusTone,
} from "@server/middlewares/requestLogger.js";

const ESC = "\u001b";
const originalTty = process.stdout.isTTY;

/** Retire les codes ANSI pour comparer le texte brut. */
// eslint-disable-next-line no-control-regex
const stripAnsi = (line) => line.replace(/\u001b\[\d+m/g, "");

/** `isTTY` est une propriété, pas un getter : on la remplace directement. */
function setTty(value) {
  process.stdout.isTTY = value;
}

/** Neutralise la console le temps du rappel, puis rend ce qui y a été écrit. */
function capture(fn) {
  const written = { log: [], warn: [], error: [] };
  const spies = Object.entries(written).map(([level]) =>
    vi
      .spyOn(console, level)
      .mockImplementation((line) => written[level].push(line)),
  );
  try {
    fn();
  } finally {
    spies.forEach((s) => s.mockRestore());
  }
  return written;
}

/** Fait traverser la requête, déclenche la clôture, rend ce qui a été écrit. */
function log({ method = "GET", url = "/api/professionals", status = 200 }) {
  return capture(() => {
    const res = new EventEmitter();
    res.statusCode = status;
    requestLogger({ method, originalUrl: url }, res, vi.fn());
    res.emit("finish");
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.NO_COLOR;
  process.stdout.isTTY = originalTty;
});

describe("statusTone", () => {
  it("classe chaque plage de statut", () => {
    expect(statusTone(200)).toBe("ok");
    expect(statusTone(302)).toBe("redirect");
    expect(statusTone(401)).toBe("clientError");
    expect(statusTone(500)).toBe("serverError");
  });
});

describe("formatRequestLine", () => {
  const req = { method: "POST", path: "/api/auth/login" };

  it("compose méthode, chemin, statut et durée", () => {
    expect(formatRequestLine(req, 201, 12.34)).toBe(
      "[POST] /api/auth/login 201 12.3ms",
    );
  });

  it("n'écrit aucun code ANSI quand la couleur est désactivée", () => {
    expect(formatRequestLine(req, 500, 1, false)).not.toContain(ESC);
  });

  it("colorie le statut quand la couleur est activée", () => {
    const line = formatRequestLine(req, 500, 1, true);
    expect(line).toContain("\u001b[31m");
    expect(stripAnsi(line)).toBe(formatRequestLine(req, 500, 1, false));
  });

  it("choisit la couleur du statut, pas celle de la ligne entière", () => {
    expect(formatRequestLine(req, 200, 1, true)).toContain("\u001b[32m");
    expect(formatRequestLine(req, 302, 1, true)).toContain("\u001b[36m");
    expect(formatRequestLine(req, 401, 1, true)).toContain("\u001b[33m");
  });

  it("colore le verbe comme le statut", () => {
    expect(
      formatRequestLine({ method: "GET", path: "/x" }, 401, 1, true),
    ).toContain("\u001b[33m[GET]");
    expect(
      formatRequestLine({ method: "POST", path: "/x" }, 500, 1, true),
    ).toContain("\u001b[31m[POST]");
  });

  it("laisse le chemin et la durée dans la couleur neutre", () => {
    const line = formatRequestLine(req, 500, 1, true);
    expect(line).toContain("\u001b[2m /api/auth/login \u001b[0m");
    expect(line).toContain("\u001b[2m 1.0ms");
  });

  it("colore le statut comme le verbe", () => {
    expect(formatRequestLine(req, 401, 1, true)).toContain("\u001b[33m401");
  });
});

describe("colorsEnabled", () => {
  it("refuse la couleur hors terminal", () => {
    setTty(false);
    expect(colorsEnabled()).toBe(false);
  });

  it("respecte NO_COLOR", () => {
    setTty(true);
    process.env.NO_COLOR = "1";
    expect(colorsEnabled()).toBe(false);
  });

  it("accepte la couleur sur un terminal classique", () => {
    setTty(true);
    expect(colorsEnabled()).toBe(true);
  });
});

describe("requestLogger", () => {
  it("relaye la requête", () => {
    const next = vi.fn();
    requestLogger(
      { method: "GET", originalUrl: "/api/professionals" },
      new EventEmitter(),
      next,
    );
    expect(next).toHaveBeenCalled();
  });

  it("écrit le chemin complet, préfixe /api compris", () => {
    expect(
      log({ method: "POST", url: "/api/auth/login", status: 401 }).warn[0],
    ).toContain("[POST] /api/auth/login 401");
  });

  it("journalise une erreur serveur sur la sortie d'erreur", () => {
    const written = log({ url: "/api/admin/stats", status: 500 });
    expect(written.error).toHaveLength(1);
    expect(written.error[0]).toContain("/api/admin/stats 500");
  });

  it("journalise un refus client sur la sortie d'avertissement", () => {
    expect(log({ url: "/api/admin/stats", status: 401 }).warn[0]).toContain(
      "/api/admin/stats 401",
    );
  });

  /**
   * La requête peut porter un numéro de téléphone ou une recherche : elle ne
   * doit pas se retrouver dans les journaux du serveur.
   */
  it("ne journalise jamais la chaîne de requête", () => {
    const line = log({
      url: "/api/contacts?phone=%2B242061234567&q=motdepasse",
      status: 500,
    }).error[0];
    expect(line).toContain("/api/contacts");
    expect(line).not.toContain("phone");
    expect(line).not.toContain("24206");
    expect(line).not.toContain("motdepasse");
  });

  it("ignore la sonde de santé, interrogée en boucle", () => {
    expect(log({ url: "/api/health", status: 503 }).error).toHaveLength(0);
  });
});
