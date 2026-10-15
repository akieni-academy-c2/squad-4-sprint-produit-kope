import multer from "multer";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

const ALLOWED_TYPES = ["image/jpeg", "image/png"];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_FILE_SIZE_BYTES, files: 1 },
  fileFilter(req, file, cb) {
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(
      ApiError.badRequest("Format non supporté : JPG ou PNG uniquement", {
        [file.fieldname || "photo"]:
          "Format non supporté : JPG ou PNG uniquement",
      }),
    );
  },
});
