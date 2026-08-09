import { CheckCircle2, Landmark, ShieldCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useLinkAccount } from '../../hooks';

interface AccountConnectCardProps {
  onContinue: () => void;
}

type RowStatus = 'idle' | 'connecting' | 'connected';

const BANKS = ['Chase', 'Bank of America', 'Wells Fargo', 'Ally Bank'];

function randomMask(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function randomBalance(): number {
  return Math.round((500 + Math.random() * 12000) * 100) / 100;
}

export function AccountConnectCard({ onContinue }: AccountConnectCardProps) {
  const [statuses, setStatuses] = useState<Record<string, RowStatus>>({});
  const linkAccount = useLinkAccount();

  const handleLink = (bank: string) => {
    if (statuses[bank] === 'connecting' || statuses[bank] === 'connected') return;

    setStatuses((prev) => ({ ...prev, [bank]: 'connecting' }));
    linkAccount.mutate(
      {
        institution: bank,
        nickname: `${bank} Checking`,
        mask: randomMask(),
        balance: randomBalance(),
      },
      {
        onSuccess: () => {
          setStatuses((prev) => ({ ...prev, [bank]: 'connected' }));
          // Give the user a moment to see the confirmation before advancing.
          setTimeout(onContinue, 900);
        },
        onError: () => {
          setStatuses((prev) => ({ ...prev, [bank]: 'idle' }));
        },
      }
    );
  };

  return (
    <View className="gap-5">
      <View className="items-center gap-2 mb-1">
        <View className="w-14 h-14 rounded-full bg-surface border border-border items-center justify-center">
          <ShieldCheck color="#C9A44C" size={26} />
        </View>
        <Text className="text-white font-heading-bold text-xl text-center">Connect a bank account</Text>
        <Text className="text-muted font-body text-sm text-center leading-5 px-4">
          Securely link an account so your agent can track balances and spending. This is a simulated
          connection — no real credentials are collected.
        </Text>
      </View>

      <View className="bg-surface rounded-2xl border border-border overflow-hidden">
        {BANKS.map((bank, index) => {
          const status = statuses[bank] ?? 'idle';
          const isLast = index === BANKS.length - 1;

          return (
            <View
              key={bank}
              className={`flex-row items-center justify-between px-4 py-4 ${isLast ? '' : 'border-b border-border'}`}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-background items-center justify-center">
                  <Landmark color="#7C8797" size={18} />
                </View>
                <Text className="text-white font-body-medium text-sm">{bank}</Text>
              </View>

              {status === 'connected' ? (
                <View className="flex-row items-center gap-1.5 px-3 py-2">
                  <CheckCircle2 color="#3FA96A" size={16} />
                  <Text className="text-positive font-body-semibold text-xs">Connected</Text>
                </View>
              ) : (
                <Pressable
                  onPress={() => handleLink(bank)}
                  disabled={status === 'connecting'}
                  className={`px-4 py-2 rounded-lg ${status === 'connecting' ? 'bg-border' : 'bg-gold active:opacity-80'}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Link ${bank}`}
                >
                  <Text className="text-background font-body-semibold text-xs">
                    {status === 'connecting' ? 'Linking…' : 'Link'}
                  </Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>

      <Pressable
        onPress={onContinue}
        className="items-center py-3"
        accessibilityRole="button"
        accessibilityLabel="Skip for now"
      >
        <Text className="text-muted font-body-medium text-sm">Skip for now</Text>
      </Pressable>
    </View>
  );
}
