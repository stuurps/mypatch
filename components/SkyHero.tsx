import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { TREE1, TREE2, colors } from '@/tokens';

type Props = {
  bands: string[];
  height: number;
  showTrees?: boolean;
  children?: React.ReactNode;
};

export function SkyHero({ bands, height, showTrees = true, children }: Props) {
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
