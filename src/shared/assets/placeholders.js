import hero from "./hero.png";
import what1 from "./what1.png";
import what2 from "./what2.png";
import what3 from "./what3.png";
import user1 from "./user1.png";
import user2 from "./user2.png";

const IMAGES = [hero, what1, what2, what3, user1, user2];

export { IMAGES };

function fingerprint(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1)
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

export function reserveImage(label, usedBy = []) {
  const available = IMAGES.filter((image) => !usedBy.includes(image));
  const pool = available.length ? available : IMAGES;

  return pool[fingerprint(label) % pool.length];
}
