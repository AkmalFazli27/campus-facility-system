export type FacilityStatus = "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE";

export type Facility = {
  id: number;
  name: string;
  type: string;
  location: string;
  capacity: number;
  description: string | null;
  status: FacilityStatus;
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
