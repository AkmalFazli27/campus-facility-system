import { z } from "zod";

export const REPORT_CATEGORIES = [
  "AC & Pendingin",
  "Proyektor & Audio",
  "Kelistrikan & Lampu",
  "Meja & Kursi",
  "Pintu & Jendela",
  "Kebersihan",
  "Jaringan & Internet",
  "Lainnya",
] as const;

export const createReportSchema = z.object({
  facility_id: z.coerce
    .number({ error: "Fasilitas wajib dipilih" })
    .int({ error: "ID fasilitas harus berupa bilangan bulat" })
    .positive({ error: "Fasilitas wajib dipilih" }),
  category: z
    .string({ error: "Kategori wajib dipilih" })
    .trim()
    .min(2, { error: "Kategori wajib dipilih" })
    .max(50, { error: "Kategori maksimal 50 karakter" }),
  description: z
    .string({ error: "Deskripsi wajib diisi" })
    .trim()
    .min(10, { error: "Deskripsi kerusakan minimal 10 karakter" })
    .max(2000, { error: "Deskripsi maksimal 2000 karakter" }),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

export const reportStatusSchema = z.enum(
  ["NEW", "IN_PROGRESS", "RESOLVED", "REJECTED"],
  { error: "Status laporan tidak valid" }
);

export const updateReportStatusSchema = z
  .object({
    status: reportStatusSchema,
    resolution_notes: z.string().trim().max(2000).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.status === "RESOLVED") {
        return (
          typeof data.resolution_notes === "string" &&
          data.resolution_notes.trim().length >= 5
        );
      }
      return true;
    },
    {
      error:
        "Catatan resolusi wajib diisi minimal 5 karakter saat status diselesaikan",
      path: ["resolution_notes"],
    }
  );

export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;

export const toggleFacilityMaintenanceSchema = z.object({
  status: z.enum(["UNDER_MAINTENANCE", "ACTIVE"], {
    error: "Status fasilitas harus UNDER_MAINTENANCE atau ACTIVE",
  }),
});

export type ToggleFacilityMaintenanceInput = z.infer<
  typeof toggleFacilityMaintenanceSchema
>;
