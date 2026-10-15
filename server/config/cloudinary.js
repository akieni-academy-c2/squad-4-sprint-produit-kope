import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

export const useCloud = Boolean(
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET,
);

if (useCloud)
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });

const publicId = (relativePath) =>
  `${env.CLOUDINARY_FOLDER}/${relativePath.replace(/\.jpg$/, "")}`;

export function uploadBuffer(buffer, relativePath) {
  const id = publicId(relativePath);
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          public_id: id,
          asset_folder: id.split("/").slice(0, -1).join("/"),
          resource_type: "image",
          overwrite: true,
        },
        (err, result) => (err ? reject(err) : resolve(result)),
      )
      .end(buffer);
  });
}

export function destroyImage(relativePath) {
  return cloudinary.uploader.destroy(publicId(relativePath), {
    resource_type: "image",
    invalidate: true,
  });
}
