import { db } from "@/lib/db";

const facilityDetailSelect = {
  id: true,
  name: true,
  type: true,
  location: true,
  capacity: true,
  description: true,
  status: true,
} as const;

export function getFacilityById(id: number) {
  return db.facility.findUnique({
    where: { id },
    select: facilityDetailSelect,
  });
}
