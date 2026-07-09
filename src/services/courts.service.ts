import { Court } from '@/src/components/CourtCard';

export const courtsService = {
  async getAll(): Promise<Court[]> {
    throw new Error('courtsService.getAll not implemented');
  },

  async getById(_id: string): Promise<Court> {
    throw new Error('courtsService.getById not implemented');
  },
};
