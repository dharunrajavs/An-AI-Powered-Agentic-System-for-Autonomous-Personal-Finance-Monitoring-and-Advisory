import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  lineColor?: string;
  fillColor?: string;
  dotColor?: string;
  showLabels?: boolean;
}

export function SparklineChart({
  data,
  width = 280,
  height = 100,
  lineColor = '#005c55',
  fillColor = 'rgba(0, 92, 85, 0.08)',
  dotColor = '#005c55',
  showLabels = true,
}: SparklineChartProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 4;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((value, i) => ({
    x: padding + (i / (data.length - 1)) * chartWidth,
    y: padding + chartHeight - ((value - min) / range) * chartHeight,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  const fillPath = `${linePath} L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`;

  return (
    <View className="items-center">
      <Svg width={width} height={height}>
        <Path d={fillPath} fill={fillColor} />
        <Path d={linePath} stroke={lineColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {points[points.length - 1] && (
          <Circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={3} fill={dotColor} />
        )}
      </Svg>
      {showLabels && (
        <View className="w-full flex-row justify-between mt-1">
          <Text className="text-on-surface-variant font-body text-[9px]">{data.length > 0 ? data.length + ' periods' : ''}</Text>
          <Text className="text-on-surface-variant font-body text-[9px]">
            {min >= 0 ? '' : ''} {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(min)} – {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(max)}
          </Text>
        </View>
      )}
    </View>
  );
}
