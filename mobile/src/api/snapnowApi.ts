import api, { saveCookieFromResponse } from './client';

export type UserRole = 'customer' | 'photographer' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  profileImageUrl?: string;
  role: UserRole;
  createdAt: string;
  hasPhotographerProfile?: boolean;
}

export type VerificationStatus = 'pending_review' | 'verified' | 'rejected';

export interface PhotographerProfile {
  id: string;
  userId: string;
  hourlyRate: string | number;
  city?: string;
  latitude: string | number;
  longitude: string | number;
  bio?: string;
  portfolio?: string[];
  portfolioImages?: string[];
  verificationStatus: VerificationStatus;
  instagramUrl?: string;
  websiteUrl?: string;
  profilePicture?: string;
  profileImageUrl?: string;
  rating?: string | number | null;
  reviewCount?: number;
  fullName?: string;
  location?: string;
  sessionState?: 'available' | 'in_session' | 'offline';
  nextAvailableAt?: string | null;
}

export interface Booking {
  id: string;
  customerId: string;
  photographerId: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  location: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'expired' | 'declined' | 'in_progress' | 'photos_pending';
  totalAmount: string;
  platformFee: string;
  photographerEarnings: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  photographer?: PhotographerProfile & { user?: User };
  customer?: User;
  meetingLatitude?: string | null;
  meetingLongitude?: string | null;
  meetingNotes?: string | null;
}

export interface Earning {
  id: string;
  photographerId: string;
  bookingId: string;
  grossAmount: string;
  platformFee: string;
  netAmount: string;
  status: 'held' | 'pending' | 'paid';
  createdAt: string;
  releasedAt?: string | null;
  paidAt?: string | null;
}

export interface EditingRequest {
  id: string;
  bookingId: string;
  status: 'requested' | 'accepted' | 'in_progress' | 'delivered' | 'completed' | 'revision_requested' | 'declined';
  photoCount?: number;
  totalAmount: string;
  platformFee: string;
  photographerEarnings: string;
  customerNotes?: string;
  requestedPhotoUrls?: string[];
  editedPhotoUrls?: string[];
  revisionCount?: number;
  createdAt: string;
  booking?: Booking;
}

export const snapnowApi = {
  async login(payload: { email: string; password: string }): Promise<User> {
    const response = await api.post<User>('/api/auth/login', payload);
    // Explicitly save cookie before returning - don't rely on async interceptor
    await saveCookieFromResponse(response);
    return response.data;
  },

  async register(payload: { email: string; password: string; fullName: string; role: UserRole }): Promise<User> {
    const response = await api.post<User>('/api/auth/register', payload);
    // Explicitly save cookie before returning
    await saveCookieFromResponse(response);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/api/auth/logout');
  },

  async me(): Promise<User | null> {
    try {
      const response = await api.get<User>('/api/auth/me');
      return response.data;
    } catch {
      return null;
    }
  },

  async mePhotographer(): Promise<PhotographerProfile | null> {
    try {
      const response = await api.get<PhotographerProfile>('/api/photographers/me');
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async createPhotographerProfile(data: {
    hourlyRate: number;
    city: string;
    latitude: number;
    longitude: number;
    bio?: string;
    instagramUrl: string;
    websiteUrl?: string;
  }): Promise<PhotographerProfile> {
    const response = await api.post<PhotographerProfile>('/api/photographers', data);
    return response.data;
  },

  async getPhotographers(params?: { city?: string; lat?: number; lng?: number; radius?: number }): Promise<PhotographerProfile[]> {
    const response = await api.get<PhotographerProfile[]>('/api/photographers', { params });
    return response.data;
  },

  async getPhotographer(id: string): Promise<PhotographerProfile> {
    const response = await api.get<PhotographerProfile>(`/api/photographers/${id}`);
    return response.data;
  },

  async getBookings(): Promise<Booking[]> {
    const response = await api.get<Booking[]>('/api/customer/bookings');
    return response.data;
  },

  async getPhotographerBookings(photographerId: string): Promise<Booking[]> {
    const response = await api.get<Booking[]>(`/api/bookings/photographer/${photographerId}`);
    return response.data;
  },

  async getBooking(id: string): Promise<Booking> {
    const response = await api.get<Booking>(`/api/bookings/${id}`);
    return response.data;
  },

  async createBooking(data: {
    photographerId: string;
    scheduledDate: string;
    scheduledTime: string;
    duration: number;
    location: string;
  }): Promise<Booking> {
    const response = await api.post<Booking>('/api/bookings', data);
    return response.data;
  },

  async updateBookingStatus(bookingId: string, status: string): Promise<Booking> {
    const response = await api.patch<Booking>(`/api/bookings/${bookingId}/status`, { status });
    return response.data;
  },

  async getEarnings(): Promise<Earning[]> {
    const response = await api.get<Earning[]>('/api/earnings');
    return response.data;
  },

  async getPhotographerEarnings(photographerId: string): Promise<Earning[]> {
    const response = await api.get<Earning[]>(`/api/earnings/photographer/${photographerId}`);
    return response.data;
  },

  async getPhotographerEditingRequests(photographerId: string): Promise<EditingRequest[]> {
    const response = await api.get<EditingRequest[]>(`/api/editing-requests/photographer/${photographerId}`);
    return response.data;
  },

  // Photo delivery methods
  async getPhotoDelivery(bookingId: string): Promise<{ id: string; photos: string[]; message?: string } | null> {
    try {
      const response = await api.get(`/api/bookings/${bookingId}/photos`);
      return response.data;
    } catch {
      return null;
    }
  },

  async getUploadUrl(): Promise<{ uploadURL: string; objectPath: string }> {
    const response = await api.post('/api/objects/upload');
    return response.data;
  },

  async addPhotoToDelivery(bookingId: string, imageUrl: string): Promise<{ photos: string[] }> {
    const response = await api.post(`/api/bookings/${bookingId}/photos/upload`, { imageUrl });
    return response.data;
  },

  async savePhotoDelivery(bookingId: string, message?: string): Promise<void> {
    await api.post(`/api/bookings/${bookingId}/photos`, { message });
  },

  async dismissBooking(bookingId: string): Promise<void> {
    await api.post(`/api/bookings/${bookingId}/dismiss`);
  },

  // Stripe payment methods
  async getStripeConfig(): Promise<{ configured: boolean; publishableKey?: string }> {
    const response = await api.get('/api/stripe/config');
    return response.data;
  },

  async createPaymentIntent(amount: number, photographerName: string): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const response = await api.post('/api/stripe/create-payment-intent', { amount, photographerName });
    return response.data;
  },

  async cancelPaymentIntent(paymentIntentId: string): Promise<void> {
    await api.post('/api/stripe/cancel-payment-intent', { paymentIntentId });
  },

  async createBookingWithPayment(data: {
    photographerId: string;
    scheduledDate: string;
    scheduledTime: string;
    duration: number;
    location: string;
    stripePaymentIntentId?: string;
  }): Promise<Booking> {
    const response = await api.post<Booking>('/api/bookings', data);
    return response.data;
  },

  // Live location sharing methods
  async updateLiveLocation(bookingId: string, data: { latitude: number; longitude: number; accuracy: number; userType: 'customer' | 'photographer' }): Promise<void> {
    await api.post(`/api/bookings/${bookingId}/live-location`, data);
  },

  async deleteLiveLocation(bookingId: string): Promise<void> {
    await api.delete(`/api/bookings/${bookingId}/live-location`);
  },

  async getOtherPartyLocation(bookingId: string, userType: 'customer' | 'photographer'): Promise<{ latitude: string; longitude: string; updatedAt: string } | null> {
    try {
      const endpoint = userType === 'customer'
        ? `/api/bookings/${bookingId}/photographer-location`
        : `/api/bookings/${bookingId}/live-location`;
      const response = await api.get(endpoint);
      return response.data;
    } catch {
      return null;
    }
  },

  // Mobile payment session (token-based auth for WebView checkout)
  async createMobilePaymentSession(data: {
    photographerId: string;
    duration: number;
    location: string;
    scheduledDate: string;
    scheduledTime: string;
    amount: number;
    photographerName: string;
  }): Promise<{ token: string; expiresIn: number }> {
    const response = await api.post('/api/mobile/create-payment-session', data);
    return response.data;
  },
};
