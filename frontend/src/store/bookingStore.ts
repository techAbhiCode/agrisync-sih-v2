import { create } from 'zustand';
import { getUserBookings } from '@/lib/api';

export interface Booking {
  _id: string;
  farmerId: string;
  mandiId: string;
  cropType: string;
  quantity: number;
  preferredDate: string;
  timeSlot: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  virtualToken: string;
  createdAt: string;
}

interface BookingState {
  bookings: Booking[];
  loading: boolean;
  fetchBookings: () => Promise<void>;
  getUpcomingBookings: () => Booking[];
  getCompletedBookings: () => Booking[];
  getExpiredBookings: () => Booking[];
  getClosestUpcomingBooking: () => Booking | null;
}

export const useBookingStore = create<BookingState>()((set, get) => ({
  bookings: [],
  loading: false,

  fetchBookings: async () => {
    set({ loading: true });
    try {
      const data = await getUserBookings();
      if (data && data.success) {
        set({ bookings: data.bookings, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error("Failed to fetch bookings in store", error);
      set({ loading: false });
    }
  },

  getUpcomingBookings: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const { bookings } = get();
    return bookings.filter((b) => {
      const bDate = new Date(b.preferredDate);
      // Upcoming if status is not completed and date is >= today
      return b.status !== 'COMPLETED' && b.status !== 'REJECTED' && bDate >= today;
    }).sort((a, b) => new Date(a.preferredDate).getTime() - new Date(b.preferredDate).getTime());
  },

  getCompletedBookings: () => {
    const { bookings } = get();
    return bookings.filter((b) => b.status === 'COMPLETED').sort((a, b) => new Date(b.preferredDate).getTime() - new Date(a.preferredDate).getTime());
  },

  getExpiredBookings: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { bookings } = get();
    return bookings.filter((b) => {
      const bDate = new Date(b.preferredDate);
      // Expired if not completed and date is in the past, or if rejected
      return b.status === 'REJECTED' || (b.status !== 'COMPLETED' && bDate < today);
    }).sort((a, b) => new Date(b.preferredDate).getTime() - new Date(a.preferredDate).getTime());
  },

  getClosestUpcomingBooking: () => {
    const upcoming = get().getUpcomingBookings();
    return upcoming.length > 0 ? upcoming[0] : null;
  }
}));
