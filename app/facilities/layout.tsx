import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Fasilitas Kampus",
  description: "Cari ruang, laboratorium, aula, dan fasilitas kampus.",
};

export default function FacilitiesLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
