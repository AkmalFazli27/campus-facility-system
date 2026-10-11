import test from "node:test";
import assert from "node:assert/strict";
import { ReportStatus } from "@prisma/client";
import {
  createReportSchema,
  updateReportStatusSchema,
  toggleFacilityMaintenanceSchema,
} from "../../lib/validations/report";
import { isValidReportTransition } from "../../lib/services/reportService";

test("createReportSchema menerima input laporan valid", () => {
  const result = createReportSchema.safeParse({
    facility_id: "1",
    category: "AC & Pendingin",
    description: "AC meneteskan air deras di baris kedua.",
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.facility_id, 1);
    assert.equal(result.data.category, "AC & Pendingin");
  }
});

test("createReportSchema menolak deskripsi kurang dari 10 karakter", () => {
  const result = createReportSchema.safeParse({
    facility_id: 1,
    category: "AC & Pendingin",
    description: "Rusak",
  });
  assert.equal(result.success, false);
});

test("createReportSchema menolak facility_id invalid", () => {
  const result = createReportSchema.safeParse({
    facility_id: -5,
    category: "Kebersihan",
    description: "Ruangan kotor dan banyak sampah berserakan.",
  });
  assert.equal(result.success, false);
});

test("updateReportStatusSchema memvalidasi catatan resolusi saat RESOLVED", () => {
  const withoutNotes = updateReportStatusSchema.safeParse({
    status: "RESOLVED",
  });
  assert.equal(withoutNotes.success, false);

  const shortNotes = updateReportStatusSchema.safeParse({
    status: "RESOLVED",
    resolution_notes: "ok",
  });
  assert.equal(shortNotes.success, false);

  const validNotes = updateReportStatusSchema.safeParse({
    status: "RESOLVED",
    resolution_notes: "Kabel telah diperbaiki dan diuji.",
  });
  assert.equal(validNotes.success, true);
});

test("toggleFacilityMaintenanceSchema hanya menerima UNDER_MAINTENANCE atau ACTIVE", () => {
  assert.equal(
    toggleFacilityMaintenanceSchema.safeParse({ status: "UNDER_MAINTENANCE" })
      .success,
    true
  );
  assert.equal(
    toggleFacilityMaintenanceSchema.safeParse({ status: "ACTIVE" }).success,
    true
  );
  assert.equal(
    toggleFacilityMaintenanceSchema.safeParse({ status: "PENDING" }).success,
    false
  );
});

test("isValidReportTransition mengizinkan transisi status yang sah dan menolak yang ilegal", () => {
  // Sah
  assert.equal(
    isValidReportTransition(ReportStatus.NEW, ReportStatus.IN_PROGRESS),
    true
  );
  assert.equal(
    isValidReportTransition(ReportStatus.NEW, ReportStatus.REJECTED),
    true
  );
  assert.equal(
    isValidReportTransition(ReportStatus.IN_PROGRESS, ReportStatus.RESOLVED),
    true
  );
  assert.equal(
    isValidReportTransition(ReportStatus.IN_PROGRESS, ReportStatus.REJECTED),
    true
  );

  // Ilegal (PRD US11)
  assert.equal(
    isValidReportTransition(ReportStatus.NEW, ReportStatus.RESOLVED),
    false
  );
  assert.equal(
    isValidReportTransition(ReportStatus.RESOLVED, ReportStatus.NEW),
    false
  );
  assert.equal(
    isValidReportTransition(ReportStatus.REJECTED, ReportStatus.IN_PROGRESS),
    false
  );
});
