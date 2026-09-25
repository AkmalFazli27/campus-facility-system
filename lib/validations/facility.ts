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

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
