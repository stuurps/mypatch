import React from 'react';
import Svg, { Circle, Path, Rect, Line } from 'react-native-svg';
import { colors } from '@/tokens';

export type Conditions = 'clear' | 'overcast' | 'rain' | 'mist';

type Props = {
  condition: Conditions;
  size?: number;
  color?: string;
};

export function ConditionsIcon({ condition, size = 20, color = colors.inkFaint }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {condition === 'clear'    && <ClearPaths    color={color} />}
      {condition === 'overcast' && <OvercastPaths color={color} />}
      {condition === 'rain'     && <RainPaths     color={color} />}
      {condition === 'mist'     && <MistPaths     color={color} />}
    </Svg>
  );
}

// Solid circle — no rays, clearly "full sun / clear sky"
function ClearPaths({ color }: { color: string }) {
  return <Circle cx="12" cy="12" r="6" fill={color} />;
}

// Filled cloud silhouette
const CLOUD = 'M 4.5 18 C 2 18 1 16 1 14 C 1 11.5 3 10 6 10 C 6.5 7.5 9 6 12 6 C 15 6 17 7.5 17.5 10 C 18 10 18.5 10 19 10 C 21.5 10 23 11.5 23 14 C 23 16 21.5 18 19 18 Z';

function OvercastPaths({ color }: { color: string }) {
  return <Path d={CLOUD} fill={color} />;
}

// Same cloud shifted up + 3 drop lines
const RAIN_CLOUD = 'M 4.5 14 C 2 14 1 12 1 10 C 1 7.5 3 6 6 6 C 6.5 3.5 9 2 12 2 C 15 2 17 3.5 17.5 6 C 18 6 18.5 6 19 6 C 21.5 6 23 7.5 23 10 C 23 12 21.5 14 19 14 Z';

function RainPaths({ color }: { color: string }) {
  return (
    <>
      <Path d={RAIN_CLOUD} fill={color} />
      <Line x1="8"  y1="17" x2="7"  y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="12" y1="17" x2="11" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="16" y1="17" x2="15" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </>
  );
}

// 3 horizontal bars, decreasing width — fog/mist
function MistPaths({ color }: { color: string }) {
  return (
    <>
      <Rect x="3" y="7"  width="18" height="2.5" rx="1.25" fill={color} />
      <Rect x="5" y="12" width="14" height="2.5" rx="1.25" fill={color} />
      <Rect x="7" y="17" width="10" height="2.5" rx="1.25" fill={color} />
    </>
  );
}
