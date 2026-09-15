import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { buildFacilitySearchUrl, facilityStatusLabel } from "@/lib/landing";

export type FacilityPreview = {
  id: number;
  name: string;
  type: string;
  location: string;
  capacity: number;
  status: "ACTIVE" | "UNDER_MAINTENANCE" | "INACTIVE";
};

const STATUS_BADGE_CLASS: Record<FacilityPreview["status"], string> = {
  ACTIVE: "border-success/30 bg-success/10 text-success",
  UNDER_MAINTENANCE: "border-warning/30 bg-warning/10 text-warning",
  INACTIVE: "border-ink-400/30 bg-ink-400/10 text-ink-600",
};

export default function FacilityPreviewCard({
  facility,
}: {
  facility: FacilityPreview;
}) {
  return (
    <Card className="rounded-3xl transition-shadow hover:shadow-lg hover:shadow-brand-100">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardDescription className="text-xs font-bold tracking-wider uppercase">
            {facility.type} • {facility.location}
          </CardDescription>
          <Badge
            variant="outline"
            className={cn(STATUS_BADGE_CLASS[facility.status])}
          >
            {facilityStatusLabel(facility.status)}
          </Badge>
        </div>
        <CardTitle className="text-lg">{facility.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-ink-600">
          <Users aria-hidden className="size-4" />
          Kapasitas {facility.capacity}
          <MapPin aria-hidden className="ml-2 size-4" />
          {facility.location}
        </span>
        <Link
          href={buildFacilitySearchUrl({ type: facility.type })}
          className="rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold text-brand-600 transition-colors hover:bg-brand-500 hover:text-white"
        >
          Cek ketersediaan
        </Link>
      </CardContent>
    </Card>
  );
}
