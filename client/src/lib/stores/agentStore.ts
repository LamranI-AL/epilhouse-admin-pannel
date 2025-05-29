import { create } from 'zustand';
import { AgentWithDetails } from '@/types';

interface AgentState {
  agents: AgentWithDetails[];
  selectedAgent: AgentWithDetails | null;
  isLoading: boolean;
  error: string | null;
  setAgents: (agents: AgentWithDetails[]) => void;
  setSelectedAgent: (agent: AgentWithDetails | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addAgent: (agent: AgentWithDetails) => void;
  updateAgent: (id: number, agent: Partial<AgentWithDetails>) => void;
  removeAgent: (id: number) => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: [],
  selectedAgent: null,
  isLoading: false,
  error: null,
  setAgents: (agents) => set({ agents }),
  setSelectedAgent: (selectedAgent) => set({ selectedAgent }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  addAgent: (agent) => set((state) => ({ 
    agents: [...state.agents, agent] 
  })),
  updateAgent: (id, updatedAgent) => set((state) => ({
    agents: state.agents.map(agent => 
      agent.id === id ? { ...agent, ...updatedAgent } : agent
    )
  })),
  removeAgent: (id) => set((state) => ({
    agents: state.agents.filter(agent => agent.id !== id)
  })),
}));
