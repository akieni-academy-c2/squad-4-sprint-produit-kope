import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../../config/env.js";
import {
  useCloud,
  uploadBuffer,
  destroyImage,
} from "../../config/cloudinary.js";
import { decodeImage } from "../../utils/images.js";

const MAIN_WIDTH = 1280;
const THUMB_WIDTH = 400;

export async function processImage(buffer) {
  const image = await decodeImage(buffer);

  const base = image.rotate().flatten({ background: "#ffffff" });
  const [main, thumb] = await Promise.all([
    base
      .clone()
      .resize({ width: MAIN_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer(),
    base
      .clone()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: 78 })
      .toBuffer(),
  ]);

  return { main, thumb };
}

export function newPaths(professionalId) {
  const name = randomUUID();
  return {
    filePath: `${professionalId}/${name}.jpg`,
    thumbPath: `${professionalId}/${name}_thumb.jpg`,
  };
}

const absolute = (relativePath) => path.join(env.UPLOAD_DIR, relativePath);

export async function save({ filePath, thumbPath }, { main, thumb }) {
  try {
    if (useCloud)
      await Promise.all([
        uploadBuffer(main, filePath),
        uploadBuffer(thumb, thumbPath),
      ]);
    else {
      await fs.mkdir(path.dirname(absolute(filePath)), { recursive: true });
      await fs.writeFile(absolute(filePath), main);
      await fs.writeFile(absolute(thumbPath), thumb);
    }
  } catch (err) {
    await remove({ filePath, thumbPath }).catch(() => {});
    throw err;
  }
}

export async function remove({ filePath, thumbPath }) {
  const paths = [filePath, thumbPath];
  if (useCloud) await Promise.all(paths.map(destroyImage));
  else await Promise.all(paths.map((p) => fs.rm(absolute(p), { force: true })));
}
