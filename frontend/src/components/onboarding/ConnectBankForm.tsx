import { Landmark, Search, ShieldCheck, Sparkles, Upload } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

interface ConnectBankFormProps {
  onContinue: () => void;
  onSkip: () => void;
}

const BANKS = [
  { name: 'Chase', color: '#117aca' },
  { name: 'Bank of America', color: '#e31837' },
  { name: 'Wells Fargo', color: '#d71e28' },
  { name: 'Citibank', color: '#003b70' },
  { name: 'Capital One', color: '#004a7c' },
  { name: 'US Bank', color: '#0c2074' },
];

export function ConnectBankForm({ onContinue, onSkip }: ConnectBankFormProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = BANKS.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className="gap-6">
      <View className="items-center gap-3 mb-1">
        <View className="flex-row items-center gap-1.5 bg-secondary-container/20 rounded-full px-3 py-1.5">
          <ShieldCheck color="#006c49" size={14} />
          <Text className="text-secondary font-body-medium text-xs">Your data is encrypted and private</Text>
        </View>
        <Text className="text-on-surface font-heading-bold text-2xl text-center">Connect your bank</Text>
        <Text className="text-on-surface-variant font-body text-sm text-center leading-5 px-4">
          Bank-level 256-bit encryption. We never store your password.
        </Text>
      </View>

      <View className="gap-4">
        <View className="flex-row items-center bg-surface-container-low rounded-xl px-4">
          <Search color="#6e7977" size={18} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search for your bank..."
            placeholderTextColor="#6e7977"
            className="flex-1 ml-3 py-4 font-body text-sm text-on-surface"
          />
        </View>

        <View className="flex-row flex-wrap gap-3">
          {filtered.map((bank) => {
            const isActive = selected === bank.name;
            return (
              <Pressable
                key={bank.name}
                onPress={() => setSelected(isActive ? null : bank.name)}
                className={`w-[48%] items-center p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'border-primary bg-primary-container/10'
                    : 'border-outline-variant bg-white'
                }`}
              >
                <View
                  className="w-12 h-12 rounded-lg items-center justify-center mb-2"
                  style={{ backgroundColor: `${bank.color}10` }}
                >
                  <Landmark color={bank.color} size={22} />
                </View>
                <Text
                  className={`font-body-medium text-sm ${
                    isActive ? 'text-primary' : 'text-on-surface'
                  }`}
                >
                  {bank.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="bg-white/70 rounded-xl p-4 flex-row items-start gap-3 border border-tertiary/20">
        <View className="w-8 h-8 rounded-full bg-tertiary-container items-center justify-center">
          <Sparkles color="#ffffff" size={16} />
        </View>
        <View className="flex-1">
          <Text className="text-on-surface-variant font-body text-xs italic leading-5">
            Our AI analyzes transaction patterns to automatically categorize your spending after you link your account.
          </Text>
        </View>
      </View>

      <View className="gap-3">
        <Pressable
          onPress={onSkip}
          className="flex-row items-center justify-center gap-2 py-3 rounded-full border border-outline"
        >
          <Upload color="#6e7977" size={16} />
          <Text className="text-on-surface-variant font-body-medium text-sm">Import CSV instead</Text>
        </Pressable>
        <Pressable onPress={onSkip} className="py-2">
          <Text className="text-on-surface-variant font-body-medium text-sm text-center">Add transactions manually</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={onContinue}
        className="w-full bg-primary py-4 rounded-full items-center flex-row justify-center gap-2 shadow-md active:opacity-90"
      >
        <Text className="text-on-primary font-heading-semibold text-base">Continue</Text>
        <Text className="text-on-primary font-heading-semibold text-base">→</Text>
      </Pressable>

      <View className="border-t border-outline-variant pt-4 items-center gap-2">
        <Text className="text-outline font-heading-bold text-2xl">🔒</Text>
        <View className="items-center">
          <Text className="text-on-surface font-body-medium text-sm">Secure Connection</Text>
          <Text className="text-on-surface-variant font-body text-xs text-center leading-5">
            FinSense uses Plaid to securely connect your accounts. We never store or see your bank login credentials.
          </Text>
        </View>
      </View>
    </View>
  );
}
