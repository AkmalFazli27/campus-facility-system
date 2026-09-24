"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ReservationDetailDialog from "@/components/custom/reservations/ReservationDetailDialog";

export default function UserDashboardReservationAction({
  reservationId,
}: {
  reservationId: number;
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <>
      <Button variant="outline" onClick={() => setOpenId(reservationId)}>
        Lihat detail
      </Button>
      <ReservationDetailDialog
        reservationId={openId}
        onClose={() => setOpenId(null)}
        onCancelled={() => {
          setOpenId(null);
          router.refresh();
        }}
      />
    </>
  );
}
