import { Client } from "pg";

const email = process.argv[2]?.trim().toLowerCase();
const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
if (!email || !connectionString) {
  console.error("Configura DATABASE_URL y ejecuta pnpm admin:promote correo@dominio.cl");
  process.exit(1);
}

const client = new Client({ connectionString });
await client.connect();
try {
  const result = await client.query('UPDATE "User" SET role = $1, "updatedAt" = NOW() WHERE email = $2 AND "emailVerified" = true', ["administrador", email]);
  if (result.rowCount !== 1) {
    console.error("La cuenta debe existir y tener el correo verificado.");
    process.exitCode = 1;
  } else {
    console.log("Permisos de administrador asignados.");
  }
} finally {
  await client.end();
}
