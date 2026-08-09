import { AgentPreferences, UserProfile } from '../../types';
import { delay } from './delay';

let profile: UserProfile = {
  id: 'user_001',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  avatarInitials: 'AM',
};

let preferences: AgentPreferences = {
  autonomyLevel: 3,
  notifyOverspend: true,
  notifyBillDue: true,
  notifyUnusualTransaction: true,
  notifyGoalMilestone: true,
  notifyWeeklyDigest: true,
};

export function getProfile(): Promise<UserProfile> {
  return delay({ ...profile });
}

export function updateProfile(patch: Partial<UserProfile>): Promise<UserProfile> {
  profile = { ...profile, ...patch };
  return delay({ ...profile }, 250);
}

export function getAgentPreferences(): Promise<AgentPreferences> {
  return delay({ ...preferences });
}

export function updateAgentPreferences(patch: Partial<AgentPreferences>): Promise<AgentPreferences> {
  preferences = { ...preferences, ...patch };
  return delay({ ...preferences }, 200);
}
