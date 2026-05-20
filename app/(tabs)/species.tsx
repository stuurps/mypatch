import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { usePatch } from '@/context/PatchContext';
import { getSpeciesSightings } from '@/db/database';
import type { Sighting } from '@/db/database';
import { TimeOfDayIcon } from '@/components/TimeOfDayIcon';
import { ConditionsIcon } from '@/components/ConditionsIcon';
import type { Conditions } from '@/components/ConditionsIcon';
import { timeOfDayFromHour } from '@/skies';
import type { TimeOfDay } from '@/skies';
import { colors, type as t, space } from '@/tokens';
import { formatDate } from '@/utils/format';

const FOREST_GREEN = '#2d3b2a';

const TOD_LABELS: Record<TimeOfDay, string> = {
  dawn: 'Dawn', day: 'Day', dusk: 'Dusk', night: 'Night',
};

function getSightingPeriod(s: { time_of_day?: string | null; seen_at: string }): TimeOfDay {
  if (s.time_of_day) return s.time_of_day as TimeOfDay;
  return timeOfDayFromHour(new Date(s.seen_at).getHours());
}

export default function SpeciesDetail() {
  const { species: rawSpecies } = useLocalSearchParams<{ species: string }>();
  const species = decodeURIComponent(rawSpecies ?? '');
  const { state } = usePatch();
  const db = useSQLiteContext();
  const { top } = useSafeAreaInsets();
  const [sightings, setSightings] = useState<Sighting[]>([]);

  const loadData = useCallback(async () => {
    if (!state.patch) return;
    const results = await getSpeciesSightings(db, state.patch.id, species);
    setSightings(results);
  }, [state.patch?.id, species]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const firstSeen = sightings.length > 0 ? formatDate(sightings[sightings.length - 1].seen_at) : '—';
  const lastSeen = sightings.length > 0 ? formatDate(sightings[0].seen_at) : '—';
  const recordCount = sightings.length;
  const statsLine = `First seen ${firstSeen}  ·  Last seen ${lastSeen}  ·  ${recordCount} ${recordCount === 1 ? 'record' : 'records'}`;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: top + space.sm }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backChevron}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{species}</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.statsText}>{statsLine}</Text>
      </View>

      <FlatList
        data={sightings}
        keyExtractor={s => s.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: s }) => (
          <View style={styles.sightingRow}>
            <View style={styles.sightingMain}>
              <Text style={styles.sightingDate}>{formatDate(s.seen_at)}</Text>
              <View style={styles.sightingMetaRow}>
                <TimeOfDayIcon period={getSightingPeriod(s)} size={12} color={colors.inkFaint} />
                <Text style={styles.sightingMeta}>{TOD_LABELS[getSightingPeriod(s)]}</Text>
                {s.conditions && (
                  <ConditionsIcon condition={s.conditions as Conditions} size={12} color={colors.inkFaint} />
                )}
                {s.notes && (
                  <Text style={styles.sightingMeta} numberOfLines={1}>· {s.notes}</Text>
                )}
              </View>
            </View>
            {s.count > 1 && (
              <Text style={styles.sightingCount}>{s.count}</Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.parchment },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FOREST_GREEN,
    paddingHorizontal: space.md,
    paddingBottom: space.md,
  },
  backButton: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backChevron: {
    fontSize: 28,
    color: colors.white,
    lineHeight: 32,
    marginTop: -2,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },

  statsRow: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.parchmentBorder,
    backgroundColor: colors.parchment,
  },
  statsText: {
    ...t.label,
    color: colors.inkMid,
    textAlign: 'center',
  },

  listContent: {
    paddingBottom: space.xl,
  },
  sightingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.sm,
    paddingHorizontal: space.lg,
    borderTopWidth: 1,
    borderTopColor: colors.parchmentBorder,
  },
  sightingMain: { flex: 1, gap: 2 },
  sightingDate: { ...t.speciesName },
  sightingMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sightingMeta: { ...t.meta },
  sightingCount: { ...t.meta, color: colors.inkMid, marginLeft: space.sm },
});
