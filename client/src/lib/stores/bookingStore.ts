import { create } from 'zustand';
import { BookingWithDetails } from '@/types';

interface BookingState {
  bookings: BookingWithDetails[];
  selectedBooking: BookingWithDetails | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    serviceId?: number;
    agentId?: number;
    locationId?: number;
    status?: string;
    date?: string;
  };
  setBookings: (bookings: BookingWithDetails[]) => void;
  setSelectedBooking: (booking: BookingWithDetails | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: BookingState['filters']) => void;
  addBooking: (booking: BookingWithDetails) => void;
  updateBooking: (id: number, booking: Partial<BookingWithDetails>) => void;
  removeBooking: (id: number) => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  selectedBooking: null,
  isLoading: false,
  error: null,
  filters: {},
  setBookings: (bookings) => set({ bookings }),
  setSelectedBooking: (selectedBooking) => set({ selectedBooking }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set({ filters }),
  addBooking: (booking) => set((state) => ({ 
    bookings: [...state.bookings, booking] 
  })),
  updateBooking: (id, updatedBooking) => set((state) => ({
    bookings: state.bookings.map(booking => 
      booking.id === id ? { ...booking, ...updatedBooking } : booking
    )
  })),
  removeBooking: (id) => set((state) => ({
    bookings: state.bookings.filter(booking => booking.id !== id)
  })),
}));
