import type { Metadata } from "next";
import AuthShell from "@/components/custom/auth/AuthShell";

export const metadata: Metadata = {
  title: "Daftar Akun",
  description: "Daftarkan akun civitas untuk mengajukan reservasi dan laporan fasilitas kampus.",
};

export default function RegisterPage() {
  return <AuthShell initialMode="sign-up" />;
}
