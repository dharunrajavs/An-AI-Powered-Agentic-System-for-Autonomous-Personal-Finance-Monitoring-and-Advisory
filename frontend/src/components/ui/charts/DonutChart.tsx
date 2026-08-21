import { Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({ data, size = 140, strokeWidth = 18, centerLabel, centerValue }: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  let cumulative = 0;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#dae2fd" strokeWidth={strokeWidth} fill="none" />
          {data.map((segment, i) => {
            const segmentLength = (segment.value / total) * circumference;
            const dashOffset = -cumulative;
            cumulative += segmentLength;
            return (
              <Circle
                key={`${segment.label}-${i}`}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
                fill="none"
              />
            );
          })}
        </G>
      </Svg>
      {(centerLabel || centerValue) && (
        <View className="absolute items-center justify-center" style={{ width: size, height: size }}>
          {centerValue ? <Text className="text-on-surface font-mono-semibold text-lg">{centerValue}</Text> : null}
          {centerLabel ? <Text className="text-on-surface-variant font-body text-xs mt-0.5">{centerLabel}</Text> : null}
        </View>
      )}
    </View>
  );
}

export function DonutLegend({ data }: { data: DonutSegment[] }) {
  return (
    <View className="gap-2.5">
      {data.map((segment, i) => (
        <View key={`legend-${segment.label}-${i}`} className="flex-row items-center gap-2.5">
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: segment.color }} />
          <Text className="text-on-surface font-body text-sm flex-1">{segment.label}</Text>
          <Text className="text-on-surface-variant font-mono text-xs">{Math.round(segment.value).toLocaleString()}</Text>
        </View>
      ))}
    </View>
  );
}
