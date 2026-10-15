import { describe, expect, it } from "vitest";
import {
  createSerialQueue,
  destinationIndex,
  displayEntries,
  groupItems,
  tintFor,
  usedBy,
} from "@/features/admin/components/catalog/catalogUtils.js";

const cards = (ids) =>
  ids.map((id) => ({ id, name: `Item ${id}`, categoryId: 1 }));
const states = (entries) => entries.map((e) => `${e.item.id}:${e.state}`);
const keys = (entries) => entries.map((e) => e.entryKey);

describe("utilitaires du catalogue admin", () => {
  it("regroupe les éléments, groupe vide inclus", () => {
    const groups = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const items = [
      { id: 10, categoryId: 1 },
      { id: 11, categoryId: 3 },
    ];
    const map = groupItems(items, groups, "categoryId");

    expect(map.get(1)).toEqual([{ id: 10, categoryId: 1 }]);
    expect(map.get(2)).toEqual([]);
    expect(map.get(3)).toEqual([{ id: 11, categoryId: 3 }]);
  });

  it("attribue une teinte stable selon le nom du groupe", () => {
    expect(tintFor("Bâtiment")).toEqual(tintFor("Bâtiment"));
    expect(tintFor("Bâtiment")).not.toEqual(tintFor("Électricité"));
  });

  it("formate le compte d'utilisation", () => {
    expect(usedBy(1)).toBe("Utilisé par 1 pro");
    expect(usedBy(3)).toBe("Utilisé par 3 pros");
  });

  describe("aperçu du déplacement", () => {
    it("liste normalement quand rien n'est déplacé", () => {
      const entries = displayEntries(cards([1, 2]), null, null, 1);
      expect(states(entries)).toEqual(["1:normal", "2:normal"]);
    });

    it("marque la source comme « dragging » dans son groupe", () => {
      const entries = displayEntries(
        cards([1, 2, 3]),
        { id: 2 },
        { key: 1, index: 3 },
        1,
      );
      expect(entries.find((e) => e.item.id === 2).state).toBe("dragging");
    });

    it("marque la source comme « gap » quand la preview est dans un autre groupe", () => {
      const entries = displayEntries(
        cards([1, 2]),
        { id: 2 },
        { key: 7, index: 0 },
        1,
      );
      expect(entries.find((e) => e.item.id === 2).state).toBe("gap");
    });

    it("insère un clone « preview » à la position d'arrivée", () => {
      const entries = displayEntries(
        cards([1, 2, 3]),
        { id: 3 },
        { key: 1, index: 0 },
        1,
      );
      expect(states(entries)).toEqual([
        "3:preview",
        "1:normal",
        "2:normal",
        "3:dragging",
      ]);
      expect(keys(entries)).toEqual(["preview-3", 1, 2, 3]);
    });

    it("n'insère rien si la preview concerne un autre groupe", () => {
      const entries = displayEntries(
        cards([1, 2]),
        { id: 2 },
        { key: 9, index: 0 },
        1,
      );
      expect(entries.some((e) => e.state === "preview")).toBe(false);
    });

    it("ne déborde jamais hors des limites", () => {
      const entries = displayEntries(
        cards([1]),
        { id: 1 },
        { key: 1, index: 99 },
        1,
      );
      expect(entries.length).toBe(2);
      expect(entries[0].state).toBe("preview");
    });
  });

  describe("conversion d'index", () => {
    it("laisse l'index intact quand l'élément déplacé n'est pas dans la liste", () => {
      expect(destinationIndex(cards([1, 2]), 0, { id: 9 })).toBe(0);
    });

    it("décale les index situés après le trou", () => {
      expect(destinationIndex(cards([1, 2, 3]), 2, { id: 1 })).toBe(1);
      expect(destinationIndex(cards([1, 2, 3]), 1, { id: 1 })).toBe(0);
    });
  });

  /**
   * Sans file, deux glisser-déposer coup sur coup partent en parallèle : la base
   * tranche sur l'ordre d'arrivée des réponses et le dernier à répondre écrase
   * le dernier geste de l'administrateur.
   */
  describe("file sérialisée", () => {
    it("n'envoie la tâche suivante qu'une fois la précédente réglée", async () => {
      const run = createSerialQueue();
      const trace = [];
      let release;
      let second;

      run(() => {
        trace.push("1:début");
        return new Promise((resolve) => {
          release = resolve;
        }).then(() => {
          trace.push("1:fin");
        });
      });

      second = run(() => {
        trace.push("2:début");
      });

      await Promise.resolve();
      await Promise.resolve();

      expect(trace).toEqual(["1:début"]);

      release();
      await second;

      expect(trace).toEqual(["1:début", "1:fin", "2:début"]);
    });

    it("rend la promesse de la tâche pour que l'appelant traite son erreur", async () => {
      const run = createSerialQueue();
      const echec = new Error("réseau");

      await expect(run(() => Promise.reject(echec))).rejects.toBe(echec);
    });

    it("poursuit après un échec au lieu de figer la file", async () => {
      const run = createSerialQueue();

      await expect(run(() => Promise.reject(new Error("réseau")))).rejects.toThrow(
        "réseau",
      );
      await expect(run(() => "fait")).resolves.toBe("fait");
    });
  });
});
