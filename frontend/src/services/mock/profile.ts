import { AgentPreferences, UserProfile } from '../../types';
import { USE_MOCK } from '../config';
import { getAgentPreferences as apiGetAgentPreferences, getProfile as apiGetProfile, updateAgentPreferences as apiUpdateAgentPreferences, updateProfile as apiUpdateProfile } from '../api';
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
  if (!USE_MOCK) return apiGetProfile();
  return delay({ ...profile });
}

export function updateProfile(patch: Partial<UserProfile>): Promise<UserProfile> {
  if (!USE_MOCK) return apiUpdateProfile(patch);
  profile = { ...profile, ...patch };
  return delay({ ...profile }, 250);
}

export function getAgentPreferences(): Promise<AgentPreferences> {
  if (!USE_MOCK) return apiGetAgentPreferences();
  return delay({ ...preferences });
}

export function updateAgentPreferences(patch: Partial<AgentPreferences>): Promise<AgentPreferences> {
  if (!USE_MOCK) return apiUpdateAgentPreferences(patch);
  preferences = { ...preferences, ...patch };
  return delay({ ...preferences }, 200);
}
