import { AI_CONFIG } from './config';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface ChatCompletionResponse {
  id: string;
  choices: {
    message: { role: string; content: string };
    finish_reason: string;
  }[];
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number; max_tokens?: number },
): Promise<string> {
  if (!AI_CONFIG.enabled) {
    throw new Error('AI is not configured. Set EXPO_PUBLIC_AI_API_KEY in your .env file.');
  }

  const body: ChatCompletionRequest = {
    model: AI_CONFIG.model,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.max_tokens ?? 500,
  };

  const response = await fetch(`${AI_CONFIG.apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_CONFIG.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`AI API error (${response.status}): ${errorText}`);
  }

  const data: ChatCompletionResponse = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('AI returned an empty response');
  }

  return content.trim();
}
