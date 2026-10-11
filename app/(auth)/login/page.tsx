import type { Metadata } from "next";
import AuthShell from "@/components/custom/auth/AuthShell";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk untuk mengelola reservasi dan laporan fasilitas kampus.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;

  return <AuthShell initialMode="sign-in" next={next} />;
}
