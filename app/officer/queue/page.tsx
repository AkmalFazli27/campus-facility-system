import type { Metadata } from "next";
import { redirect } from "next/navigation";
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
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12 sm:py-16">
      <section className="max-w-3xl space-y-4">
        <Badge className="border-sky-200 bg-sky-50 text-sky-700">
          Dasbor petugas
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

      <Tabs defaultValue="reservasi">
        <TabsList aria-label="Pilih antrian">
          <TabsTrigger value="reservasi">Reservasi</TabsTrigger>
          <TabsTrigger value="laporan">Laporan</TabsTrigger>
        </TabsList>

        <TabsContent value="reservasi">
          <ReservationQueue />
        </TabsContent>

        <TabsContent value="laporan">
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
  );
}
