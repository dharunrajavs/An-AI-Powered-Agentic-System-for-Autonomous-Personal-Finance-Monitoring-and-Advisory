import React from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { CATEGORIES } from '../../services';
import { useFilterStore } from '../../store/filterStore';

export function CategoryFilter() {
  const selectedCategories = useFilterStore((s) => s.selectedCategories);
  const toggleCategory = useFilterStore((s) => s.toggleCategory);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingRight: 8 }}
      className="mb-3"
    >
      {CATEGORIES.map((category) => {
        const active = selectedCategories.includes(category);
        return (
          <Pressable
            key={category}
            onPress={() => toggleCategory(category)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className={`px-3 py-2 rounded-full border ${active ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
          >
            <Text className={`font-body-medium text-xs ${active ? 'text-on-primary' : 'text-on-surface'}`}>
              {category}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
