import { AgentAction } from '../../types';
import { USE_MOCK } from '../config';
import { getAgentActions as apiGetAgentActions, updateAgentActionStatus as apiUpdateAgentActionStatus } from '../api';
import { delay } from './delay';

let actions: AgentAction[] = [
  { id: 'action_001', description: 'Flagged unusual ₹340 charge at Amazon for review', timestamp: '2026-07-05T09:05:00Z', status: 'proposed' },
  { id: 'action_002', description: 'Flagged 4th Starbucks charge this week as a spending-pace outlier', timestamp: '2026-06-21T18:30:00Z', status: 'proposed' },
  { id: 'action_003', description: 'Sent overspend alert for Shopping category', timestamp: '2026-06-29T16:40:00Z', status: 'executed' },
  { id: 'action_004', description: 'Auto-categorized 6 new transactions from Chase Sapphire Credit Card', timestamp: '2026-06-28T07:00:00Z', status: 'executed' },
  { id: 'action_005', description: 'Suggested increasing Hawaii Trip contribution by ₹50/mo', timestamp: '2026-07-04T11:00:00Z', status: 'proposed' },
  { id: 'action_006', description: 'Muted duplicate bill-due reminder for Verizon Wireless', timestamp: '2026-06-23T09:00:00Z', status: 'undone' },
  { id: 'action_007', description: 'Generated weekly spending digest', timestamp: '2026-07-01T08:00:00Z', status: 'executed' },
  { id: 'action_008', description: 'Rebalanced budget rollover from Entertainment to Groceries', timestamp: '2026-06-18T12:00:00Z', status: 'executed' },
];

export function getAgentActions(): Promise<AgentAction[]> {
  if (!USE_MOCK) return apiGetAgentActions();
  return delay([...actions].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)));
}

export function updateAgentActionStatus(id: string, status: AgentAction['status']): Promise<AgentAction | undefined> {
  if (!USE_MOCK) return apiUpdateAgentActionStatus(id, status);
  const idx = actions.findIndex((a) => a.id === id);
  if (idx >= 0) actions[idx] = { ...actions[idx], status };
  return delay(actions[idx], 200);
}
