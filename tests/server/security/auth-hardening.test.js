import { describe, expect, it, vi, beforeEach } from "vitest";
import { env } from "@server/config/env.js";
import {
  updateAccountSchema,
  loginSchema,
} from "@server/modules/auth/auth.schemas.js";

vi.mock("@server/db/pool.js", () => ({
  pool: {
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    connect: vi.fn(),
  },
  withTransaction: vi.fn(),
  isDatabaseReachable: vi.fn(),
}));

vi.mock("@server/modules/auth/auth.repository.js", () => ({
  getPasswordHash: vi.fn(),
  updateAccount: vi.fn(),
  updatePasswordHash: vi.fn(),
  updateAvatarUrl: vi.fn(),
  findById: vi.fn(),
  findByPhone: vi.fn(),
  createUser: vi.fn(),
  updateRole: vi.fn(),
}));

const repository = await import("@server/modules/auth/auth.repository.js");
const service = await import("@server/modules/auth/auth.service.js");
const bcrypt = (await import("bcryptjs")).default;

const CURRENT = {
  id: 7,
  phone: "+242061234567",
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
};

beforeEach(() => {
  vi.restoreAllMocks();
  repository.getPasswordHash.mockResolvedValue("$2b$12$hashvalide");
  repository.updateAccount.mockResolvedValue(CURRENT);
  vi.spyOn(bcrypt, "compare").mockImplementation((candidate) =>
    Promise.resolve(candidate === "MotDePasse1!"),
  );
});

describe("changement d'identité du compte", () => {
  it("refuse un nouveau numéro sans mot de passe courant", async () => {
    await expect(
      service.updateAccount(7, { phone: "+242069999999" }),
    ).rejects.toMatchObject({ status: 401 });
    expect(repository.updateAccount).not.toHaveBeenCalled();
  });

  it("refuse un nouveau numéro dont le mot de passe courant est faux", async () => {
    await expect(
      service.updateAccount(7, {
        phone: "+242069999999",
        currentPassword: "faux",
      }),
    ).rejects.toMatchObject({ status: 401 });
    expect(repository.updateAccount).not.toHaveBeenCalled();
  });

  it("accepte un nouveau numéro avec le bon mot de passe", async () => {
    await expect(
      service.updateAccount(7, {
        phone: "+242069999999",
        currentPassword: "MotDePasse1!",
      }),
    ).resolves.toBeTruthy();
    expect(repository.updateAccount).toHaveBeenCalledWith(7, {
      firstName: undefined,
      lastName: undefined,
      phone: "+242069999999",
      email: undefined,
    });
  });

  it("exige aussi la reauthentification pour un nouvel e-mail", async () => {
    await expect(
      service.updateAccount(7, { email: "autre@example.com" }),
    ).rejects.toMatchObject({
      status: 401,
    });
  });

  it("laisse le prénom et le nom se modifier sans mot de passe", async () => {
    await expect(
      service.updateAccount(7, { firstName: "Augusta" }),
    ).resolves.toBeTruthy();
    expect(repository.updateAccount).toHaveBeenCalled();
  });

  it("compare toujours, même si le compte n'existe pas", async () => {
    repository.getPasswordHash.mockResolvedValue(undefined);
    await expect(
      service.updateAccount(404, { phone: "+242069999999" }),
    ).rejects.toMatchObject({
      status: 404,
    });
    expect(bcrypt.compare).toHaveBeenCalled();
  });
});

describe("schémas d'authentification", () => {
  it("n'accepte pas un mot de passe au-delà de la limite de bcrypt", () => {
    expect(
      loginSchema.safeParse({ phone: "061234567", password: "a".repeat(72) })
        .success,
    ).toBe(true);
    expect(
      loginSchema.safeParse({ phone: "061234567", password: "a".repeat(73) })
        .success,
    ).toBe(false);
  });

  it("accepte currentPassword dans la mise à jour du compte", () => {
    expect(
      updateAccountSchema.safeParse({
        phone: "+242069999999",
        currentPassword: "MotDePasse1!",
      }).success,
    ).toBe(true);
  });
});

describe("coût du hachage", () => {
  it("est d'au moins 12 par défaut", () => {
    expect(env.BCRYPT_ROUNDS).toBeGreaterThanOrEqual(12);
    expect(env.BCRYPT_ROUNDS).toBeLessThanOrEqual(15);
  });
});
