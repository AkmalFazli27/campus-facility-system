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

export const userTypeSchema = z.enum(["MAHASISWA", "DOSEN", "TENDIK"], {
  error: "Tipe pengguna wajib dipilih",
});

const identityNumberRaw = z
  .string()
  .trim()
  .max(20, { error: "Nomor identitas maksimal 20 karakter" })
  .optional()
  .or(z.literal(""));

const ALPHANUMERIC = /^[A-Za-z0-9]+$/;
const DIGITS_ONLY = /^[0-9]+$/;

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { error: "Nama minimal 2 karakter" })
      .max(100, { error: "Nama maksimal 100 karakter" }),
    email: emailSchema,
    password: passwordSchema,
    userType: userTypeSchema,
    identityNumber: identityNumberRaw,
  })
  .superRefine((v, ctx) => {
    const raw = (v.identityNumber ?? "").trim();
    if (v.userType === "TENDIK" && raw === "") return;
    if (raw === "") {
      ctx.addIssue({
        code: "custom",
        message: v.userType === "MAHASISWA" ? "NIM wajib diisi" : "NIP wajib diisi",
        path: ["identityNumber"],
      });
      return;
    }
    if (v.userType === "MAHASISWA") {
      if (!ALPHANUMERIC.test(raw)) {
        ctx.addIssue({
          code: "custom",
          message: "NIM hanya boleh huruf dan angka",
          path: ["identityNumber"],
        });
        return;
      }
    } else if (!DIGITS_ONLY.test(raw)) {
      ctx.addIssue({
        code: "custom",
        message: "NIP hanya boleh angka",
        path: ["identityNumber"],
      });
      return;
    }
    if (v.userType === "MAHASISWA" && (raw.length < 9 || raw.length > 16)) {
      ctx.addIssue({
        code: "custom",
        message: "NIM harus 9-16 karakter",
        path: ["identityNumber"],
      });
    }
    if ((v.userType === "DOSEN" || v.userType === "TENDIK") && raw.length !== 18) {
      ctx.addIssue({
        code: "custom",
        message: "NIP harus tepat 18 karakter",
        path: ["identityNumber"],
      });
    }
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: "Password wajib diisi" }),
});

export const createUserSchema = registerSchema.safeExtend({
  role: z.enum(["USER", "OFFICER"], { error: "Role harus USER atau OFFICER" }),
});

// Skema client untuk form register dual-slider. Server tetap memakai
// registerSchema (name/email/password/userType/identityNumber);
// confirm + terms hanya UX, tidak dikirim ke API.
export const registerClientSchema = registerSchema
  .safeExtend({
    confirmPassword: z.string().min(1, { error: "Konfirmasi sandi wajib diisi" }),
    agreeTerms: z.literal(true, { error: "Anda harus menyetujui ketentuan" }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    error: "Konfirmasi sandi tidak sama",
    path: ["confirmPassword"],
  });

export const listUsersQuerySchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "REJECTED", "INACTIVE"]).optional(),
  role: z.enum(["USER", "OFFICER", "ADMIN"]).optional(),
  userType: userTypeSchema.optional(),
});

export type UserTypeInput = z.infer<typeof userTypeSchema>;

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type RegisterClientInput = z.infer<typeof registerClientSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
