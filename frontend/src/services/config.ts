export const FEATURE_FLAGS = {
  investments: true,
};

// To enable Supabase: set USE_MOCK = false and add real credentials in supabase/config.ts.
// Local-first mode uses the AsyncStorage-backed store as the single source of truth.
export const USE_MOCK = true;

export const AGENT_INSIGHTS_POLL_MS = 30_000;
