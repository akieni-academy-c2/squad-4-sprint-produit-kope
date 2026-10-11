import bcrypt from 'bcryptjs';
import { env } from '../../config/env.js';
import { pool } from '../pool.js';
import { normalizePhone } from '../../utils/phone.js';

async function main() {
  const phone = normalizePhone(env.ADMIN_PHONE ?? '');
  if (!phone || !env.ADMIN_PASSWORD || env.ADMIN_PASSWORD.length < 8)
    throw new Error('ADMIN_PHONE (numéro valide) et ADMIN_PASSWORD (8 caractères min.) sont requis dans .env');


  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  // DO NOTHING silencieusement : si le numéro appartient déjà à un compte
  // client ou professionnel, la connexion aboutit mais /admin répond 403 sans
  // explication. On promeut donc explicitement le compte existant.
  const { rows } = await pool.query(
    `INSERT INTO users (role, phone, password_hash)
     VALUES ('admin', $1, $2)
     ON CONFLICT (phone) DO UPDATE
       SET role = 'admin',
           password_hash = EXCLUDED.password_hash
     RETURNING id, (xmax = 0) AS created`,
    [phone, passwordHash],
  );

  const { id, created } = rows[0];
  console.log(
    created
      ? `Compte admin créé : ${phone} (#${id})`
      : `Compte ${phone} (#${id}) promu en administrateur`,
  );
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
