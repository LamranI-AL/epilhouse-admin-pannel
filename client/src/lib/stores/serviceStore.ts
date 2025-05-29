import { create } from 'zustand';
import { ServiceWithAgents } from '@/types';

interface ServiceState {
  services: ServiceWithAgents[];
  selectedService: ServiceWithAgents | null;
  isLoading: boolean;
  error: string | null;
  setServices: (services: ServiceWithAgents[]) => void;
  setSelectedService: (service: ServiceWithAgents | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addService: (service: ServiceWithAgents) => void;
  updateService: (id: number, service: Partial<ServiceWithAgents>) => void;
  removeService: (id: number) => void;
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  selectedService: null,
  isLoading: false,
  error: null,
  setServices: (services) => set({ services }),
  setSelectedService: (selectedService) => set({ selectedService }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  addService: (service) => set((state) => ({ 
    services: [...state.services, service] 
  })),
  updateService: (id, updatedService) => set((state) => ({
    services: state.services.map(service => 
      service.id === id ? { ...service, ...updatedService } : service
    )
  })),
  removeService: (id) => set((state) => ({
    services: state.services.filter(service => service.id !== id)
  })),
}));
