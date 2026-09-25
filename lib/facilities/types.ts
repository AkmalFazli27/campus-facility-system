export type FacilityStatus = "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE";

export type FacilityAvailabilitySummary = {
  date: string;
  totalSlots: number;
  availableSlots: number;
  unavailableSlots: number;
  slots: FacilityAvailabilitySlot[];
  unavailableRanges: Array<{
    start: string;
    end: string;
    reason: string;
  }>;
};

export type FacilityAvailabilitySlot = {
  start: string;
  end: string;
  available: boolean;
  reason: string | null;
};

export type Facility = {
  id: number;
  name: string;
  type: string;
  location: string;
  capacity: number;
  description: string | null;
  status: FacilityStatus;
  availability?: FacilityAvailabilitySummary;
};

export type FilterState = {
  query: string;
  type: string;
  location: string;
  capacityMin: string;
  capacityMax: string;
  date: string;
};

export type ApiResponse = {
  success: boolean;
  data?: Facility[];
  message?: string;
  meta?: {
    locations?: string[];
  };
};
