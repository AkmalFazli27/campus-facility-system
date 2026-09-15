import { CalendarCheck, ClipboardList, Wrench } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const BENEFITS = [
  {
    icon: CalendarCheck,
    title: "Cek ketersediaan",
    desc: "Slot 07.00–20.00 per 30 menit, tanpa perlu login.",
    body: "Telusuri fasilitas berdasarkan tipe, lokasi, dan kapasitas.",
  },
  {
    icon: ClipboardList,
    title: "Ajukan reservasi",
    desc: "Pilih slot, isi tujuan, tunggu persetujuan petugas.",
    body: "Status reservasi terlihat jelas: pending, disetujui, atau ditolak.",
  },
  {
    icon: Wrench,
    title: "Laporkan kerusakan",
    desc: "Kirim laporan dan satu foto, pantau hingga selesai.",
    body: "Petugas menindaklanjuti dan memperbarui status fasilitas.",
  },
];

export default function BenefitCards() {
  return (
    <section aria-label="Keunggulan layanan" className="grid gap-4 sm:grid-cols-3">
      {BENEFITS.map((b) => (
        <Card key={b.title} className="rounded-3xl">
          <CardHeader>
            <b.icon aria-hidden className="size-6 text-brand-600" />
            <CardTitle>{b.title}</CardTitle>
            <CardDescription>{b.desc}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-ink-600">{b.body}</CardContent>
        </Card>
      ))}
    </section>
  );
}
