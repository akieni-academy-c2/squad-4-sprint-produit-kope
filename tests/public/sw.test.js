import fs from "node:fs";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";
import { repoPath } from "../support/repoRoot.js";

function loadTombstone({
  cacheKeys = ["kope-v1-shell", "kope-v1-assets"],
  keysImpl,
} = {}) {
  const source = fs.readFileSync(repoPath("public/sw.js"), "utf8");
  const listeners = {};
  const unregister = vi.fn().mockResolvedValue(true);
  const sandbox = {
    self: {
      addEventListener: (type, handler) => {
        listeners[type] = handler;
      },
      skipWaiting: vi.fn().mockResolvedValue(undefined),
      clients: { claim: vi.fn().mockResolvedValue(undefined) },
      registration: { unregister },
      location: new URL("https://kop.example/"),
    },
    caches: {
      keys: keysImpl ?? vi.fn().mockResolvedValue(cacheKeys),
      delete: vi.fn().mockResolvedValue(true),
    },
    Promise,
    URL,
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
  return { listeners, sandbox, unregister };
}

function dispatch(listeners, type) {
  const event = { waitUntil: vi.fn((promise) => promise) };
  listeners[type](event);
  return event;
}

describe("tombstone du service worker", () => {
  it("n'intercepte aucune requete", () => {
    const { listeners } = loadTombstone();

    expect(listeners.fetch).toBeUndefined();
  });

  it("passe l'etat waiting a l'activation sans precacher", async () => {
    const { listeners, sandbox } = loadTombstone();
    const event = dispatch(listeners, "install");

    await event.waitUntil.mock.calls[0][0];

    expect(sandbox.self.skipWaiting).toHaveBeenCalled();
    expect(sandbox.caches.keys).not.toHaveBeenCalled();
  });

  it("vide les caches du worker remplace puis se desenregistre", async () => {
    const { listeners, sandbox, unregister } = loadTombstone();
    const event = dispatch(listeners, "activate");

    await event.waitUntil.mock.calls[0][0];

    expect(sandbox.caches.delete).toHaveBeenCalledWith("kope-v1-shell");
    expect(sandbox.caches.delete).toHaveBeenCalledWith("kope-v1-assets");
    expect(sandbox.self.clients.claim).toHaveBeenCalled();
    expect(unregister).toHaveBeenCalled();
  });

  it("se desenregistre meme quand la purge des caches echoue", async () => {
    const keysImpl = vi.fn().mockRejectedValue(new Error("cache inaccessible"));
    const { listeners, unregister } = loadTombstone({ keysImpl });
    const event = dispatch(listeners, "activate");

    await event.waitUntil.mock.calls[0][0];

    expect(unregister).toHaveBeenCalled();
  });
});
