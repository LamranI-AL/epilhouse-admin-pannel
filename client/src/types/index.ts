export interface DashboardMetrics {
  totalBookings: number;
  revenue: number;
  workingHours: number;
  newCustomers: number;
  bookingTrend: Array<{date: string, count: number}>;
  revenueTrend: Array<{date: string, revenue: number}>;
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
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  color: string;
}

export interface ServiceWithAgents {
  id: number;
  name: string;
  description: string | null;
  duration: number;
  price: string;
  capacity: number;
  category: string;
  color: string;
  isActive: boolean;
  assignedAgents: Array<{
    id: number;
    firstName: string;
    lastName: string;
    displayName: string | null;
  }>;
}

export interface AgentWithDetails {
  id: number;
  firstName: string;
  lastName: string;
  displayName: string | null;
  email: string;
  phone: string | null;
  title: string | null;
  bio: string | null;
  workingDays: string[] | null;
  workingHours: {start: string, end: string} | null;
  highlights: Array<{value: string, label: string}> | null;
  status: string;
  isOnLeave: boolean;
  totalBookings: number;
  assignedLocations: Array<{
    id: number;
    name: string;
  }>;
  assignedServices: Array<{
    id: number;
    name: string;
    color: string;
  }>;
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

export interface LocationWithAgents {
  id: number;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string | null;
  email: string | null;
  coordinates: {lat: number, lng: number} | null;
  workingHours: Record<string, {start: string, end: string}> | null;
  isActive: boolean;
  assignedAgents: Array<{
    id: number;
    firstName: string;
    lastName: string;
    displayName: string | null;
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
