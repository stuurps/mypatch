import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, SectionList, Pressable } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { SkyHero } from '@/components/SkyHero';
import { skyForSighting, timeOfDayFromHour } from '@/skies';
import { colors, type as t, space, radius } from '@/tokens';
import { usePatch } from '@/context/PatchContext';
import { getYearJournalCount, getAllTimeJournalCount, getMonthJournalCount, getJournalEntries, JournalEntry } from '@/db/database';
import { formatDate } from '@/utils/format';

type Section = { title: string; data: JournalEntry[] };

function groupByDate(entries: JournalEntry[]): Section[] {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  function sameDay(a: Date, b: Date) {
    return a.getDate() === b.getDate()
      && a.getMonth() === b.getMonth()
      && a.getFullYear() === b.getFullYear();
  }

  const map = new Map<string, JournalEntry[]>();
  for (const entry of entries) {
    const d = new Date(entry.created_at);
    const key = sameDay(d, today) ? 'Today'
      : sameDay(d, yesterday) ? 'Yesterday'
      : formatDate(entry.created_at);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(entry);
  }
  return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
}

const HERO_HEIGHT = 260;

function greetingText(userName: string | null): string {
  const h = new Date().getHours();
  let period: string;
  if (h >= 5 && h <= 11) period = 'Morning';
  else if (h >= 12 && h <= 16) period = 'Afternoon';
  else if (h >= 17 && h <= 20) period = 'Evening';
  else period = 'Night';
  if (userName) return `${period}, ${userName}`;
  return period;
}

export default function JournalScreen() {
  const { bottom } = useSafeAreaInsets();
  const { state } = usePatch();
  const db = useSQLiteContext();

  const [journalSky] = useState(skyForSighting);
  const [isNight] = useState(() => timeOfDayFromHour(new Date().getHours()) === 'night');
  const [yearCount, setYearCount] = useState(0);
  const [allTimeCount, setAllTimeCount] = useState(0);
  const [monthCount, setMonthCount] = useState(0);
  const [sections, setSections] = useState<Section[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!state.patch) return;
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      Promise.all([
        getYearJournalCount(db, state.patch.id, year),
        getAllTimeJournalCount(db, state.patch.id),
        getMonthJournalCount(db, state.patch.id, year, month),
        getJournalEntries(db, state.patch.id),
      ]).then(([yc, atc, mc, ents]) => {
        setYearCount(yc);
        setAllTimeCount(atc);
        setMonthCount(mc);
        setSections(groupByDate(ents));
      });
    }, [state.patch?.id]),
  );

  return (
    <View style={styles.root}>
      <SkyHero bands={journalSky} height={HERO_HEIGHT} showTrees={false} stars={isNight}>
        <View style={styles.heroGreeting}>
          <Text style={styles.greetingLine}>{greetingText(state.userName)}</Text>
          <Text style={styles.greetingPhrase}>Your {state.patch?.name ?? 'patch'}</Text>
        </View>
      </SkyHero>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{monthCount}</Text>
          <Text style={styles.statLabel}>This month</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{yearCount}</Text>
          <Text style={styles.statLabel}>This year</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{allTimeCount}</Text>
          <Text style={styles.statLabel}>All time</Text>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listHeaderLabel}>Your entries</Text>
        <Pressable
          style={styles.composeBtn}
          hitSlop={8}
          onPress={() => router.push('/(tabs)/journal-compose')}
        >
          <Text style={styles.composeBtnText}>+</Text>
        </Pressable>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: bottom + space.lg }}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, title === 'Today' && styles.sectionLabelToday]}>
              {title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            style={styles.entryRow}
            onPress={() => router.push(`/(tabs)/journal-edit?id=${item.id}`)}
          >
            <Text style={styles.entryPreview} numberOfLines={2}>
              {item.body.split('\n').find(l => l.trim()) ?? ''}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Your first entry is waiting.</Text>
            <Text style={styles.emptyHint}>Tap + to write about your visit.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.parchment,
  },

  heroGreeting: {
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingBottom: space.xl,
    gap: 6,
  },
  greetingLine: {
    fontSize: 28,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  greetingPhrase: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.55)',
    textAlign: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.parchment,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    gap: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.parchmentBorder,
  },
  statBox: {
    flex: 1,
    paddingVertical: space.lg,
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: colors.white,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
  },
  statNumber: { ...t.statLarge },
  statLabel: { ...t.label },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.parchmentBorder,
  },
  listHeaderLabel: { ...t.label },
  composeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  composeBtnText: { fontSize: 22, color: colors.amber, lineHeight: 26 },

  list: { flex: 1 },
  sectionHeader: {
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.sm,
  },
  sectionLabel: { ...t.label },
  sectionLabelToday: { color: colors.amber },
  entryRow: {
    paddingVertical: space.sm,
    paddingHorizontal: space.lg,
    borderTopWidth: 1,
    borderTopColor: colors.parchmentBorder,
  },
  entryPreview: { ...t.body, color: colors.inkMid },
  emptyState: { paddingVertical: space.xl, paddingHorizontal: space.lg, alignItems: 'center', gap: space.xs },
  emptyText: { ...t.body, color: colors.inkMid },
  emptyHint: { ...t.meta, color: colors.inkFaint },
});
