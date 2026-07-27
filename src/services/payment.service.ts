import { apiRequest } from '@/src/api/client';

export interface GcashPaymentResponse {
  checkoutUrl: string;
  linkId: string;
  bookingRef: string;
  amount: number;
}

export interface PaymentStatusResponse {
  bookingId: string;
  bookingRef: string;
  status: string;
  paymentMethod: string;
  amount: number;
}

export const paymentService = {
  /** Create a PayMongo GCash payment link for a booking */
  async createGcashLink(
    bookingId: string,
    token: string,
  ): Promise<GcashPaymentResponse> {
    return apiRequest<GcashPaymentResponse>('/api/payments/gcash', {
      method: 'POST',
      body:   JSON.stringify({ bookingId }),
      token,
    });
  },

  /** Poll booking payment status */
  async getStatus(
    bookingId: string,
    token: string,
  ): Promise<PaymentStatusResponse> {
    return apiRequest<PaymentStatusResponse>(
      `/api/payments/status/${bookingId}`,
      { token },
    );
  },
};
