import React, { useState, useEffect } from 'react';
import { View, Text, SectionList, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { usePatch } from '@/context/PatchContext';
import { getSightingsByMonth } from '@/db/database';
import type { Sighting } from '@/db/database';
import { TimeOfDayIcon } from '@/components/TimeOfDayIcon';
import { ConditionsIcon } from '@/components/ConditionsIcon';
import type { Conditions } from '@/components/ConditionsIcon';
import { timeOfDayFromHour } from '@/skies';
import type { TimeOfDay } from '@/skies';
import { colors, type as t, space } from '@/tokens';

const FOREST_GREEN = '#2d3b2a';
const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();
const CURRENT_MONTH = NOW.getMonth() + 1;

const TOD_LABELS: Record<TimeOfDay, string> = {
  dawn: 'Dawn', day: 'Day', dusk: 'Dusk', night: 'Night',
};

function getSightingPeriod(s: Sighting): TimeOfDay {
  if (s.time_of_day) return s.time_of_day as TimeOfDay;
  return timeOfDayFromHour(new Date(s.seen_at).getHours());
}

function prevMonth(year: number, month: number) {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

function nextMonth(year: number, month: number) {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

function monthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function formatDayHeader(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

function groupByDay(sightings: Sighting[]): { title: string; data: Sighting[] }[] {
  const map = new Map<string, Sighting[]>();
  for (const s of sightings) {
    const dayKey = s.seen_at.slice(0, 10);
    if (!map.has(dayKey)) map.set(dayKey, []);
    map.get(dayKey)!.push(s);
  }
  return Array.from(map.entries()).map(([dayKey, data]) => ({
    title: formatDayHeader(dayKey),
    data,
  }));
}

export default function HistoryScreen() {
  const { state } = usePatch();
  const db = useSQLiteContext();
  const { top, bottom } = useSafeAreaInsets();

  const [viewYear, setViewYear] = useState(CURRENT_YEAR);
  const [viewMonth, setViewMonth] = useState(CURRENT_MONTH);
  const [sightings, setSightings] = useState<Sighting[]>([]);

  useEffect(() => {
    if (!state.patch) return;
    getSightingsByMonth(db, state.patch.id, viewYear, viewMonth).then(setSightings);
  }, [state.patch?.id, viewYear, viewMonth]);

  const sections = groupByDay(sightings);
  const speciesCount = new Set(sightings.map(s => s.species)).size;
  const atMax = viewYear === CURRENT_YEAR && viewMonth === CURRENT_MONTH;

  function goBack() {
    const p = prevMonth(viewYear, viewMonth);
    setViewYear(p.year);
    setViewMonth(p.month);
  }

  function goForward() {
    if (atMax) return;
    const n = nextMonth(viewYear, viewMonth);
    setViewYear(n.year);
    setViewMonth(n.month);
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: top + space.sm }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backChevron}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>History</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.monthNav}>
        <Pressable style={styles.navArrow} onPress={goBack} hitSlop={12}>
          <Text style={styles.navArrowText}>‹</Text>
        </Pressable>
        <View style={styles.monthLabelBox}>
          <Text style={styles.monthLabelText}>{monthLabel(viewYear, viewMonth)}</Text>
          {sightings.length > 0 && (
            <Text style={styles.monthStats}>
              {speciesCount} species · {sightings.length} {sightings.length === 1 ? 'record' : 'records'}
            </Text>
          )}
        </View>
        <Pressable
          style={[styles.navArrow, atMax && styles.navArrowDisabled]}
          onPress={goForward}
          hitSlop={12}
          disabled={atMax}
        >
          <Text style={[styles.navArrowText, atMax && styles.navArrowTextDisabled]}>›</Text>
        </Pressable>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={s => s.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottom + space.xl }}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>{title}</Text>
          </View>
        )}
        renderItem={({ item: s }) => (
          <Pressable
            style={styles.sightingRow}
            onPress={() => router.push(`/(tabs)/species?species=${encodeURIComponent(s.species)}`)}
          >
            <View style={styles.sightingMain}>
              <Text style={styles.sightingSpecies}>{s.species}</Text>
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
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nothing logged in {monthLabel(viewYear, viewMonth)}.</Text>
          </View>
        }
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

  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.parchmentBorder,
    backgroundColor: colors.parchment,
  },
  navArrow: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowDisabled: {
    opacity: 0,
  },
  navArrowText: {
    fontSize: 24,
    color: colors.inkDark,
    lineHeight: 28,
  },
  navArrowTextDisabled: {
    color: colors.inkFaint,
  },
  monthLabelBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  monthLabelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.inkDark,
  },
  monthStats: {
    ...t.meta,
    color: colors.inkFaint,
  },

  sectionHeader: {
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.sm,
  },
  sectionLabel: {
    ...t.label,
    color: colors.amber,
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
  sightingSpecies: { ...t.speciesName },
  sightingMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sightingMeta: { ...t.meta },
  sightingCount: { ...t.meta, color: colors.inkMid, marginLeft: space.sm },

  emptyState: {
    paddingVertical: space.xl,
    paddingHorizontal: space.lg,
    alignItems: 'center',
  },
  emptyText: { ...t.body, color: colors.inkFaint },
});
