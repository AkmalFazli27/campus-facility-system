import mysql from "mysql2/promise";
import { env } from "./env";

// Pool koneksi MySQL (Asia/Jakarta). Diimpor ulang via `@/lib/db`.
export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  timezone: "+07:00",
});
