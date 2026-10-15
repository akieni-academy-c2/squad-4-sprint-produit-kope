import bcrypt from "bcryptjs";
import { env } from "../../config/env.js";
import { pool } from "../pool.js";
import { normalizePhone } from "../../utils/phone.js";

async function main() {
  const phone = normalizePhone(env.ADMIN_PHONE ?? "");
  if (!phone || !env.ADMIN_PASSWORD || env.ADMIN_PASSWORD.length < 8)
    throw new Error(
      "ADMIN_PHONE (numéro valide) et ADMIN_PASSWORD (8 caractères min.) sont requis dans .env",
    );

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, env.BCRYPT_ROUNDS);

  const { rows } = await pool.query(
    `INSERT INTO users (role, phone, password_hash, first_name, last_name)
     VALUES ('admin', $1, $2, $3, $3)
     ON CONFLICT (phone) DO UPDATE
       SET role = 'admin',
           password_hash = EXCLUDED.password_hash,
           first_name = EXCLUDED.first_name
     RETURNING id, (xmax = 0) AS created`,
    [phone, passwordHash, env.ADMIN_NAME],
  );

  const { id, created } = rows[0];
  console.log(
    created
      ? `Compte admin « ${env.ADMIN_NAME} » créé : ${phone} (#${id})`
      : `Compte ${phone} (#${id}) promu en administrateur « ${env.ADMIN_NAME} »`,
  );
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
