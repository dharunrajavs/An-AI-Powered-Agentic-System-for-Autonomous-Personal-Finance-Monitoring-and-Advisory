import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CurrencyCode } from '../../types';
import { CURRENCIES } from '../../services/exchangeRates';

interface CurrencyPickerProps {
  value: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
}

export function CurrencyPicker({ value, onChange }: CurrencyPickerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
    >
      {CURRENCIES.map((cur) => {
        const active = value === cur.code;
        return (
          <Pressable
            key={cur.code}
            onPress={() => onChange(cur.code)}
            className={`px-3 py-2 rounded-full border ${active ? 'bg-primary border-primary' : 'bg-surface-container-low border-outline-variant/30'}`}
          >
            <Text className={`font-body-medium text-xs ${active ? 'text-on-primary' : 'text-on-surface-variant'}`}>
              {cur.symbol} {cur.code}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
