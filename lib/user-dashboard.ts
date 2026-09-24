export type DashboardReservationTime = {
  reservationDate: Date;
  endTime: Date;
};

export function reservationEndInstant(value: DashboardReservationTime): Date {
  const date = value.reservationDate.toISOString().slice(0, 10);
  const time = value.endTime.toISOString().slice(11, 16);
  return new Date(`${date}T${time}:00+07:00`);
}

export function isReservationFinished(
  value: DashboardReservationTime,
  now: Date = new Date(),
): boolean {
  return reservationEndInstant(value) <= now;
}

export function userTypeLabel(value: "MAHASISWA" | "DOSEN" | "TENDIK"): string {
  return {
    MAHASISWA: "Mahasiswa",
    DOSEN: "Dosen",
    TENDIK: "Tenaga kependidikan",
  }[value];
}
