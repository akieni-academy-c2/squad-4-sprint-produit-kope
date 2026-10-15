import { z } from "zod";
import { idSchema } from "../../utils/commonSchemas.js";
const emptyToUndefined = (value) => (value === "" ? undefined : value);
export const searchQuerySchema = z.object({
  trade: z.preprocess(emptyToUndefined, idSchema("Métier invalide").optional()),
  zone: z.preprocess(emptyToUndefined, idSchema("Zone invalide").optional()),
  city: z.preprocess(emptyToUndefined, idSchema("Ville invalide").optional()),
  q: z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value : undefined),
    z.string().trim().max(100, "100 caractères maximum").optional(),
  ),
  available: z.preprocess((value) => {
    if (value === "true") return true;
    if (value === "false") return false;
    if (value === "" || value == null) return undefined;
    return value;
  }, z.boolean().optional()),
  minRating: z.preprocess(
    emptyToUndefined,
    z.coerce.number().min(1).max(5).optional(),
  ),
  minExperience: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(0).max(60).optional(),
  ),
  page: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).default(1),
  ),
});
