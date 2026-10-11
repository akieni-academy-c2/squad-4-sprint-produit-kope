/**
 * Génère public/og-image.png depuis public/og-image.svg.
 *
 * Les réseaux sociaux (Facebook, WhatsApp, Twitter, LinkedIn) refusent les
 * images de partage en SVG : ils n'acceptent que PNG ou JPEG. Le SVG reste la
 * source éditable, ce PNG le livrable.
 *
 * Usage : node scripts/generate-og-image.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svgPath = join(root, 'public', 'og-image.svg');
const pngPath = join(root, 'public', 'og-image.png');

const svg = await readFile(svgPath);

const png = await sharp(svg, { density: 144 })
  .resize(1200, 630)
  .png({ compressionLevel: 9 })
  .toBuffer();

await writeFile(pngPath, png);

console.log(`og-image.png écrit - ${(png.length / 1024).toFixed(1)} Ko (1200x630)`);