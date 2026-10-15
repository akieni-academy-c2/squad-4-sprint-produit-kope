import { env } from "../config/env.js";

const cloudBase =
  env.CLOUDINARY_CLOUD_NAME &&
  `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/${env.CLOUDINARY_FOLDER}`;

export function uploadUrl(relativePath) {
  if (!relativePath) return null;
  return cloudBase
    ? `${cloudBase}/${relativePath}`
    : `/uploads/${relativePath}`;
}
