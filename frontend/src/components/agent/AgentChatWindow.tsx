import React, { useEffect, useRef, useState } from 'react';
import { FlatList, ListRenderItemInfo, Text, View } from 'react-native';
import { useChatMessages } from '../../hooks';
import { useUiStore } from '../../store/uiStore';
import { ChatMessage } from '../../types';
import { formatRelativeTime } from '../../utils';
import { EmptyState, ErrorState, LoadingSkeletonList } from '../ui';

const STREAM_STEPS = 18;
const STREAM_INTERVAL_MS = 35;

export function AgentChatWindow() {
  const { data: messages, isLoading, isError, refetch } = useChatMessages();
  const reducedMotion = useUiStore((s) => s.reducedMotion);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const prevCountRef = useRef(0);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [visibleChars, setVisibleChars] = useState(0);

  // Detect a newly-arrived agent message (vs. the initial history load) and
  // kick off a fake "streaming" reveal for it (skipped under reduced motion).
  useEffect(() => {
    if (!messages) return;
    const prevCount = prevCountRef.current;
    prevCountRef.current = messages.length;
    if (!reducedMotion && prevCount > 0 && messages.length > prevCount) {
      const last = messages[messages.length - 1];
      if (last.role === 'agent') {
        setStreamingId(last.id);
        setVisibleChars(0);
      }
    }
  }, [messages, reducedMotion]);

  // Progressively reveal the streaming message's characters over ~18 steps.
  useEffect(() => {
    if (!streamingId || !messages) return;
    const target = messages.find((m) => m.id === streamingId);
    if (!target || target.text.length === 0) {
      setStreamingId(null);
      return;
    }
    const text = target.text;
    const step = Math.max(1, Math.ceil(text.length / STREAM_STEPS));
    let current = 0;
    const interval = setInterval(() => {
      current += step;
      if (current >= text.length) {
        setVisibleChars(text.length);
        clearInterval(interval);
        setStreamingId(null);
      } else {
        setVisibleChars(current);
      }
    }, STREAM_INTERVAL_MS);
    return () => clearInterval(interval);
    // Only re-run when a new message starts streaming.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamingId]);

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const timeout = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(timeout);
  }, [messages, visibleChars]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-end py-4">
        <LoadingSkeletonList rows={4} rowHeight={56} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center">
        <ErrorState message="We couldn't load your conversation." onRetry={() => refetch()} />
      </View>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <EmptyState title="No messages yet" message="Ask your advisor anything about your money." />
      </View>
    );
  }

  const renderItem = ({ item }: ListRenderItemInfo<ChatMessage>) => {
    const isStreaming = item.id === streamingId;
    const displayText = isStreaming ? item.text.slice(0, visibleChars) : item.text;
    const isUser = item.role === 'user';

    return (
      <View className={`flex-row px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <View
          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
            isUser ? 'bg-primary rounded-br-md' : 'bg-surface-container-low border border-outline-variant/30 rounded-bl-md'
          }`}
        >
          <Text className={`font-body text-sm leading-5 ${isUser ? 'text-on-primary' : 'text-on-surface'}`}>
            {displayText}
          </Text>
          <Text className={`font-body text-[10px] mt-1 ${isUser ? 'text-on-primary/60' : 'text-on-surface-variant'}`}>
            {formatRelativeTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      ref={listRef}
      className="flex-1"
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ paddingVertical: 12, gap: 10 }}
      onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      keyboardShouldPersistTaps="handled"
    />
  );
}
