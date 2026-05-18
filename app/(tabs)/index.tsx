import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { SkyHero } from '@/components/SkyHero';
import { SKY_SUNRISE, SKY_DAY, SKY_SUNSET } from '@/skies';

const SKIES = [SKY_SUNRISE, SKY_DAY, SKY_SUNSET];
const HOME_SKY = SKIES[Math.floor(Math.random() * SKIES.length)];
import { colors, type as t, space, radius } from '@/tokens';
import { usePatch } from '@/context/PatchContext';
import type { ToastPayload } from '@/context/PatchContext';
import {
  getYearSpeciesCount, getAllTimeSpeciesCount,
  getRecentSightings, getYearSpeciesList,
} from '@/db/database';
import type { Sighting } from '@/db/database';
import { getWatchSpecies, currentSeason } from '@/data/phenology';
import type { WatchSpecies } from '@/data/phenology';

const HERO_HEIGHT = 300;
const FAB_SIZE = 56;

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const day = d.getDate();
  const month = months[d.getMonth()];
  if (d.getFullYear() === now.getFullYear()) return `${day} ${month}`;
  return `${day} ${month} ${d.getFullYear()}`;
}

export default function PatchHome() {
  const { state, dispatch } = usePatch();
  const db = useSQLiteContext();
  const { top, bottom } = useSafeAreaInsets();

  const [yearCount, setYearCount] = useState(0);
  const [allTimeCount, setAllTimeCount] = useState(0);
  const [recentSightings, setRecentSightings] = useState<Sighting[]>([]);
  const [yearSpecies, setYearSpecies] = useState<string[]>([]);

  const [activeToast, setActiveToast] = useState<ToastPayload | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  async function loadData() {
    if (!state.patch) return;
    const year = new Date().getFullYear();
    const [yc, atc, recent, ys] = await Promise.all([
      getYearSpeciesCount(db, state.patch.id, year),
      getAllTimeSpeciesCount(db, state.patch.id),
      getRecentSightings(db, state.patch.id),
      getYearSpeciesList(db, state.patch.id, year),
    ]);
    setYearCount(yc);
    setAllTimeCount(atc);
    setRecentSightings(recent);
    setYearSpecies(ys);
  }

  useEffect(() => {
    loadData();
  }, [state.patch?.id]);

  useEffect(() => {
    if (!state.pendingToast) return;
    loadData();
    triggerToast(state.pendingToast);
    dispatch({ type: 'SET_TOAST', payload: null });
  }, [state.pendingToast]);

  function triggerToast(payload: ToastPayload) {
    clearTimeout(toastTimer.current);
    setActiveToast(payload);
    toastAnim.setValue(0);
    Animated.timing(toastAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(
        () => setActiveToast(null),
      );
    }, 2400);
  }

  const watchSpecies = useMemo<WatchSpecies[]>(() => {
    return getWatchSpecies(currentSeason())
      .slice()
      .sort((a, b) => {
        const aLogged = yearSpecies.includes(a.species);
        const bLogged = yearSpecies.includes(b.species);
        if (aLogged === bLogged) return 0;
        return aLogged ? 1 : -1;
      })
      .slice(0, 3);
  }, [yearSpecies]);

  function toastMessage(payload: ToastPayload): string {
    if (payload.type === 'logged') return `${payload.species} logged`;
    if (payload.type === 'new') return `${payload.species} — new for your patch`;
    return `${payload.species} — first of the year`;
  }

  const toastIsAccent = activeToast?.type === 'new' || activeToast?.type === 'year';

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + FAB_SIZE + space.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={{ height: HERO_HEIGHT }}>
          <SkyHero bands={HOME_SKY} height={HERO_HEIGHT} showTrees={false} />
          <Text style={[styles.patchName, { top: top + space.md }]}>
            {state.patch?.name ?? ''}
          </Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.statBoxLeft]}>
            <Text style={styles.statNumber}>{yearCount}</Text>
            <Text style={styles.statLabel}>This year</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={[styles.statBox, styles.statBoxRight]}>
            <Text style={styles.statNumber}>{allTimeCount}</Text>
            <Text style={styles.statLabel}>All time</Text>
          </View>
        </View>

        {/* Keep an eye out */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Keep an eye out</Text>
          {watchSpecies.map(ws => (
            <View key={ws.species} style={styles.watchRow}>
              <View style={styles.watchText}>
                <Text style={styles.watchSpecies}>{ws.species}</Text>
                <Text style={styles.watchHint}>{ws.hint}</Text>
              </View>
              <View style={[styles.watchDot, { opacity: ws.imminent ? 1 : 0.35 }]} />
            </View>
          ))}
        </View>

        {/* Recent sightings */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Recent sightings</Text>
          {recentSightings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nothing logged yet</Text>
              <Text style={styles.emptyHint}>Tap + to record your first sighting</Text>
            </View>
          ) : (
            recentSightings.map(s => (
              <View key={s.id} style={styles.sightingRow}>
                <View style={styles.sightingMain}>
                  <Text style={styles.sightingSpecies}>{s.species}</Text>
                  <Text style={styles.sightingMeta}>
                    {formatDate(s.seen_at)}{s.notes ? ` · ${s.notes}` : ''}
                  </Text>
                </View>
                {s.count > 1 && (
                  <Text style={styles.sightingCount}>{s.count}</Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={[styles.fab, { bottom: bottom + space.lg }]}
        onPress={() => router.push('/(tabs)/log')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

      {/* Toast */}
      {activeToast && (
        <Animated.View
          style={[
            styles.toast,
            { bottom: bottom + space.lg + FAB_SIZE + space.sm },
            toastIsAccent ? styles.toastAccent : styles.toastDark,
            { opacity: toastAnim, transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.toastText}>{toastMessage(activeToast)}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.parchment },
  scroll: { flex: 1 },
  content: {},

  patchName: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    ...t.label,
    color: colors.amber,
    fontSize: 11,
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.parchment,
    borderBottomWidth: 1,
    borderBottomColor: colors.parchmentBorder,
  },
  statBox: {
    flex: 1,
    paddingVertical: space.lg,
    alignItems: 'center',
    gap: space.xs,
  },
  statBoxLeft: { paddingLeft: space.lg },
  statBoxRight: { paddingRight: space.lg },
  statDivider: {
    width: 1,
    marginVertical: space.md,
    backgroundColor: colors.parchmentBorder,
  },
  statNumber: { ...t.statLarge },
  statLabel: { ...t.label },

  section: {
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.sm,
    gap: 0,
  },
  sectionLabel: {
    ...t.label,
    marginBottom: space.md,
  },

  watchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.parchmentBorder,
  },
  watchText: { flex: 1, gap: 2 },
  watchSpecies: { ...t.speciesName },
  watchHint: { ...t.body, fontSize: 12 },
  watchDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.amber,
    marginLeft: space.sm,
  },

  sightingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.parchmentBorder,
  },
  sightingMain: { flex: 1, gap: 2 },
  sightingSpecies: { ...t.speciesName },
  sightingMeta: { ...t.meta },
  sightingCount: { ...t.meta, color: colors.inkMid, marginLeft: space.sm },

  emptyState: {
    paddingVertical: space.xl,
    alignItems: 'center',
    gap: space.xs,
  },
  emptyText: { ...t.body, color: colors.inkMid },
  emptyHint: { ...t.meta, color: colors.inkFaint },

  fab: {
    position: 'absolute',
    alignSelf: 'center',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  fabIcon: {
    fontSize: 28,
    color: colors.white,
    lineHeight: 32,
    fontWeight: '300',
  },

  toast: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm + 2,
    borderRadius: radius.pill,
    maxWidth: '80%',
  },
  toastDark: {
    backgroundColor: 'rgba(13,11,24,0.92)',
  },
  toastAccent: {
    backgroundColor: 'rgba(200,125,58,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(200,125,58,0.4)',
  },
  toastText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.white,
    textAlign: 'center',
  },
});
