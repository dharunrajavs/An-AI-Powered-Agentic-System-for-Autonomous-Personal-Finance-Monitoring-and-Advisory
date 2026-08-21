import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useConnectedAccounts, useLinkAccount, useUnlinkAccount } from '../../hooks';
import { useUiStore } from '../../store/uiStore';
import { ConfirmDialog } from '../ui';
import { formatCurrency } from '../../utils';
import { ConnectedAccount, SyncStatus } from '../../types';

const STATUS_STYLES: Record<SyncStatus, { dot: string; text: string; label: string }> = {
  synced: { dot: 'bg-positive', text: 'text-positive', label: 'Synced' },
  syncing: { dot: 'bg-gold', text: 'text-gold', label: 'Syncing' },
  error: { dot: 'bg-alert', text: 'text-alert', label: 'Error' },
};

function randomMask(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function randomBalance(): number {
  return Math.round((500 + Math.random() * 9500) * 100) / 100;
}

interface AccountRowProps {
  account: ConnectedAccount;
  onUnlink: () => void;
}

function AccountRow({ account, onUnlink }: AccountRowProps) {
  const status = STATUS_STYLES[account.syncStatus];
  const isNegative = account.balance < 0;

  return (
    <View className="flex-row items-center justify-between rounded-xl border border-border bg-background px-4 py-3.5">
      <View className="flex-1 pr-3">
        <Text className="font-body-semibold text-sm text-white">{account.nickname}</Text>
        <Text className="mt-0.5 font-body text-xs text-muted">
          {account.institution} · •••• {account.mask}
        </Text>
        <View className="mt-1.5 flex-row items-center gap-1.5">
          <View className={`h-2 w-2 rounded-full ${status.dot}`} />
          <Text className={`font-body text-xs ${status.text}`}>{status.label}</Text>
        </View>
      </View>
      <View className="items-end gap-2">
        <Text className={`font-mono-semibold text-sm ${isNegative ? 'text-alert' : 'text-white'}`}>
          {formatCurrency(account.balance)}
        </Text>
        <Pressable onPress={onUnlink} accessibilityRole="button" accessibilityLabel={`Unlink ${account.nickname}`}>
          <Text className="font-body-medium text-xs text-alert">Unlink</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function ConnectedAccountsList() {
  const { data: accounts = [] } = useConnectedAccounts();
  const unlinkAccount = useUnlinkAccount();
  const linkAccount = useLinkAccount();
  const showToast = useUiStore((state) => state.showToast);
  const [pendingUnlinkId, setPendingUnlinkId] = useState<string | null>(null);

  const pendingAccount = accounts.find((account) => account.id === pendingUnlinkId);

  const handleConfirmUnlink = () => {
    if (!pendingUnlinkId) return;
    unlinkAccount.mutate(pendingUnlinkId, {
      onSuccess: () => showToast('Account unlinked', 'info'),
    });
    setPendingUnlinkId(null);
  };

  const handleLinkAnother = () => {
    linkAccount.mutate(
      {
        institution: 'Bank of America',
        nickname: 'Bank of America Checking',
        mask: randomMask(),
        balance: randomBalance(),
      },
      { onSuccess: () => showToast('Account linked', 'success') }
    );
  };

  return (
    <View className="gap-3">
      {accounts.map((account) => (
        <AccountRow key={account.id} account={account} onUnlink={() => setPendingUnlinkId(account.id)} />
      ))}

      <Pressable
        onPress={handleLinkAnother}
        disabled={linkAccount.isPending}
        accessibilityRole="button"
        accessibilityLabel="Link another account"
        className={`flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3.5 active:opacity-80 ${
          linkAccount.isPending ? 'opacity-60' : ''
        }`}
      >
        <Plus color="#C9A44C" size={18} />
        <Text className="font-body-semibold text-sm text-gold">
          {linkAccount.isPending ? 'Linking…' : 'Link another account'}
        </Text>
      </Pressable>

      <ConfirmDialog
        visible={pendingUnlinkId !== null}
        title="Unlink account"
        message={
          pendingAccount
            ? `Remove ${pendingAccount.nickname} from your connected accounts? The agent will stop monitoring it.`
            : undefined
        }
        confirmLabel="Unlink"
        destructive
        onConfirm={handleConfirmUnlink}
        onCancel={() => setPendingUnlinkId(null)}
      />
    </View>
  );
}
