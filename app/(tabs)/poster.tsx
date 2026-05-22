import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { router } from 'expo-router';
import { SKY_SUNRISE } from '@/skies';
import { SkyHero } from '@/components/SkyHero';
import { usePatch } from '@/context/PatchContext';
import {
  getPatchSpeciesWithCounts, getPatchSpecies,
  getAllTimeSightingsCount, getFirstSightingDate,
} from '@/db/database';
import { colors, type as t, space, radius } from '@/tokens';
import { formatSince } from '@/utils/format';

const CURRENT_YEAR = new Date().getFullYear();
const TILE_GAP = space.sm;
const TILE_COLS = 3;
const HERO_HEIGHT = 220;

type SpeciesStat = { species: string; record_count: number };

export default function YourPatch() {
  const { state } = usePatch();
  const db = useSQLiteContext();
  const { top, bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [filter, setFilter] = useState<'all' | 'year'>('all');
  const [allSpecies, setAllSpecies] = useState<SpeciesStat[]>([]);
  const [yearSpecies, setYearSpecies] = useState<Set<string>>(new Set());
  const [totalRecords, setTotalRecords] = useState(0);
  const [firstSeen, setFirstSeen] = useState<string | null>(null);

  const tileWidth = (width - space.md * 2 - TILE_GAP * (TILE_COLS - 1)) / TILE_COLS;

  useEffect(() => {
    if (!state.patch) return;
    Promise.all([
      getPatchSpeciesWithCounts(db, state.patch.id),
      getPatchSpecies(db, state.patch.id, CURRENT_YEAR),
      getAllTimeSightingsCount(db, state.patch.id),
      getFirstSightingDate(db, state.patch.id),
    ]).then(([all, year, records, first]) => {
      setAllSpecies(all);
      setYearSpecies(new Set(year));
      setTotalRecords(records);
      setFirstSeen(first);
    });
  }, [state.patch?.id]);

  const displaySpecies = filter === 'year'
    ? allSpecies.filter(s => yearSpecies.has(s.species))
    : allSpecies;

  const sorted = [...displaySpecies].sort((a, b) => {
    const aAmber = yearSpecies.has(a.species);
    const bAmber = yearSpecies.has(b.species);
    if (aAmber !== bAmber) return aAmber ? -1 : 1;
    return a.species.localeCompare(b.species);
  });

  const statsLine = firstSeen
    ? `${totalRecords} records · since ${formatSince(firstSeen)}`
    : totalRecords > 0 ? `${totalRecords} records` : null;

  const header = (
    <>
      <View style={{ height: HERO_HEIGHT }}>
        <SkyHero bands={SKY_SUNRISE} height={HERO_HEIGHT} showTrees={false} />
        <Pressable
          style={[styles.backButton, { top: top + space.sm }]}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <Text style={styles.backChevron}>‹</Text>
        </Pressable>
        <View style={[styles.heroContent, { paddingTop: top }]}>
          <Text style={styles.heroPatchName} numberOfLines={1}>
            {state.patch?.name ?? ''}
          </Text>
          <Text style={styles.heroCount}>{allSpecies.length}</Text>
          <Text style={styles.heroLabel}>SPECIES</Text>
          {statsLine != null && <Text style={styles.heroStats}>{statsLine}</Text>}
        </View>
      </View>
      <View style={styles.filterBar}>
        <Pressable
          style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All time
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterPill, filter === 'year' && styles.filterPillActive]}
          onPress={() => setFilter('year')}
        >
          <Text style={[styles.filterText, filter === 'year' && styles.filterTextActive]}>
            {CURRENT_YEAR}
          </Text>
        </Pressable>
      </View>
    </>
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={sorted}
        keyExtractor={item => item.species}
        numColumns={TILE_COLS}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No species yet.</Text>
            <Text style={styles.emptyHint}>Every bird you log appears here.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: bottom + space.xl }}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isThisYear = yearSpecies.has(item.species);
          return (
            <Pressable
              style={[styles.tile, { width: tileWidth }, isThisYear && styles.tileThisYear]}
              onPress={() => router.push(`/(tabs)/species?species=${encodeURIComponent(item.species)}`)}
            >
              {isThisYear && <View style={styles.tileAccent} />}
              <Text style={styles.tileName} numberOfLines={2}>{item.species}</Text>
              <Text style={styles.tileCount}>{item.record_count}</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.parchment,
  },

  backButton: {
    position: 'absolute',
    left: space.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: {
    fontSize: 22,
    color: colors.white,
    lineHeight: 26,
    marginTop: -1,
  },

  heroContent: {
    position: 'absolute',
    top: 0,
    left: space.lg,
    right: space.lg,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  heroPatchName: {
    ...t.label,
    color: colors.amber,
    marginBottom: 4,
  },
  heroCount: {
    fontSize: 52,
    fontWeight: '600',
    color: colors.white,
    lineHeight: 56,
  },
  heroLabel: {
    ...t.label,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  heroStats: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 6,
  },

  filterBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: space.sm,
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.lg,
    backgroundColor: colors.parchment,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.parchmentBorder,
  },
  filterPill: {
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    backgroundColor: colors.white,
  },
  filterPillActive: {
    backgroundColor: colors.amber,
    borderColor: colors.amber,
  },
  filterText: {
    ...t.meta,
    fontWeight: '500',
    color: colors.inkMid,
  },
  filterTextActive: {
    color: colors.white,
  },

  row: {
    paddingHorizontal: space.md,
    gap: TILE_GAP,
    marginTop: TILE_GAP,
  },

  tile: {
    minHeight: 66,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    backgroundColor: colors.white,
    paddingHorizontal: space.xs + 2,
    paddingVertical: space.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tileThisYear: {
    backgroundColor: 'rgba(200,125,58,0.10)',
    borderColor: 'rgba(200,125,58,0.35)',
  },
  tileAccent: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.amber,
  },
  tileName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.inkDark,
    textAlign: 'center',
    lineHeight: 17,
  },
  tileCount: {
    position: 'absolute',
    bottom: 4,
    right: 6,
    fontSize: 10,
    fontWeight: '500',
    color: colors.inkFaint,
  },

  empty: {
    paddingVertical: space.xl,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    gap: space.xs,
  },
  emptyText: {
    fontSize: 14,
    color: colors.inkMid,
  },
  emptyHint: {
    fontSize: 11,
    color: colors.inkFaint,
  },
});
