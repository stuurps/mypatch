import React from 'react';
import Svg, { Circle, Path, Rect, Line } from 'react-native-svg';
import type { TimeOfDay } from '@/skies';
import { colors } from '@/tokens';

type Props = {
  period: TimeOfDay;
  size?: number;
  color?: string;
};

export function TimeOfDayIcon({ period, size = 20, color = colors.inkFaint }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {period === 'dawn' && <DawnPaths color={color} />}
      {period === 'day'  && <DayPaths  color={color} />}
      {period === 'dusk' && <DuskPaths color={color} />}
      {period === 'night'&& <NightPaths color={color} />}
    </Svg>
  );
}

function DawnPaths({ color }: { color: string }) {
  return (
    <>
      {/* Horizon */}
      <Rect x="2" y="16" width="20" height="1.5" rx="0.75" fill={color} />
      {/* Sun — top half of circle */}
      <Path d="M 6 16 A 6 6 0 0 1 18 16 Z" fill={color} />
      {/* Rays up */}
      <Line x1="12" y1="7" x2="12" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="7.8" y1="10.2" x2="5.8" y2="8.2" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="16.2" y1="10.2" x2="18.2" y2="8.2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

function DayPaths({ color }: { color: string }) {
  return (
    <>
      {/* Sun */}
      <Circle cx="12" cy="12" r="4" fill={color} />
      {/* 8 rays */}
      <Line x1="12" y1="2"   x2="12" y2="5"   stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="12" y1="19"  x2="12" y2="22"  stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="2"  y1="12"  x2="5"  y2="12"  stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="19" y1="12"  x2="22" y2="12"  stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="4.93" y1="4.93"  x2="7.05" y2="7.05"  stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="16.95" y1="16.95" x2="19.07" y2="19.07" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="4.93"  y1="19.07" x2="7.05"  y2="16.95" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="16.95" y1="7.05"  x2="19.07" y2="4.93"  stroke={color} strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

function DuskPaths({ color }: { color: string }) {
  return (
    <>
      {/* Horizon */}
      <Rect x="2" y="16" width="20" height="1.5" rx="0.75" fill={color} />
      {/* Sun — slightly smaller, no rays (light fading) */}
      <Path d="M 7 16 A 5 5 0 0 1 17 16 Z" fill={color} />
      {/* Afterglow below horizon — warm bands */}
      <Rect x="4"  y="19"   width="16" height="1.5" rx="0.75" fill={color} opacity="0.55" />
      <Rect x="7"  y="21.5" width="10" height="1"   rx="0.5"  fill={color} opacity="0.28" />
    </>
  );
}

function NightPaths({ color }: { color: string }) {
  return (
    <>
      {/* Crescent moon */}
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={color} />
      {/* Star */}
      <Circle cx="19" cy="4.5" r="1.2" fill={color} />
    </>
  );
}
