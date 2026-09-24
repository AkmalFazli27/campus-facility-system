import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { statusCopy } from "@/lib/facilities/constants";
import type { Facility } from "@/lib/facilities/types";

export default function FacilityCard({ facility }: { facility: Facility }) {
  const status = statusCopy[facility.status];

  return (
    <Card className="flex h-full flex-col overflow-hidden border-orange-100 transition-shadow hover:shadow-md">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="outline" className="capitalize">
            {facility.type}
          </Badge>
          <Badge className={status.className}>{status.label}</Badge>
        </div>
        <CardTitle className="text-xl">{facility.name}</CardTitle>
        <CardDescription className="line-clamp-2 min-h-10">
          {facility.description ||
            "Fasilitas kampus untuk mendukung kegiatan akademik dan organisasi."}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto space-y-4">
        <div className="grid gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <MapPin className="size-4 text-orange-600" />
            {facility.location}
          </span>
          <span className="flex items-center gap-2">
            <Users className="size-4 text-orange-600" />
            Kapasitas {facility.capacity} orang
          </span>
        </div>
        <Link href={`/facilities/${facility.id}`} className={buttonVariants({ variant: "outline", className: "w-full" })}>
          Lihat detail
        </Link>
      </CardContent>
    </Card>
  );
}
