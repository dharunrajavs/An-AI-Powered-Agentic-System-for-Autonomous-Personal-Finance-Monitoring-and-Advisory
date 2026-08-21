const AI_PROVIDER = process.env.EXPO_PUBLIC_AI_PROVIDER ?? 'openai';
const AI_MODEL = process.env.EXPO_PUBLIC_AI_MODEL ?? 'gpt-4o-mini';
const AI_API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY ?? '';
const AI_API_URL = process.env.EXPO_PUBLIC_AI_API_URL ?? 'https://api.openai.com/v1';

export const AI_CONFIG = {
  provider: AI_PROVIDER,
  model: AI_MODEL,
  apiKey: AI_API_KEY,
  apiUrl: AI_API_URL,
  enabled: AI_PROVIDER !== 'none' && AI_API_KEY.length > 0,
};
