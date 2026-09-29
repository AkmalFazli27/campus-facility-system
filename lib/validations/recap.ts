import { z } from "zod";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidCalendarDate(val: string): boolean {
  if (!DATE_REGEX.test(val)) return false;
  const d = new Date(`${val}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === val;
}

export const occupancyRecapQuerySchema = z
  .object({
    from: z
      .string()
      .trim()
      .refine(isValidCalendarDate, {
        error: "Parameter 'from' harus tanggal valid format YYYY-MM-DD",
      })
      .optional(),
    to: z
      .string()
      .trim()
      .refine(isValidCalendarDate, {
        error: "Parameter 'to' harus tanggal valid format YYYY-MM-DD",
      })
      .optional(),
    facility_id: z.coerce
      .number()
      .int()
      .positive({ error: "facility_id harus bilangan bulat positif" })
      .optional(),
    location: z.string().trim().max(150).optional(),
  })
  .refine(
    (data) => {
      if (data.from && data.to) {
        return data.from <= data.to;
      }
      return true;
    },
    {
      error: "Tanggal 'from' tidak boleh melebihi tanggal 'to'",
      path: ["from"],
    }
  );

export type OccupancyRecapQuery = z.infer<typeof occupancyRecapQuerySchema>;

export const damageRecapQuerySchema = z
  .object({
    from: z
      .string()
      .trim()
      .refine(isValidCalendarDate, {
        error: "Parameter 'from' harus tanggal valid format YYYY-MM-DD",
      })
      .optional(),
    to: z
      .string()
      .trim()
      .refine(isValidCalendarDate, {
        error: "Parameter 'to' harus tanggal valid format YYYY-MM-DD",
      })
      .optional(),
    facility_id: z.coerce
      .number()
      .int()
      .positive({ error: "facility_id harus bilangan bulat positif" })
      .optional(),
    location: z.string().trim().max(150).optional(),
    category: z.string().trim().max(50).optional(),
  })
  .refine(
    (data) => {
      if (data.from && data.to) {
        return data.from <= data.to;
      }
      return true;
    },
    {
      error: "Tanggal 'from' tidak boleh melebihi tanggal 'to'",
      path: ["from"],
    }
  );

export type DamageRecapQuery = z.infer<typeof damageRecapQuerySchema>;
