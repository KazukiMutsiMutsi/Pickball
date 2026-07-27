import { apiRequest } from '@/src/api/client';
import { ENDPOINTS } from '@/src/api/endpoints';

export interface Court {
  id: string;
  name: string;
  display_name: string;
  sport: string;
  location: string;
  description?: string;
  hourly_rate: number;
  is_active: boolean;
}

export interface SlotStatus {
  slot: string;
  status: 'open' | 'pending' | 'booked';
}

export interface CourtAvailability {
  courtId: string;
  court: Pick<Court, 'name' | 'display_name' | 'hourly_rate' | 'location'>;
  date: string;
  availability: SlotStatus[];
  availableCount: number;
}

export interface AvailabilityGrid {
  date: string;
  courts: { id: string; name: string; displayName: string; hourlyRate: number }[];
  grid: {
    slot: string;
    label: string;
    courts: Record<string, 'open' | 'pending' | 'booked'>;
  }[];
}

export interface GcashSettings {
  phone_number: string;
  account_name: string;
}

export const courtsService = {
  /** List all active courts */
  async getAll(): Promise<Court[]> {
    const data = await apiRequest<{ courts: Court[] }>(ENDPOINTS.courts.list);
    return data.courts;
  },

  /** Availability grid for all courts on a given date */
  async getAvailabilityGrid(date: string): Promise<AvailabilityGrid> {
    return apiRequest<AvailabilityGrid>(
      `${ENDPOINTS.courts.availability}?date=${date}`,
    );
  },

  /** Slot status for a single court on a given date */
  async getCourtAvailability(courtId: string, date: string): Promise<CourtAvailability> {
    return apiRequest<CourtAvailability>(
      `${ENDPOINTS.courts.courtAvail(courtId)}?date=${date}`,
    );
  },

  /** GCash payment details to show at payment step */
  async getGcash(): Promise<GcashSettings> {
    const data = await apiRequest<{ gcash: GcashSettings }>(ENDPOINTS.courts.gcash);
    return data.gcash;
  },
};
