import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/tokens';

type Props = {
  bands: string[];
  height: number;
  children?: React.ReactNode;
};

// Deterministic pseudo-random so trees are identical across renders
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// Builds an SVG path for a row of triangular pine tree silhouettes.
// Each tree is a triangle with a slight lean. Returns a closed filled shape.
function buildTreeLayer(
  width: number,
  baseY: number,
  fillToY: number,
  count: number,
  minH: number,
  maxH: number,
  seed: number,
): string {
  const rand = seededRand(seed);
  const spacing = width / count;

  let d = `M 0,${fillToY} L 0,${baseY}`;

  for (let i = 0; i < count; i++) {
    const cx = (i + 0.5) * spacing + (rand() - 0.5) * spacing * 0.38;
    const h = minH + rand() * (maxH - minH);
    const hw = spacing * (0.44 + rand() * 0.14);
    // Slight lean: peak offset from centre gives each tree character
    const lean = (rand() - 0.5) * hw * 0.28;

    d += ` L ${cx - hw},${baseY} L ${cx + lean},${baseY - h} L ${cx + hw},${baseY}`;
  }

  d += ` L ${width},${baseY} L ${width},${fillToY} Z`;
  return d;
}

export function SkyHero({ bands, height, children }: Props) {
  const { width } = useWindowDimensions();
  const treelineY = height * 0.58;
  const scrimHeight = height - treelineY + 60;

  const trees = useMemo(() => ({
    // Back layer — small dense trees, darkest, sits lowest (furthest away)
    back: buildTreeLayer(width, treelineY + 24, height, 22, 30, 58, 42),
    // Mid layer — medium height, slightly in front
    mid:  buildTreeLayer(width, treelineY + 8,  height, 16, 52, 90, 137),
    // Front layer — tallest, most prominent, lightest of the three greens
    front: buildTreeLayer(width, treelineY,      height, 12, 82, 138, 71),
  }), [width, height, treelineY]);

  return (
    <View style={[styles.container, { height, backgroundColor: bands[bands.length - 1] }]}>
      {/* Sky bands — 12 × 40px */}
      {bands.map((color, i) => (
        <View key={i} style={[styles.band, { backgroundColor: color }]} />
      ))}

      {/* Three-layer pine treeline */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Path d={trees.back}  fill={colors.tree3} />
        <Path d={trees.mid}   fill={colors.tree2} />
        <Path d={trees.front} fill={colors.tree1} />
      </Svg>

      {/* Top scrim — status bar legibility */}
      <LinearGradient
        colors={['rgba(0,0,0,0.28)', 'transparent']}
        style={styles.topScrim}
        pointerEvents="none"
      />

      {/* Bottom scrim — accelerated fade so text area is properly dark */}
      <LinearGradient
        colors={['transparent', 'rgba(13,11,24,0.55)', 'rgba(13,11,24,0.92)']}
        locations={[0, 0.45, 1]}
        style={[styles.bottomScrim, { height: scrimHeight }]}
        pointerEvents="none"
      />

      {/* Children — above scrim, pinned to bottom */}
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
