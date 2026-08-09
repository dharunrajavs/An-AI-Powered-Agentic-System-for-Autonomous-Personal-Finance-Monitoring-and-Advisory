import { Text, View } from 'react-native';

export interface BarDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarDatum[];
  height?: number;
  barColor?: string;
  formatValue?: (value: number) => string;
}

export function BarChart({ data, height = 160, barColor = '#C9A44C', formatValue }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={{ height: height + 28 }} className="flex-row items-end gap-2">
      {data.map((d, i) => {
        const barHeight = Math.max(4, (d.value / max) * height);
        return (
          <View key={`${d.label}-${i}`} className="flex-1 items-center gap-1.5">
            <View className="flex-1 items-center justify-end w-full">
              <View style={{ height: barHeight, backgroundColor: barColor }} className="w-full rounded-t-md" />
            </View>
            <Text className="text-on-surface-variant font-body text-[10px]" numberOfLines={1}>
              {d.label}
            </Text>
            {formatValue ? (
              <Text className="text-on-surface font-mono text-[9px]" numberOfLines={1}>
                {formatValue(d.value)}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
