import { AgentInsight } from '../../types';
import { USE_MOCK } from '../config';
import { dismissInsight as apiDismissInsight, getAgentInsights as apiGetAgentInsights } from '../api';
import { delay } from './delay';

const insights: AgentInsight[] = [
  {
    id: 'insight_001',
    type: 'alert',
    message: "Your dining spend is 34% above last month's average — consider reducing restaurant visits this week.",
    severity: 'medium',
    createdAt: '2026-07-06T14:20:00Z',
    relatedEntity: 'Food & Drink',
  },
  {
    id: 'insight_002',
    type: 'alert',
    message: 'Unusual ₹340 Amazon charge detected on your Chase Sapphire card — much larger than your typical purchase.',
    severity: 'high',
    createdAt: '2026-07-05T09:05:00Z',
    relatedEntity: 'txn_004',
  },
  {
    id: 'insight_003',
    type: 'suggestion',
    message: "Increase your Hawaii Trip contribution by ₹50/mo to hit your target 2 months early.",
    severity: 'low',
    createdAt: '2026-07-04T11:00:00Z',
    relatedEntity: 'goal_002',
  },
  {
    id: 'insight_004',
    type: 'summary',
    message: 'Weekly digest: you spent ₹1,842 across 18 transactions, 6% less than last week.',
    severity: 'low',
    createdAt: '2026-07-01T08:00:00Z',
  },
  {
    id: 'insight_005',
    type: 'alert',
    message: 'Shopping budget is 13% over its ₹300 monthly limit — mostly driven by two Amazon orders.',
    severity: 'medium',
    createdAt: '2026-06-29T16:40:00Z',
    relatedEntity: 'bud_005',
  },
  {
    id: 'insight_006',
    type: 'suggestion',
    message: "You're on track to hit your New Car Down Payment goal in 3 weeks — want to set up the transfer now?",
    severity: 'low',
    createdAt: '2026-06-27T10:15:00Z',
    relatedEntity: 'goal_003',
  },
];

export function getAgentInsights(): Promise<AgentInsight[]> {
  if (!USE_MOCK) return apiGetAgentInsights();
  return delay([...insights].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)));
}

export function dismissInsight(id: string): Promise<{ success: true }> {
  if (!USE_MOCK) return apiDismissInsight(id);
  const idx = insights.findIndex((i) => i.id === id);
  if (idx >= 0) insights.splice(idx, 1);
  return delay({ success: true }, 200);
}
