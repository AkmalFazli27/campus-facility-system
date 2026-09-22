import { z } from "zod";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function isValidDate(value: string) {
  if (!DATE_PATTERN.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export const createReservationSchema = z.object({
  facility_id: z
    .number({ error: "Facility ID wajib berupa angka" })
    .int({ error: "Facility ID wajib berupa bilangan bulat" })
    .positive({ error: "Facility ID tidak valid" }),
  reservation_date: z
    .string({ error: "Tanggal reservasi wajib diisi" })
    .refine(isValidDate, { error: "Tanggal harus valid dengan format YYYY-MM-DD" }),
  start_time: z
    .string({ error: "Waktu mulai wajib diisi" })
    .regex(TIME_PATTERN, { error: "Waktu mulai harus menggunakan format HH:mm" }),
  end_time: z
    .string({ error: "Waktu selesai wajib diisi" })
    .regex(TIME_PATTERN, { error: "Waktu selesai harus menggunakan format HH:mm" }),
  purpose: z
    .string({ error: "Tujuan wajib diisi" })
    .trim()
    .min(1, { error: "Tujuan wajib diisi" }),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
