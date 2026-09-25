import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarCheck2, ClipboardList } from "lucide-react";
import DashboardSidebar from "@/app/dashboard/_components/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReservationQueue from "@/components/custom/officer/ReservationQueue";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Antrian petugas | KampusSpace",
  description: "Proses antrian reservasi dan laporan fasilitas kampus.",
};

// US08: halaman antrian petugas. Guard ganda: proxy.ts (matcher /officer/:path*)
// + secure check di sini. Tab Reservasi milik A3, tab Laporan milik A4.
export default async function OfficerQueuePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/officer/queue");
  if (user.role !== "OFFICER" && user.role !== "ADMIN") {
    redirect("/?error=forbidden");
  }

  return (
    <div className="w-full lg:pl-[250px]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10">
        <DashboardSidebar role={user.role} user={user} />
        <main className="flex min-w-0 flex-1 flex-col gap-8">
          <section className="max-w-3xl space-y-4">
            <Badge className="border-sky-200 bg-sky-50 text-sky-700">
              Ruang kerja petugas
            </Badge>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-ink-950 sm:text-5xl">
                Antrian petugas
              </h1>
              <p className="text-base leading-7 text-ink-600 sm:text-lg">
                Proses pengajuan reservasi dan laporan kerusakan yang menunggu
                tindakan.
              </p>
            </div>
          </section>

          <Tabs defaultValue="reservasi" className="gap-6">
            <TabsList
              aria-label="Pilih jenis antrian"
              className="grid h-auto w-full grid-cols-2 gap-3 rounded-none bg-transparent p-0"
            >
              <TabsTrigger
                value="reservasi"
                className="group h-auto min-h-14 w-full justify-start rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm hover:border-sky-200 hover:bg-sky-50/50 sm:min-h-20 sm:px-4 data-active:border-sky-300 data-active:bg-sky-50 data-active:text-sky-950 data-active:shadow-md"
              >
                <span className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 group-data-active:bg-sky-600 group-data-active:text-white sm:flex">
                  <CalendarCheck2 aria-hidden className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink-950">Reservasi</span>
                  <span className="mt-0.5 hidden text-xs font-normal leading-5 whitespace-normal text-ink-500 sm:block">
                    Setujui, tolak, dan cek bentrok jadwal.
                  </span>
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="laporan"
                className="group h-auto min-h-14 w-full justify-start rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm hover:border-sky-200 hover:bg-sky-50/50 sm:min-h-20 sm:px-4 data-active:border-sky-300 data-active:bg-sky-50 data-active:text-sky-950 data-active:shadow-md"
              >
                <span className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 group-data-active:bg-sky-600 group-data-active:text-white sm:flex">
                  <ClipboardList aria-hidden className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink-950">Laporan</span>
                  <span className="mt-0.5 hidden text-xs font-normal leading-5 whitespace-normal text-ink-500 sm:block">
                    Proses laporan kerusakan dan maintenance.
                  </span>
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reservasi" className="min-w-0 w-full">
              <ReservationQueue />
            </TabsContent>

            <TabsContent value="laporan" className="min-w-0 w-full">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle>Antrian laporan</CardTitle>
                  <CardDescription>
                    Tab ini dikerjakan A4 (aliran laporan &amp; maintenance).
                  </CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
