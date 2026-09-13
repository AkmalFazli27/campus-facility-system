import { z } from "zod";

// Satu sumber aturan password (PRD §16): dipakai client (UX) & server (otoritatif).
export const passwordSchema = z
  .string()
  .min(8, { error: "Password minimal 8 karakter" })
  .max(72, { error: "Password maksimal 72 karakter" })
  .regex(/[a-zA-Z]/, { error: "Password harus mengandung huruf" })
  .regex(/[0-9]/, { error: "Password harus mengandung angka" });

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Format email tidak valid" }));

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Nama minimal 2 karakter" })
    .max(100, { error: "Nama maksimal 100 karakter" }),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: "Password wajib diisi" }),
});

export const createUserSchema = registerSchema.extend({
  role: z.enum(["USER", "OFFICER"], { error: "Role harus USER atau OFFICER" }),
});

export const listUsersQuerySchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "REJECTED", "INACTIVE"]).optional(),
  role: z.enum(["USER", "OFFICER", "ADMIN"]).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
