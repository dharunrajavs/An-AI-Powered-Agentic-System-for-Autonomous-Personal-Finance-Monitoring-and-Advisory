import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFilterStore } from '../../store/filterStore';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function daysAgoISO(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toISODate(date);
}

function startOfThisMonthISO(): string {
  const now = new Date();
  return toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
}

function startOfThisWeekISO(): string {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? 6 : day - 1;
  return daysAgoISO(diffToMonday);
}

const PRESETS: { label: string; start: string | null; end: string | null }[] = [
  { label: 'Today', start: toISODate(new Date()), end: toISODate(new Date()) },
  { label: 'Week', start: startOfThisWeekISO(), end: null },
  { label: 'Month', start: startOfThisMonthISO(), end: null },
  { label: 'All', start: null, end: null },
];

export function DateRangePicker() {
  const dateRange = useFilterStore((s) => s.dateRange);
  const setDateRange = useFilterStore((s) => s.setDateRange);

  return (
    <View className="flex-row self-start gap-1 mb-2.5">
      {PRESETS.map((preset) => {
        const active = dateRange.start === preset.start && dateRange.end === preset.end;
        return (
          <Pressable
            key={preset.label}
            onPress={() => setDateRange({ start: preset.start, end: preset.end })}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className={`px-1.5 py-0.5 rounded-full border ${active ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
          >
            <Text className={`font-body-medium text-[10px] ${active ? 'text-on-primary' : 'text-on-surface'}`}>
              {preset.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
