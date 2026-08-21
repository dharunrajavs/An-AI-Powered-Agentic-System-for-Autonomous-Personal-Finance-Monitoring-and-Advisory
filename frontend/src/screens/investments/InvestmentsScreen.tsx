import { RefreshCw } from 'lucide-react-native';
import React, { useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AllocationChart } from '../../components/investments/AllocationChart';
import { AssetDetailSheet, AssetDetailSheetHandle } from '../../components/investments/AssetDetailSheet';
import { AssetList } from '../../components/investments/AssetList';
import { PortfolioValueStat } from '../../components/investments/PortfolioValueStat';
import { EmptyState, ErrorState, LoadingSkeletonList } from '../../components/ui';
import { useAssets, useSyncInvestments } from '../../hooks';
import { Asset } from '../../types';

export function InvestmentsScreen() {
  const assetsQuery = useAssets();
  const syncInvestments = useSyncInvestments();
  const detailRef = useRef<AssetDetailSheetHandle>(null);

  const handleSelect = (asset: Asset) => detailRef.current?.present(asset);

  if (assetsQuery.isLoading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
        <View className="px-5 pt-2">
          <LoadingSkeletonList rows={5} rowHeight={90} />
        </View>
      </SafeAreaView>
    );
  }

  if (assetsQuery.isError) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
        <ErrorState
          message="We couldn't load your investments. Please try again."
          onRetry={() => assetsQuery.refetch()}
        />
      </SafeAreaView>
    );
  }

  const assets = assetsQuery.data ?? [];

  if (assets.length === 0) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
        <EmptyState
          title="No investments yet"
          message="Connect an investment account to start tracking your portfolio."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
        <Text className="text-on-surface font-heading-bold text-xl">Investments</Text>
        <Pressable
          onPress={() => syncInvestments.mutate()}
          disabled={syncInvestments.isPending}
          className="p-2 rounded-full bg-surface active:opacity-70"
        >
          <RefreshCw color="#005c55" size={20} style={syncInvestments.isPending ? { opacity: 0.5 } : undefined} />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ gap: 16, paddingBottom: 32 }}>
        <PortfolioValueStat assets={assets} />
        <AllocationChart assets={assets} />
        <AssetList assets={assets} onSelect={handleSelect} />

        {syncInvestments.isPending && (
          <View className="px-4 py-3 bg-primary/10 rounded-xl border border-primary/20">
            <Text className="text-primary font-body-semibold text-xs text-center">Syncing your portfolio...</Text>
          </View>
        )}

        <AssetDetailSheet ref={detailRef} />
      </ScrollView>
    </SafeAreaView>
  );
}
