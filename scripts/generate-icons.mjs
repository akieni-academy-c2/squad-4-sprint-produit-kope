import sharp from 'sharp';
import fs from 'node:fs';



const targets = [
  { file: 'icon-192.png', size: 192, padding: 0 },
  { file: 'icon-512.png', size: 512, padding: 0 },
  { file: 'icon-maskable-512.png', size: 512, padding: 0.2 },
];

const svg = fs.readFileSync('public/favicon.svg');

for (const { file, size, padding } of targets) {
  const margin = Math.round(size * padding);
  const buffer = await sharp(svg, { density: 384 })
    .resize(size - margin * 2, size - margin * 2)
    .flatten({ background: '#2d5c4a' })
    .png({ compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync(`public/${file}`, buffer);
  console.log(`${file}  ${size}x${size}  ${(buffer.length / 1024).toFixed(1)} Ko`);
}