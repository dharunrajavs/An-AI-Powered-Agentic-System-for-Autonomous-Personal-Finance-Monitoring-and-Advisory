import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { CheckCircle, Loader, Plus, RefreshCw, Smartphone, XCircle } from 'lucide-react-native';
import { UpiAccount, UpiProvider } from '../../types';
import {
  useUpiAccounts,
  useUpiProviders,
  useVerifyUpiId,
  useLinkUpiAccount,
  useUnlinkUpiAccount,
  useSetPrimaryUpiAccount,
  useSyncUpiTransactions,
} from '../../hooks';
import { useUiStore } from '../../store/uiStore';
import { ConfirmDialog } from '../ui';

const PROVIDER_ICONS: Record<string, string> = {
  googlepay: '💰',
  phonepe: '📱',
  paytm: '🪙',
  amazonpay: '📦',
  other: '🏦',
};

const UPI_COLORS: Record<string, string> = {
  googlepay: '#4285F4',
  phonepe: '#5A259C',
  paytm: '#00BAF2',
  amazonpay: '#FF9900',
  other: '#6e7977',
};

function UpiAccountRow({ account, onUnlink, onSetPrimary }: { account: UpiAccount; onUnlink: () => void; onSetPrimary: () => void }) {
  const color = UPI_COLORS[account.provider] ?? '#6e7977';
  return (
    <View className="flex-row items-center justify-between rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-3.5">
      <View className="flex-row items-center gap-3 flex-1">
        <View className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Text className="text-lg">{PROVIDER_ICONS[account.provider] ?? '🏦'}</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-on-surface font-body-semibold text-sm">{account.upiId}</Text>
            {account.isPrimary && (
              <View className="bg-primary/10 px-1.5 py-0.5 rounded-full">
                <Text className="text-primary font-body-bold text-[9px]">PRIMARY</Text>
              </View>
            )}
          </View>
          <Text className="text-on-surface-variant font-body text-xs">{account.accountHolder} · {account.bankName}</Text>
          <Text className="text-on-surface-variant font-body text-[10px] mt-0.5">
            Synced: {new Date(account.lastSyncedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View className="items-end gap-1.5">
        {!account.isPrimary && (
          <Pressable onPress={onSetPrimary}>
            <Text className="text-gold font-body-medium text-xs">Set Primary</Text>
          </Pressable>
        )}
        <Pressable onPress={onUnlink}>
          <Text className="text-alert font-body-medium text-xs">Unlink</Text>
        </Pressable>
      </View>
    </View>
  );
}

function AddUpiForm({ onDone }: { onDone: () => void }) {
  const [upiId, setUpiId] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<UpiProvider | null>(null);
  const { data: providers = [] } = useUpiProviders();
  const verifyMutation = useVerifyUpiId();
  const linkMutation = useLinkUpiAccount();
  const showToast = useUiStore((s) => s.showToast);

  const verifiedData = verifyMutation.data;
  const handleVerify = () => {
    if (!upiId.trim()) return;
    verifyMutation.mutate(upiId.trim());
  };

  const handleLink = () => {
    if (!verifiedData?.valid || !selectedProvider) return;
    linkMutation.mutate(
      { upiId: upiId.trim(), provider: selectedProvider },
      {
        onSuccess: () => {
          showToast('UPI account linked', 'success');
          setUpiId('');
          setSelectedProvider(null);
          verifyMutation.reset();
          onDone();
        },
        onError: () => showToast('Could not link UPI account', 'error'),
      }
    );
  };

  return (
    <View className="gap-3">
      <View className="flex-row gap-2">
        <TextInput
          value={upiId}
          onChangeText={(v) => { setUpiId(v); verifyMutation.reset(); }}
          placeholder="username@bank"
          placeholderTextColor="#6e7977"
          autoCapitalize="none"
          autoCorrect={false}
          className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface font-body text-sm"
        />
        <Pressable
          onPress={handleVerify}
          disabled={!upiId.trim() || verifyMutation.isPending}
          className="bg-primary px-4 py-3 rounded-xl items-center justify-center active:opacity-80"
        >
          {verifyMutation.isPending ? <Loader color="#ffffff" size={16} /> : <Text className="text-on-primary font-body-semibold text-xs">Verify</Text>}
        </Pressable>
      </View>

      {verifiedData && (
        <View className={`rounded-xl p-3 border ${verifiedData.valid ? 'bg-secondary-container/10 border-secondary/30' : 'bg-alert/10 border-alert/30'}`}>
          <View className="flex-row items-start gap-2">
            {verifiedData.valid ? <CheckCircle color="#006c49" size={16} /> : <XCircle color="#ba1a1a" size={16} />}
            <View className="flex-1">
              {verifiedData.valid ? (
                <>
                  <Text className="text-secondary font-body-semibold text-xs">Verified</Text>
                  <Text className="text-on-surface font-body text-xs">{verifiedData.accountHolder} · {verifiedData.bankName}</Text>
                </>
              ) : (
                <Text className="text-alert font-body-semibold text-xs">Invalid UPI ID</Text>
              )}
            </View>
          </View>
        </View>
      )}

      {verifiedData?.valid && (
        <View className="flex-row flex-wrap gap-2">
          {providers.map((p) => {
            const active = selectedProvider === p.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => setSelectedProvider(active ? null : p.id as UpiProvider)}
                className={`flex-row items-center gap-1.5 px-3 py-2 rounded-lg border ${active ? 'bg-primary border-primary' : 'bg-surface-container-low border-outline-variant/30'}`}
              >
                <Text>{PROVIDER_ICONS[p.id] ?? '🏦'}</Text>
                <Text className={`font-body-medium text-xs ${active ? 'text-on-primary' : 'text-on-surface'}`}>{p.name}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {verifiedData?.valid && selectedProvider && (
        <Pressable
          onPress={handleLink}
          disabled={linkMutation.isPending}
          className="bg-primary py-3 rounded-xl items-center active:opacity-80"
        >
          <Text className="text-on-primary font-body-semibold text-sm">
            {linkMutation.isPending ? 'Linking…' : 'Link Account'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export function UpiAccountsList() {
  const { data: accounts = [] } = useUpiAccounts();
  const unlinkMutation = useUnlinkUpiAccount();
  const setPrimaryMutation = useSetPrimaryUpiAccount();
  const syncMutation = useSyncUpiTransactions();
  const showToast = useUiStore((s) => s.showToast);
  const [showAddForm, setShowAddForm] = useState(false);
  const [pendingUnlinkId, setPendingUnlinkId] = useState<string | null>(null);

  const pendingAccount = accounts.find((a) => a.id === pendingUnlinkId);

  const handleConfirmUnlink = () => {
    if (!pendingUnlinkId) return;
    unlinkMutation.mutate(pendingUnlinkId, {
      onSuccess: () => showToast('UPI account unlinked', 'info'),
    });
    setPendingUnlinkId(null);
  };

  const handleSync = () => {
    syncMutation.mutate(undefined, {
      onSuccess: (data) => showToast(`${data.synced} transactions synced`, 'success'),
    });
  };

  return (
    <View className="gap-3">
      {accounts.length > 0 && (
        <>
          {accounts.map((account) => (
            <UpiAccountRow
              key={account.id}
              account={account}
              onUnlink={() => setPendingUnlinkId(account.id)}
              onSetPrimary={() => setPrimaryMutation.mutate(account.id)}
            />
          ))}
          <Pressable
            onPress={handleSync}
            disabled={syncMutation.isPending}
            className="flex-row items-center justify-center gap-2 rounded-xl border border-outline-variant/30 py-3 bg-surface-container-low active:opacity-80"
          >
            <RefreshCw color="#6e7977" size={16} />
            <Text className="text-on-surface-variant font-body-medium text-sm">
              {syncMutation.isPending ? 'Syncing…' : 'Sync UPI Transactions'}
            </Text>
          </Pressable>
        </>
      )}

      {showAddForm ? (
        <View className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/30">
          <AddUpiForm onDone={() => setShowAddForm(false)} />
          <Pressable onPress={() => setShowAddForm(false)} className="py-2 mt-1">
            <Text className="text-on-surface-variant font-body-medium text-xs text-center">Cancel</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={() => setShowAddForm(true)}
          className="flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant/40 py-3.5 active:opacity-80"
        >
          <Plus color="#C9A44C" size={18} />
          <Text className="text-gold font-body-semibold text-sm">Link UPI account</Text>
        </Pressable>
      )}

      <ConfirmDialog
        visible={pendingUnlinkId !== null}
        title="Unlink UPI account"
        message={pendingAccount ? `Remove ${pendingAccount.upiId} from your UPI accounts?` : undefined}
        confirmLabel="Unlink"
        destructive
        onConfirm={handleConfirmUnlink}
        onCancel={() => setPendingUnlinkId(null)}
      />
    </View>
  );
}
