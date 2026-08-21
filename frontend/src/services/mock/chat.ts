import { ChatMessage } from '../../types';
import { USE_MOCK } from '../config';
import { getChatMessages as apiGetChatMessages, sendChatMessage as apiSendChatMessage } from '../api';
import { delay } from './delay';

let messages: ChatMessage[] = [
  { id: 'chat_001', role: 'agent', text: "Hi Alex, I'm your finance advisor. Ask me anything about your spending, budgets, or goals.", createdAt: '2026-07-06T08:00:00Z' },
];

const CANNED_RESPONSES: Record<string, string> = {
  'why did my spending spike': "Your dining spend is 34% above last month's average, driven mostly by Chipotle and Starbucks visits. Restaurant spending accounts for ₹210 of the increase.",
  'am i on track for retirement': "Based on your current Emergency Fund and Home Down Payment contributions, you're building savings steadily, but I'd recommend setting up a dedicated retirement account — you don't have one connected yet.",
  'summarize last month': 'Last month you spent ₹6,842 total, 6% less than the month before. Rent, Groceries, and Shopping were your top three categories.',
};

export function getChatMessages(): Promise<ChatMessage[]> {
  if (!USE_MOCK) return apiGetChatMessages();
  return delay([...messages]);
}

export function sendChatMessage(text: string): Promise<ChatMessage[]> {
  if (!USE_MOCK) return apiSendChatMessage(text);
  const userMessage: ChatMessage = {
    id: `chat_${Date.now()}_u`,
    role: 'user',
    text,
    createdAt: new Date().toISOString(),
  };

  const key = Object.keys(CANNED_RESPONSES).find((k) => text.toLowerCase().includes(k));
  const replyText =
    (key && CANNED_RESPONSES[key]) ||
    "I've noted that. Based on your recent activity, your spending is broadly in line with your budgets this month, with Shopping running slightly over.";

  const agentMessage: ChatMessage = {
    id: `chat_${Date.now()}_a`,
    role: 'agent',
    text: replyText,
    createdAt: new Date().toISOString(),
  };

  messages = [...messages, userMessage, agentMessage];
  return delay([...messages], 700);
}
