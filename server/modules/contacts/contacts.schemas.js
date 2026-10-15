import { z } from "zod";
import { idSchema } from "../../utils/commonSchemas.js";

const emptyToUndefined = (value) =>
  value === "" || value == null ? undefined : value;

export const createContactSchema = z
  .object({
    toUserId: idSchema("Identifiant invalide"),
    channel: z
      .enum(["message", "call", "whatsapp"], { error: "Canal invalide" })
      .default("message"),
    message: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .trim()
        .min(10, "Le message doit contenir au moins 10 caractères")
        .max(500, "Le message ne doit pas dépasser 500 caractères")
        .optional(),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.channel === "message" && !data.message)
      ctx.addIssue({
        code: "custom",
        path: ["message"],
        message: "Le message est obligatoire",
      });
  })
  .transform((data) => ({ ...data, message: data.message ?? null }));
