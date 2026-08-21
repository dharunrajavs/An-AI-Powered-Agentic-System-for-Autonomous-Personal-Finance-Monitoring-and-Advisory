import { create } from 'zustand';
import { AgentStatus } from '../types';

interface AgentState {
  status: AgentStatus;
  lastCheckedAt: string;
  setStatus: (status: AgentStatus) => void;
  touchLastChecked: () => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  status: 'monitoring',
  lastCheckedAt: new Date().toISOString(),
  setStatus: (status) => set({ status }),
  touchLastChecked: () => set({ lastCheckedAt: new Date().toISOString() }),
}));
