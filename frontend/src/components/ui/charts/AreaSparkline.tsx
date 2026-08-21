import Svg, { Circle, Polygon, Polyline } from 'react-native-svg';

export interface SparklineMarker {
  index: number;
  color: string;
}

interface AreaSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  filled?: boolean;
  markers?: SparklineMarker[];
}

export function AreaSparkline({
  data,
  width = 300,
  height = 100,
  color = '#C9A44C',
  filled = false,
  markers = [],
}: AreaSparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const coords = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return { x, y };
  });

  const linePoints = coords.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const fillPoints = `0,${height} ${linePoints} ${width},${height}`;

  return (
    <Svg width={width} height={height}>
      {filled ? <Polygon points={fillPoints} fill={color} fillOpacity={0.15} /> : null}
      <Polyline points={linePoints} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {markers.map((marker, i) => {
        const point = coords[marker.index];
        if (!point) return null;
        return <Circle key={`marker-${marker.index}-${i}`} cx={point.x} cy={point.y} r={4.5} fill={marker.color} />;
      })}
    </Svg>
  );
}
