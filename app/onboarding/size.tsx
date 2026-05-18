import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { SkyHero } from '@/components/SkyHero';
import { StepDots } from '@/components/StepDots';
import { SKY_SUNSET } from '@/skies';
import { colors, type as t, space, radius } from '@/tokens';
import { insertPatch } from '@/db/database';
import type { Patch } from '@/db/database';
import { usePatch } from '@/context/PatchContext';

const RADIUS_OPTIONS = [
  { value: 1 as const, label: '1 km', description: 'Garden' },
  { value: 5 as const, label: '5 km', description: 'Local walk' },
  { value: 10 as const, label: '10 km', description: 'Full patch' },
];

export default function OnboardingSize() {
  const { height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const { patchName } = useLocalSearchParams<{ patchName: string }>();
  const [selectedRadius, setSelectedRadius] = useState<1 | 5 | 10>(5);
  const db = useSQLiteContext();
  const { dispatch } = usePatch();

  async function handleStart() {
    const patch: Patch = {
      id: crypto.randomUUID(),
      name: patchName ?? 'My patch',
      radius_km: selectedRadius,
      created_at: new Date().toISOString(),
    };
    await insertPatch(db, patch);
    dispatch({ type: 'SET_PATCH', payload: patch });
    // PatchContext redirect effect handles navigation to /(tabs)
  }

  return (
    <View style={styles.container}>
      <SkyHero bands={SKY_SUNSET} height={height} />

      <View style={StyleSheet.absoluteFill}>
        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: top + space.md }]}>
          <Pressable style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <View style={styles.barCenter}>
            <StepDots current={3} />
          </View>
          <View style={{ width: 36 }} />
        </View>

        <View style={{ flex: 1 }} />

        {/* Content */}
        <View style={[styles.content, { paddingBottom: bottom + space.xl }]}>
          <Text style={styles.headline}>
            How big is{'\n'}{patchName ?? 'your patch'}?
          </Text>

          <View style={styles.pills}>
            {RADIUS_OPTIONS.map(option => {
              const active = option.value === selectedRadius;
              return (
                <Pressable
                  key={option.value}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setSelectedRadius(option.value)}
                >
                  <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.pillDesc, active && styles.pillDescActive]}>
                    {option.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.cta} onPress={handleStart}>
            <Text style={styles.ctaText}>Start watching</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 26,
    color: '#fff',
    lineHeight: 30,
  },
  barCenter: { flex: 1, alignItems: 'center' },
  content: {
    paddingHorizontal: space.lg,
    gap: space.lg,
  },
  headline: {
    fontSize: 28,
    fontWeight: '500',
    color: '#fff',
    lineHeight: 36,
  },
  pills: {
    flexDirection: 'row',
    gap: space.sm,
  },
  pill: {
    flex: 1,
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    gap: 4,
  },
  pillActive: {
    backgroundColor: colors.amber,
    borderColor: colors.amber,
  },
  pillLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  pillLabelActive: {
    color: '#fff',
  },
  pillDesc: {
    ...t.meta,
    color: 'rgba(255,255,255,0.5)',
  },
  pillDescActive: {
    color: 'rgba(255,255,255,0.9)',
  },
  cta: {
    backgroundColor: colors.amber,
    borderRadius: radius.button,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
