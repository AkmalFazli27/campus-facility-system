import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";
import { ReportStatus, type PrismaClient } from "@prisma/client";
import { env } from "@/config/env";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = (env.MAX_UPLOAD_MB || 5) * 1024 * 1024;

export type UploadPhotoResult =
  | { success: true; photoPath: string }
  | { success: false; message: string };

/**
 * Abstraksi penyimpanan foto agar bisa diuji tanpa jaringan.
 * Produksi memakai Vercel Blob; dev lokal memakai filesystem.
 */
export type ReportPhotoStorage = {
  save(pathname: string, file: File): Promise<{ url: string }>;
};

function createBlobPhotoStorage(
  token: string,
  blobPut: typeof put = put
): ReportPhotoStorage {
  return {
    async save(pathname, file) {
      // Vercel serverless filesystem read-only, jadi foto disimpan ke Blob.
      const blob = await blobPut(pathname, file, {
        access: "public",
        contentType: file.type,
        addRandomSuffix: false,
        token,
      });
      return { url: blob.url };
    },
  };
}

function createLocalPhotoStorage(): ReportPhotoStorage {
  return {
    async save(pathname, file) {
      const filePath = path.join(process.cwd(), "public", pathname);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
      return { url: `/${pathname}` };
    },
  };
}

export function resolveReportPhotoStorage(
  envVars: NodeJS.ProcessEnv = process.env,
  blobPut: typeof put = put
): ReportPhotoStorage {
  const token = envVars.BLOB_READ_WRITE_TOKEN;
  return token
    ? createBlobPhotoStorage(token, blobPut)
    : createLocalPhotoStorage();
}

function reportPhotoExtension(file: File): string {
  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  return ".jpg";
}

/**
 * Validasi file foto laporan, lalu simpan ke storage (Blob di produksi,
 * filesystem di dev) dan kembalikan URL/path-nya.
 */
export async function saveReportPhoto(
  file: File,
  storage: ReportPhotoStorage = resolveReportPhotoStorage()
): Promise<UploadPhotoResult> {
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

  const pathname = `uploads/reports/${crypto.randomUUID()}${reportPhotoExtension(
    file
  )}`;

  try {
    const { url } = await storage.save(pathname, file);
    return { success: true, photoPath: url };
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
