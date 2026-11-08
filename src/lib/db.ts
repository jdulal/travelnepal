import mysql from "mysql2/promise";

const globalForDb = globalThis as unknown as { ntPool?: mysql.Pool };

export const pool =
  globalForDb.ntPool ??
  mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "nepal_travel",
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    queueLimit: 0,
    charset: "utf8mb4",
    dateStrings: true,
    timezone: "+05:45",
  });

if (process.env.NODE_ENV !== "production") globalForDb.ntPool = pool;

export async function q<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

export async function q1<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await q<T>(sql, params);
  return rows[0] ?? null;
}

export async function exec(sql: string, params: unknown[] = []) {
  const [result] = await pool.query(sql, params);
  return result as mysql.ResultSetHeader;
}

export function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "object") return value as T;
  try {
    return JSON.parse(String(value)) as T;
  } catch {
    return fallback;
  }
}
