import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { monthLabel } from '../../utils';

// Cosmetic month navigator only — the mock data isn't month-partitioned, so
// switching months doesn't refetch or filter anything, it just changes the label.
export function MonthSelector() {
  const [displayedDate, setDisplayedDate] = useState(() => new Date());

  const goToPreviousMonth = () => {
    setDisplayedDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const goToNextMonth = () => {
    setDisplayedDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  return (
    <View className="flex-row items-center justify-between">
      <Pressable
        onPress={goToPreviousMonth}
        accessibilityRole="button"
        accessibilityLabel="Previous month"
        className="w-9 h-9 rounded-full bg-surface border border-border items-center justify-center active:opacity-70"
      >
        <ChevronLeft color="#EDEFF3" size={18} />
      </Pressable>
      <Text className="text-white font-heading-semibold text-base">{monthLabel(displayedDate)}</Text>
      <Pressable
        onPress={goToNextMonth}
        accessibilityRole="button"
        accessibilityLabel="Next month"
        className="w-9 h-9 rounded-full bg-surface border border-border items-center justify-center active:opacity-70"
      >
        <ChevronRight color="#EDEFF3" size={18} />
      </Pressable>
    </View>
  );
}
