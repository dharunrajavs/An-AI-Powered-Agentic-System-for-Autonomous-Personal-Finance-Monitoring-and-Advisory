import React from 'react';
import { Text } from 'react-native';
import { AgentInsight } from '../../types';
import { Card } from '../ui';

interface AgentAnnualSummaryProps {
  insights: AgentInsight[];
}

const FALLBACK_MESSAGE = 'You spent 12% less than last year in dining.';

// Splits a message around its first percentage figure so the number can be
// highlighted in gold while the rest of the sentence stays plain white text.
function renderHighlighted(message: string) {
  const match = message.match(/\d+(\.\d+)?%/);
  if (!match || match.index === undefined) {
    return <Text className="text-white font-heading-semibold text-base leading-6">{message}</Text>;
  }

  const before = message.slice(0, match.index);
  const highlighted = match[0];
  const after = message.slice(match.index + highlighted.length);

  return (
    <Text className="text-white font-heading-semibold text-base leading-6">
      {before}
      <Text className="text-gold font-heading-bold">{highlighted}</Text>
      {after}
    </Text>
  );
}

export function AgentAnnualSummary({ insights }: AgentAnnualSummaryProps) {
  const summary = insights.find((insight) => insight.type === 'summary');
  const message = summary?.message ?? FALLBACK_MESSAGE;

  return (
    <Card className="gap-2">
      <Text className="text-muted font-body-medium text-xs uppercase tracking-wide">Agent summary</Text>
      {renderHighlighted(message)}
    </Card>
  );
}
