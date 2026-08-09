export const FEATURE_FLAGS = {
  investments: true,
};

// Frontend-only build: no backend exists yet. USE_MOCK stays true and
// src/services/api holds typed stubs with matching signatures for when
// a real backend is wired up — swapping is a one-line change per function.
// To enable Supabase: set USE_MOCK = false and add real credentials in supabase/config.ts.
export const USE_MOCK = true;

export const AGENT_INSIGHTS_POLL_MS = 30_000;
