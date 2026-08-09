import { Search } from 'lucide-react-native';
import React from 'react';
import { TextInput, View } from 'react-native';
import { useFilterStore } from '../../store/filterStore';

export function SearchBar() {
  const searchQuery = useFilterStore((s) => s.searchQuery);
  const setSearchQuery = useFilterStore((s) => s.setSearchQuery);

  return (
    <View className="flex-row items-center bg-surface border border-border rounded-xl px-3 h-11 mb-3">
      <Search size={18} color="#6e7977" />
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search merchant or category"
        placeholderTextColor="#6e7977"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        accessibilityLabel="Search transactions"
        className="flex-1 ml-2 text-on-surface font-body text-sm"
      />
    </View>
  );
}
