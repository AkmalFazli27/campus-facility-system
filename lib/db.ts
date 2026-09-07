// Titik impor tunggal koneksi DB untuk Route Handler: `import { pool } from "@/lib/db"`.
export { pool } from "@/config/database";
export type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
