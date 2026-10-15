import { z } from "zod";
import { ApiError } from "../utils/ApiError.js";

export function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      const errors = Object.fromEntries(
        Object.entries(fieldErrors).map(([field, messages]) => [
          field,
          messages[0],
        ]),
      );
      throw new ApiError(400, "Données invalides", errors);
    }

    req.validated ??= {};
    req.validated[source] = result.data;
    next();
  };
}
