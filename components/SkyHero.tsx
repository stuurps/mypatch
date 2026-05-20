import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Polygon, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { TREE1, TREE2, colors } from '@/tokens';

type Props = {
  bands: string[];
  height: number;
  showTrees?: boolean;
  stars?: boolean;
  children?: React.ReactNode;
};

const STAR_DATA = [
  { cx: 0.08, cy: 0.05, r: 1.5, o: 0.9 },
  { cx: 0.22, cy: 0.13, r: 1.0, o: 0.6 },
  { cx: 0.45, cy: 0.07, r: 1.5, o: 0.8 },
  { cx: 0.67, cy: 0.04, r: 1.0, o: 0.7 },
  { cx: 0.88, cy: 0.11, r: 1.5, o: 0.5 },
  { cx: 0.15, cy: 0.22, r: 1.0, o: 0.7 },
  { cx: 0.35, cy: 0.17, r: 1.5, o: 0.9 },
  { cx: 0.55, cy: 0.24, r: 1.0, o: 0.5 },
  { cx: 0.75, cy: 0.19, r: 1.5, o: 0.8 },
  { cx: 0.92, cy: 0.28, r: 1.0, o: 0.6 },
  { cx: 0.05, cy: 0.34, r: 1.5, o: 0.7 },
  { cx: 0.28, cy: 0.31, r: 1.0, o: 0.4 },
  { cx: 0.50, cy: 0.39, r: 1.5, o: 0.9 },
  { cx: 0.72, cy: 0.33, r: 1.0, o: 0.6 },
  { cx: 0.85, cy: 0.43, r: 1.5, o: 0.5 },
  { cx: 0.18, cy: 0.47, r: 1.0, o: 0.8 },
  { cx: 0.40, cy: 0.52, r: 1.5, o: 0.7 },
  { cx: 0.62, cy: 0.50, r: 1.0, o: 0.4 },
  { cx: 0.80, cy: 0.56, r: 1.5, o: 0.9 },
  { cx: 0.10, cy: 0.58, r: 1.0, o: 0.5 },
  { cx: 0.30, cy: 0.54, r: 1.5, o: 0.6 },
  { cx: 0.95, cy: 0.15, r: 1.0, o: 0.8 },
  { cx: 0.58, cy: 0.14, r: 1.5, o: 0.4 },
  { cx: 0.42, cy: 0.30, r: 1.0, o: 0.7 },
  { cx: 0.78, cy: 0.09, r: 1.5, o: 0.6 },
];

export function SkyHero({ bands, height, showTrees = true, stars = false, children }: Props) {
  const { width } = useWindowDimensions();
  const treelineY = height * 0.58;

  const tree1Points = [
    ...TREE1.map(([x, y]) => `${x * width},${treelineY - y}`),
    `${width},${height}`,
    `0,${height}`,
  ].join(' ');

  const tree2Points = [
    ...TREE2.map(([x, y]) => `${x * width},${treelineY - y}`),
    `${width},${height}`,
    `0,${height}`,
  ].join(' ');

  const scrimHeight = height - treelineY + 60;

  return (
    <View style={[styles.container, { height, backgroundColor: bands[bands.length - 1] }]}>
      {bands.map((color, i) => (
        <View key={i} style={[styles.band, { backgroundColor: color }]} />
      ))}

      {stars && (
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          {STAR_DATA.map((s, i) => (
            <Circle key={i} cx={s.cx * width} cy={s.cy * height} r={s.r} fill="white" opacity={s.o} />
          ))}
        </Svg>
      )}

      {showTrees && (
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Polygon points={tree2Points} fill={colors.tree2} />
          <Polygon points={tree1Points} fill={colors.tree1} />
        </Svg>
      )}

      <LinearGradient
        colors={['rgba(0,0,0,0.28)', 'transparent']}
        style={styles.topScrim}
        pointerEvents="none"
      />

      <LinearGradient
        colors={['transparent', 'rgba(13,11,24,0.55)', 'rgba(13,11,24,0.92)']}
        locations={[0, 0.45, 1]}
        style={[styles.bottomScrim, { height: scrimHeight }]}
        pointerEvents="none"
      />

      <View style={styles.children} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  band: { height: 40, width: '100%' },
  topScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  bottomScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  children: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
