import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Asset } from '../../types';
import { formatCurrency } from '../../utils';
import { AreaSparkline } from '../ui/charts';

export interface AssetDetailSheetHandle {
  present: (asset: Asset) => void;
}

export const AssetDetailSheet = forwardRef<AssetDetailSheetHandle>((_props, ref) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [asset, setAsset] = useState<Asset | null>(null);

  useImperativeHandle(ref, () => ({
    present: (nextAsset) => {
      setAsset(nextAsset);
      sheetRef.current?.present();
    },
  }));

  const isPositive = (asset?.returnPct ?? 0) >= 0;
  const color = isPositive ? '#3FA96A' : '#D9564B';

  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing
      backgroundStyle={{ backgroundColor: '#161D2B' }}
      handleIndicatorStyle={{ backgroundColor: '#7C8797' }}
    >
      <BottomSheetView style={{ paddingHorizontal: 20, paddingBottom: 36, paddingTop: 4, gap: 16 }}>
        {asset ? (
          <>
            <View className="gap-1">
              <Text className="text-white font-heading-semibold text-lg">{asset.name}</Text>
              <Text className="text-muted font-body text-xs uppercase tracking-wide">{asset.type}</Text>
            </View>

            <View className="items-center py-2">
              <AreaSparkline
                data={asset.history}
                width={320}
                height={160}
                color={color}
                filled
                markers={[
                  { index: 8, color: '#3FA96A' },
                  { index: 20, color: '#D9564B' },
                ]}
              />
            </View>
            <Text className="text-muted font-body text-xs text-center -mt-2">
              Illustrative buy / sell markers based on mock history
            </Text>

            <View className="flex-row items-center justify-between pt-2 border-t border-border">
              <View className="gap-1">
                <Text className="text-muted font-body-medium text-xs uppercase tracking-wide">Current value</Text>
                <Text className="text-white font-mono-semibold text-xl">{formatCurrency(asset.value)}</Text>
              </View>
              <View className="items-end gap-1">
                <Text className="text-muted font-body-medium text-xs uppercase tracking-wide">Return</Text>
                <Text className={`font-mono-semibold text-xl ${isPositive ? 'text-positive' : 'text-alert'}`}>
                  {isPositive ? '+' : ''}
                  {asset.returnPct.toFixed(1)}%
                </Text>
              </View>
            </View>
          </>
        ) : null}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

AssetDetailSheet.displayName = 'AssetDetailSheet';
