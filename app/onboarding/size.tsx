import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { SkyHero } from '@/components/SkyHero';
import { StepDots } from '@/components/StepDots';
import { SKY_SUNSET } from '@/skies';
import { colors, type as t, space, radius } from '@/tokens';
import { insertPatch, updatePatch } from '@/db/database';
import type { Patch } from '@/db/database';
import { usePatch } from '@/context/PatchContext';
import * as ExpoCrypto from 'expo-crypto';

const RADIUS_OPTIONS = [
  { value: 1 as const, label: '1 km', description: 'Garden' },
  { value: 5 as const, label: '5 km', description: 'Local walk' },
  { value: 10 as const, label: '10 km', description: 'Full patch' },
];

export default function OnboardingSize() {
  const { height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const params = useLocalSearchParams<{ patchName: string; editing?: string; currentRadius?: string }>();
  const isEditing = params.editing === 'true';
  const initialRadius = ([1, 5, 10].includes(Number(params.currentRadius))
    ? Number(params.currentRadius)
    : 5) as 1 | 5 | 10;

  const [selectedRadius, setSelectedRadius] = useState<1 | 5 | 10>(initialRadius);
  const db = useSQLiteContext();
  const { state, dispatch } = usePatch();

  async function handleConfirm() {
    const patchName = params.patchName ?? 'My patch';
    if (isEditing && state.patch) {
      await updatePatch(db, state.patch.id, patchName, selectedRadius);
      dispatch({ type: 'UPDATE_PATCH', payload: { name: patchName, radius_km: selectedRadius } });
      // Clearing the flag triggers PatchContext redirect back to /(tabs)
      dispatch({ type: 'SET_EDITING_PATCH', payload: false });
    } else {
      const patch: Patch = {
        id: ExpoCrypto.randomUUID(),
        name: patchName,
        radius_km: selectedRadius,
        created_at: new Date().toISOString(),
      };
      await insertPatch(db, patch);
      dispatch({ type: 'SET_PATCH', payload: patch });
    }
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
            {!isEditing && <StepDots current={3} />}
          </View>
          <View style={{ width: 36 }} />
        </View>

        <View style={{ flex: 1 }} />

        {/* Content */}
        <View style={[styles.content, { paddingBottom: bottom + space.xl }]}>
          <Text style={styles.headline}>
            How big is{'\n'}{params.patchName ?? 'your patch'}?
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

          <Pressable style={styles.cta} onPress={handleConfirm}>
            <Text style={styles.ctaText}>{isEditing ? 'Save changes' : 'Start watching'}</Text>
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
    color: colors.white,
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
    color: colors.white,
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
    color: colors.white,
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
    color: colors.white,
  },
});
