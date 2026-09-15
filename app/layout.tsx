import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import Navbar from "@/components/sections/Navbar";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Navbar />
      <html
        lang="id"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          {children}
          <Toaster position="top-center" richColors />
        </body>
      </html>
    </>
  );
}
