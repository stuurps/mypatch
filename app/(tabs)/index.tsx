import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet, Animated, Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { SkyHero } from '@/components/SkyHero';
import { SKY_DAY, timeOfDayFromHour } from '@/skies';
import type { TimeOfDay } from '@/skies';
import { TimeOfDayIcon } from '@/components/TimeOfDayIcon';
import { ConditionsIcon } from '@/components/ConditionsIcon';
import type { Conditions } from '@/components/ConditionsIcon';

const HOME_SKY = SKY_DAY;
import { colors, type as t, space, radius } from '@/tokens';
import { usePatch } from '@/context/PatchContext';
import type { ToastPayload } from '@/context/PatchContext';
import {
  getYearSightingsCount, getAllTimeSightingsCount,
  getRecentSightings, getYearSpeciesList,
} from '@/db/database';
import type { Sighting } from '@/db/database';
import { getWatchSpecies, currentSeason } from '@/data/phenology';
import type { WatchSpecies } from '@/data/phenology';
import { formatDate } from '@/utils/format';

const HERO_HEIGHT = 260;
const TABBAR_HEIGHT = 49;

const TOD_LABELS: Record<TimeOfDay, string> = {
  dawn: 'Dawn', day: 'Day', dusk: 'Dusk', night: 'Night',
};

function isToday(dateStr: string): boolean {
  const today = new Date();
  const d = new Date(dateStr);
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

function getSightingPeriod(s: { time_of_day?: string | null; seen_at: string }): TimeOfDay {
  if (s.time_of_day) return s.time_of_day as TimeOfDay;
  return timeOfDayFromHour(new Date(s.seen_at).getHours());
}

function renderSightingRow(s: Sighting) {
  return (
    <Pressable
      key={s.id}
      style={styles.sightingRow}
      onPress={() => router.push(`/(tabs)/edit?id=${s.id}`)}
    >
      <View style={styles.sightingMain}>
        <Text style={styles.sightingSpecies}>{s.species}</Text>
        <View style={styles.sightingMetaRow}>
          <TimeOfDayIcon period={getSightingPeriod(s)} size={12} color={colors.inkFaint} />
          <Text style={styles.sightingMeta}>{TOD_LABELS[getSightingPeriod(s)]}</Text>
          {s.conditions && (
            <ConditionsIcon condition={s.conditions as Conditions} size={12} color={colors.inkFaint} />
          )}
          <Text style={styles.sightingMeta}>
            · {formatDate(s.seen_at)}{s.notes ? ` · ${s.notes}` : ''}
          </Text>
        </View>
      </View>
      {s.count > 1 && (
        <Text style={styles.sightingCount}>{s.count}</Text>
      )}
    </Pressable>
  );
}

export default function PatchHome() {
  const { state, dispatch } = usePatch();
  const db = useSQLiteContext();
  const { bottom } = useSafeAreaInsets();

  const [yearCount, setYearCount] = useState(0);
  const [allTimeCount, setAllTimeCount] = useState(0);
  const [recentSightings, setRecentSightings] = useState<Sighting[]>([]);
  const [yearSpecies, setYearSpecies] = useState<string[]>([]);

  const [activeToast, setActiveToast] = useState<ToastPayload | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const loadData = useCallback(async () => {
    if (!state.patch) return;
    const year = new Date().getFullYear();
    const [yc, atc, recent, ys] = await Promise.all([
      getYearSightingsCount(db, state.patch.id, year),
      getAllTimeSightingsCount(db, state.patch.id),
      getRecentSightings(db, state.patch.id),
      getYearSpeciesList(db, state.patch.id, year),
    ]);
    setYearCount(yc);
    setAllTimeCount(atc);
    setRecentSightings(recent);
    setYearSpecies(ys);
  }, [state.patch?.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

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

  const todaySightings = useMemo(() => recentSightings.filter(s => isToday(s.seen_at)), [recentSightings]);
  const earlierSightings = useMemo(() => recentSightings.filter(s => !isToday(s.seen_at)), [recentSightings]);
  const todaySpeciesCount = useMemo(() => new Set(todaySightings.map(s => s.species)).size, [todaySightings]);

  function toastMessage(payload: ToastPayload): string {
    if (payload.type === 'logged') return `${payload.species} logged`;
    if (payload.type === 'new') return `${payload.species} — new for your patch`;
    if (payload.type === 'deleted') return `${payload.species} removed`;
    return `${payload.species} — first of the year`;
  }

  const toastIsAccent = activeToast?.type === 'new' || activeToast?.type === 'year';

  const listHeader = useMemo(() => {
    function onLongPressPatchName() {
      if (!state.patch) return;
      Alert.alert('', state.patch.name, [
        {
          text: 'Edit patch',
          onPress: () => {
            dispatch({ type: 'SET_EDITING_PATCH', payload: true });
            router.navigate(
              `/onboarding/name?currentName=${encodeURIComponent(state.patch!.name)}&currentRadius=${state.patch!.radius_km}&editing=true`,
            );
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }

    return (
    <>
      {/* Hero */}
      <View style={{ height: HERO_HEIGHT }}>
        <SkyHero bands={HOME_SKY} height={HERO_HEIGHT} showTrees={false} />
        <Pressable
          style={styles.heroOverlay}
          onLongPress={onLongPressPatchName}
          delayLongPress={400}
        >
          <Text style={styles.patchName}>{state.patch?.name}</Text>
        </Pressable>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, styles.statBoxLeft]}>
          <Text style={styles.statNumber}>{yearCount}</Text>
          <Text style={styles.statLabel}>Sightings this year</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={[styles.statBox, styles.statBoxRight]}>
          <Text style={styles.statNumber}>{allTimeCount}</Text>
          <Text style={styles.statLabel}>All time</Text>
        </View>
      </View>

      {/* Species today */}
      {todaySpeciesCount > 0 && (
        <View style={styles.todayBar}>
          <Text style={styles.todayBarText}>{todaySpeciesCount} species today</Text>
        </View>
      )}

      {/* Your patch link */}
      <Pressable
        style={styles.patchLink}
        onPress={() => router.navigate('/(tabs)/poster')}
      >
        <Text style={styles.patchLinkText}>Sightings log</Text>
        <Text style={styles.patchLinkChevron}>›</Text>
      </Pressable>

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

      {/* Empty state */}
      {recentSightings.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nothing logged yet</Text>
          <Text style={styles.emptyHint}>Tap + to record your first sighting</Text>
        </View>
      )}

      {/* Today's sightings */}
      {todaySightings.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.todaySectionLabel}>Today</Text>
          </View>
          {todaySightings.map(s => renderSightingRow(s))}
        </>
      )}

      {/* Earlier sightings label */}
      {earlierSightings.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Recent sightings</Text>
        </View>
      )}
    </>
    );
  }, [state.patch?.name, state.patch?.radius_km, yearCount, allTimeCount, watchSpecies, todaySightings, earlierSightings, todaySpeciesCount, recentSightings.length]);

  return (
    <View style={styles.root}>
      <FlatList
        data={earlierSightings}
        keyExtractor={s => s.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: space.xl }}
        ListHeaderComponent={listHeader}
        renderItem={({ item: s }) => renderSightingRow(s)}
      />

      {/* Toast */}
      {activeToast && (
        <Animated.View
          style={[
            styles.toast,
            { bottom: bottom + TABBAR_HEIGHT + space.md },
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
  list: { flex: 1 },

  heroOverlay: {
    position: 'absolute',
    bottom: space.lg,
    left: space.lg,
    right: space.lg,
  },
  patchName: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.amber,
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
  statBoxLeft: {},
  statBoxRight: {},
  statDivider: { display: 'none' },
  statNumber: { ...t.statLarge },
  statLabel: { ...t.label },

  patchLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.parchmentBorder,
  },
  patchLinkText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.inkLight,
  },
  patchLinkChevron: {
    fontSize: 18,
    color: colors.inkFaint,
    lineHeight: 22,
  },

  section: {
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.sm,
    gap: 0,
  },
  sectionHeader: {
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.sm,
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
    paddingHorizontal: space.lg,
    borderTopWidth: 1,
    borderTopColor: colors.parchmentBorder,
  },
  sightingMain: { flex: 1, gap: 2 },
  sightingSpecies: { ...t.speciesName },
  sightingMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sightingMeta: { ...t.meta },
  sightingCount: { ...t.meta, color: colors.inkMid, marginLeft: space.sm },

  todayBar: {
    paddingHorizontal: space.lg,
    paddingVertical: space.xs,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.parchmentBorder,
    backgroundColor: colors.parchment,
  },
  todayBarText: {
    ...t.label,
    color: colors.inkFaint,
  },
  todaySectionLabel: {
    ...t.label,
    color: colors.amber,
    marginBottom: space.md,
  },

  emptyState: {
    paddingVertical: space.xl,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    gap: space.xs,
  },
  emptyText: { ...t.body, color: colors.inkMid },
  emptyHint: { ...t.meta, color: colors.inkFaint },

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
