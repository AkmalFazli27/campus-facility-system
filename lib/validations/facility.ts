import { z } from "zod";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value: string) {
  if (!DATE_PATTERN.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export const facilityIdSchema = z
  .string()
  .regex(/^[1-9]\d*$/, { error: "ID fasilitas tidak valid" })
  .transform(Number)
  .pipe(z.number().int().positive());

export const availabilityQuerySchema = z.object({
  date: z
    .string({ error: "Tanggal wajib diisi" })
    .trim()
    .refine(isValidDate, { error: "Tanggal harus valid dengan format YYYY-MM-DD" }),
});

export const facilityStatusSchema = z.enum(["ACTIVE", "INACTIVE", "UNDER_MAINTENANCE"], {
  error: "Status fasilitas harus ACTIVE, INACTIVE, atau UNDER_MAINTENANCE",
});

export const createFacilitySchema = z.object({
  name: z
    .string({ error: "Nama fasilitas wajib diisi" })
    .trim()
    .min(2, { error: "Nama fasilitas minimal 2 karakter" })
    .max(150, { error: "Nama fasilitas maksimal 150 karakter" }),
  type: z
    .string({ error: "Tipe fasilitas wajib diisi" })
    .trim()
    .min(2, { error: "Tipe fasilitas minimal 2 karakter" })
    .max(50, { error: "Tipe fasilitas maksimal 50 karakter" }),
  location: z
    .string({ error: "Lokasi fasilitas wajib diisi" })
    .trim()
    .min(2, { error: "Lokasi fasilitas minimal 2 karakter" })
    .max(150, { error: "Lokasi fasilitas maksimal 150 karakter" }),
  capacity: z.coerce
    .number({ error: "Kapasitas harus berupa angka" })
    .int({ error: "Kapasitas harus bilangan bulat" })
    .min(0, { error: "Kapasitas tidak boleh negatif" }),
  description: z
    .string()
    .trim()
    .max(1000, { error: "Deskripsi maksimal 1000 karakter" })
    .optional()
    .nullable(),
  status: facilityStatusSchema.default("ACTIVE"),
});

export const updateFacilitySchema = createFacilitySchema.partial();

export const updateFacilityStatusSchema = z.object({
  status: facilityStatusSchema,
});

export type CreateFacilityInput = z.infer<typeof createFacilitySchema>;
export type UpdateFacilityInput = z.infer<typeof updateFacilitySchema>;
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
