import { Booking } from '@/src/components/BookingCard';

export interface CreateBookingPayload {
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export const bookingsService = {
  async getAll(): Promise<Booking[]> {
    throw new Error('bookingsService.getAll not implemented');
  },

  async create(_payload: CreateBookingPayload): Promise<Booking> {
    throw new Error('bookingsService.create not implemented');
  },

  async cancel(_id: string): Promise<void> {
    throw new Error('bookingsService.cancel not implemented');
  },
};
