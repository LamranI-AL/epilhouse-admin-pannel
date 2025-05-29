import { create } from 'zustand';
import { LocationWithAgents } from '@/types';

interface LocationState {
  locations: LocationWithAgents[];
  selectedLocation: LocationWithAgents | null;
  isLoading: boolean;
  error: string | null;
  setLocations: (locations: LocationWithAgents[]) => void;
  setSelectedLocation: (location: LocationWithAgents | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addLocation: (location: LocationWithAgents) => void;
  updateLocation: (id: number, location: Partial<LocationWithAgents>) => void;
  removeLocation: (id: number) => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  locations: [],
  selectedLocation: null,
  isLoading: false,
  error: null,
  setLocations: (locations) => set({ locations }),
  setSelectedLocation: (selectedLocation) => set({ selectedLocation }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  addLocation: (location) => set((state) => ({ 
    locations: [...state.locations, location] 
  })),
  updateLocation: (id, updatedLocation) => set((state) => ({
    locations: state.locations.map(location => 
      location.id === id ? { ...location, ...updatedLocation } : location
    )
  })),
  removeLocation: (id) => set((state) => ({
    locations: state.locations.filter(location => location.id !== id)
  })),
}));
