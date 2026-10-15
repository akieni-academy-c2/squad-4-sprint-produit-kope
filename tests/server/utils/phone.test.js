import { describe, it, expect } from "vitest";
import { normalizePhone, toWhatsappUrl } from "@server/utils/phone.js";

describe("normalizePhone (+242)", () => {
  it("accepte le format local avec espaces", () => {
    expect(normalizePhone("06 123 45 67")).toBe("+242061234567");
  });
  it("accepte le format international +242", () => {
    expect(normalizePhone("+242 06 123 45 67")).toBe("+242061234567");
  });
  it("accepte 00242 et 242 sans +", () => {
    expect(normalizePhone("00242061234567")).toBe("+242061234567");
    expect(normalizePhone("242061234567")).toBe("+242061234567");
  });
  it("rejette les numéros invalides", () => {
    expect(normalizePhone("123")).toBeNull();
    expect(normalizePhone("abcdefghij")).toBeNull();
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone(null)).toBeNull();
    expect(normalizePhone("+24254123456789")).toBeNull();
  });
});

describe("toWhatsappUrl", () => {
  it("génère le lien wa.me sans + ni espaces", () => {
    expect(toWhatsappUrl("+242 06 123 45 67")).toBe(
      "https://wa.me/242061234567",
    );
  });
});
