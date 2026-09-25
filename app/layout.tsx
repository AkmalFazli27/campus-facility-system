import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import PublicHeader from "@/components/custom/PublicHeader";
import { getSessionUser } from "@/lib/session";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistem Reservasi & Pelaporan Fasilitas Kampus",
  description:
    "Cek ketersediaan fasilitas kampus, ajukan reservasi, dan laporkan kerusakan dalam satu aplikasi.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  let headerUser: { name: string; email: string; role: string } | null = null;
  try {
    const sessionUser = await getSessionUser();
    if (sessionUser) {
      headerUser = {
        name: sessionUser.name,
        email: sessionUser.email,
        role: sessionUser.role,
      };
    }
  } catch {
    headerUser = null;
  }

  const pathname = (await headers()).get("x-pathname") ?? "";
  const hideHeader =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/reservations" ||
    pathname.startsWith("/reservations/");

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas-public">
        {hideHeader ? null : <PublicHeader user={headerUser} />}
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
