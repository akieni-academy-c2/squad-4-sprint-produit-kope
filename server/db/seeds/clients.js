import bcrypt from 'bcryptjs';
import { pool } from '../pool.js';
import { normalizePhone } from '../../utils/phone.js';

const COUNT = Number(process.env.SEED_CLIENTS_COUNT) || 20;
const PASSWORD = process.env.SEED_CLIENT_PASSWORD ?? 'Password123!';

const FIRST_NAMES = [
  'Abel', 'Ange', 'Brice', 'Cédric', 'Diane', 'Emmanuella', 'Franck', 'Gina',
  'Hervé', 'Inès', 'Joël', 'Kelly', 'Léa', 'Marcel', 'Nadia', 'Olivier',
  'Prisca', 'Ruth', 'Stéphane', 'Tatiana',
];
const LAST_NAMES = [
  'Bouanga', 'Itoua', 'Kengue', 'Loufoua', 'Makaya', 'Mballa', 'Nganga', 'Okamba',
  'Babaka', 'Ekongo', 'Ibara', 'Matondo', 'Ngoma', 'Ondongo', 'Sassou', 'Tsoumou',
];

function randomPhone() {
  const a = String(Math.floor(1000000 + Math.random() * 9000000)).slice(0, 7);
  return normalizePhone(`06${a}`) ?? null;
}

async function main() {
  if (PASSWORD.length < 8)
    throw new Error('SEED_CLIENT_PASSWORD doit faire au moins 8 caractères');

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  let created = 0;

  for (let i = 0; i < COUNT; i += 1) {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const phone = randomPhone();
    if (!phone) continue;
    const { rowCount } = await pool.query(
      `INSERT INTO users (role, phone, password_hash, first_name, last_name, consented_at)
       VALUES ('client', $1, $2, $3, $4, now())
       ON CONFLICT (phone) DO NOTHING`,
      [phone, passwordHash, firstName, lastName],
    );
    created += rowCount;
  }

  console.log(`${created} client(s) créé(s) sur ${COUNT} demandés.`);
  console.log(`Mot de passe commun : ${PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
