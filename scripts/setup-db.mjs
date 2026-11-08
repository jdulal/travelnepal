import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { seed } from "./seed.mjs";

const root = path.resolve(import.meta.dirname, "..");

function loadEnv() {
  const file = path.join(root, ".env.local");
  if (!fs.existsSync(file)) return {};
  const env = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = { ...loadEnv(), ...process.env };
const host = env.DB_HOST || "127.0.0.1";
const port = Number(env.DB_PORT || 3306);
const user = env.DB_USER || "root";
const password = env.DB_PASSWORD || "";
const database = env.DB_NAME || "nepal_travel";
const reset = process.argv.includes("--reset");

const admin = await mysql.createConnection({ host, port, user, password, multipleStatements: true });

try {
  if (reset) {
    console.log(`Dropping database ${database}…`);
    await admin.query(`DROP DATABASE IF EXISTS \`${database}\``);
  }
  await admin.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );

  const db = await mysql.createConnection({ host, port, user, password, database, multipleStatements: true });

  const [tables] = await db.query("SHOW TABLES");
  const alreadySeeded = tables.length > 0;
  if (alreadySeeded && !reset) {
    console.log("Database already contains tables. Nothing to do.");
    console.log("Run `npm run db:reset` to drop and recreate all data.");
    await db.end();
    await admin.end();
    process.exit(0);
  }

  console.log("Applying schema…");
  const schema = fs.readFileSync(path.join(root, "database", "schema.sql"), "utf8");
  await db.query(schema);

  await seed(db);

  await db.end();
  console.log("Database ready:", `${host}:${port}/${database}`);
} catch (err) {
  console.error("Database setup failed:", err.message);
  if (err.code === "ECONNREFUSED") {
    console.error("Start the database first with `npm run db:start` (or your own MySQL server).");
  }
  process.exitCode = 1;
} finally {
  await admin.end().catch(() => {});
}
