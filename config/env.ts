import { z } from "zod";

// Validasi env saat aplikasi dimuat. Gagal fast bila JWT_SECRET lemah.
const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().default(3306),
  DB_NAME: z.string().default("campus_facility"),
  DB_USER: z.string().default("root"),
  DB_PASSWORD: z.string().default(""),
  JWT_SECRET: z.string().min(32, "JWT_SECRET minimal 32 karakter"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  UPLOAD_DIR: z.string().default("public/uploads"),
  MAX_UPLOAD_MB: z.coerce.number().default(5),
});

export const env = envSchema.parse(process.env);
