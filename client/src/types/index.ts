/** @format */

export interface DashboardMetrics {
  totalBookings: number;
  revenue: number;
  workingHours: number;
  newCustomers: number;
  bookingTrend: Array<{ date: string; count: number }>;
  revenueTrend: Array<{ date: string; revenue: number }>;
}

export interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  serviceType: string;
  serviceName: string;
  agentId: string;
  agentName: string;
  locationId: string;
  clientName: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  color: string;
}

export interface ServiceWithAgents {
  id: string;
  name: string;
  categoryId? : string
  description: string | null;
  subServices: Array<{
    id: string;
    name: string;
    description: string | null;
    duration: number;
    normalPrice: number;
    discountPrice: number;
  }>;
  color: string;
  isActive: boolean;
  updatedAt: Date;
  createdAt: Date;
  assignedAgents: Array<{
    id: string;
    firstName: string;
    lastName: string;
    displayName: string | null;
  }>;
}

export interface AgentWithDetails {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  email: string;
  phone: string | null;
  title: string | null;
  role: "user" | "admin" | "superAdmin";
  bio: string | null;
  password: string;
  workingDays: string[] | null;
  workingHours: { start: string; end: string } | null;
  highlights: Array<{ value: string; label: string }> | null;
  status: string;
  isOnLeave: boolean;
  totalBookings: number;
  assignedLocations: {
    id: string;
    name: string;
  };
  assignedLocationId: string;
  assignedServiceIds: Array<{
    id: string;
  }>;
  assignedServices: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface BookingWithDetails {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  totalAmount: string;
  service: {
    id: number;
    name: string;
    color: string;
    duration: number;
  };
  agent: {
    id: number;
    firstName: string;
    lastName: string;
    displayName: string | null;
  };
  client: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  location: {
    id: number;
    name: string;
  };
}
export interface QuickReservation {
  id: string;
  clientEmail: string;
  clientFirstName: string;
  clientLastName: string;
  clientPhone: string;
  selectedDate: string;
  selectedTime: string;
  totalAmount: number;
  agent: {
    // ce attrebue je veut ajouter par ce que lorsuqe approvation d'ue reservation l'agent doit etre notifier
    id: string;
    firstName: string;
    lastName: string;
  };
  status: "pending" | "confirmed" | "cancelled";
  notes: string;
  createdAt: Date;
  isRecurring: Boolean;
  locationId: string;
  selectedServices: {
    serviceId: string;
    dates: Date;
  };
  updatedAt: Date;
  userId: string;
}
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "user" | "admin" | "manager";
  isActive: boolean;
  createdAt: any;
  lastLogin: any;
  updatedAt: any;
}

export type BookingFormData = {
  selectedDate: string;
  selectedTime: string;
  selectedServices: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
  totalAmount: number;
};
export interface LocationWithAgents {
  id: number;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  location: {
    latitude: number;
    longitude: number;
  };
  phone: string | null;
  email: string | null;
  coordinates: { lat: number; lng: number } | null;
  workingHours: Record<string, { start: string; end: string }> | null;
  isActive: boolean;
  assignedAgents: Array<{
    id: number;
    firstName: string;
    lastName: string;
    displayName: string | null;
  }>;
  assignedServices: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

export interface ClientWithBookings {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  notes: string | null;
  totalBookings: number;
  nextBooking: {
    id: number;
    startTime: string;
    serviceName: string;
  } | null;
}

// export interface SubService {
//   id: string;
//   name: string;
//   normalPrice: number;
//   discountPrice?: number;
//   duration: number;
//   description?: string;
// }

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  subServices: SubService[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  categoryId: string; // Référence à la catégorie parent
  color?: string;
  isActive: boolean;
  subServices: SubService[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SubService {
  id: string;
  name: string;
  description?: string;
  normalPrice: number;
  discountPrice?: number;
  duration?: number; // en minutes
  isActive: boolean;
}
