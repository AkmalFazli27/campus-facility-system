import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { ReportStatus, type PrismaClient } from "@prisma/client";
import { env } from "@/config/env";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = (env.MAX_UPLOAD_MB || 5) * 1024 * 1024;

export type UploadPhotoResult =
  | { success: true; photoPath: string }
  | { success: false; message: string };

/**
 * Validasi dan simpan file foto laporan ke disk lokal (public/uploads/reports).
 */
export async function saveReportPhoto(file: File): Promise<UploadPhotoResult> {
  if (!file || !(file instanceof File) || file.size === 0) {
    return { success: false, message: "Foto laporan wajib diunggah" };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      message: "Format foto harus JPG, PNG, atau WEBP",
    };
  }

  if (file.size > MAX_BYTES) {
    return {
      success: false,
      message: `Ukuran foto maksimal ${env.MAX_UPLOAD_MB} MB`,
    };
  }

  const extension =
    file.type === "image/png"
      ? ".png"
      : file.type === "image/webp"
      ? ".webp"
      : ".jpg";

  const filename = `${crypto.randomUUID()}${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "reports");

  try {
    await fs.mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    return {
      success: true,
      photoPath: `/uploads/reports/${filename}`,
    };
  } catch (error) {
    console.error("Gagal menyimpan foto laporan:", error);
    return {
      success: false,
      message: "Gagal menyimpan foto di server",
    };
  }
}

/**
 * Validasi apakah perpindahan status laporan diizinkan (PRD US11).
 * Transisi valid:
 * NEW -> IN_PROGRESS, REJECTED
 * IN_PROGRESS -> RESOLVED, REJECTED
 */
export function isValidReportTransition(
  currentStatus: ReportStatus,
  targetStatus: ReportStatus
): boolean {
  if (currentStatus === targetStatus) return true;

  if (currentStatus === ReportStatus.NEW) {
    return (
      targetStatus === ReportStatus.IN_PROGRESS ||
      targetStatus === ReportStatus.REJECTED
    );
  }

  if (currentStatus === ReportStatus.IN_PROGRESS) {
    return (
      targetStatus === ReportStatus.RESOLVED ||
      targetStatus === ReportStatus.REJECTED
    );
  }

  // RESOLVED dan REJECTED adalah status akhir
  return false;
}

/**
 * Helper untuk mencatat AuditLog
 */
export async function createAuditLog(
  prisma: PrismaClient,
  params: {
    userId: number;
    action: string;
    entityType: string;
    entityId: number;
    description: string;
  }
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        description: params.description,
      },
    });
  } catch (err) {
    console.error("Gagal mencatat audit log:", err);
  }
}
