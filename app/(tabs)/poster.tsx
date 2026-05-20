import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { router } from 'expo-router';
import { SKY_SUNRISE } from '@/skies';
import { usePatch } from '@/context/PatchContext';
import { getPatchSpecies } from '@/db/database';
import { colors, type as t, space, radius } from '@/tokens';

const CURRENT_YEAR = new Date().getFullYear();
const TILE_GAP = space.sm;
const TILE_COLS = 3;

export default function YourPatch() {
  const { state } = usePatch();
  const db = useSQLiteContext();
  const { top, bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [filter, setFilter] = useState<'all' | 'year'>('all');
  const [allSpecies, setAllSpecies] = useState<string[]>([]);
  const [yearSpecies, setYearSpecies] = useState<Set<string>>(new Set());

  const tileWidth = (width - space.md * 2 - TILE_GAP * (TILE_COLS - 1)) / TILE_COLS;

  useEffect(() => {
    if (!state.patch) return;
    Promise.all([
      getPatchSpecies(db, state.patch.id),
      getPatchSpecies(db, state.patch.id, CURRENT_YEAR),
    ]).then(([all, year]) => {
      setAllSpecies(all);
      setYearSpecies(new Set(year));
    });
  }, [state.patch?.id]);

  const displaySpecies = filter === 'year'
    ? allSpecies.filter(s => yearSpecies.has(s))
    : allSpecies;

  const sorted = [...displaySpecies].sort((a, b) => {
    const aAmber = yearSpecies.has(a);
    const bAmber = yearSpecies.has(b);
    if (aAmber !== bAmber) return aAmber ? -1 : 1;
    return a.localeCompare(b);
  });

  const count = sorted.length;

  return (
    <View style={styles.root}>
      {/* Sky background — flex bands divide the full screen height equally */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {SKY_SUNRISE.map((color, i) => (
          <View key={i} style={{ flex: 1, backgroundColor: color }} />
        ))}
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: top + space.sm }]}>
        <Text style={styles.patchName} numberOfLines={1}>
          {state.patch?.name ?? ''}
        </Text>
        <View style={styles.headerMeta}>
          <Text style={styles.speciesCount}>
            {count === 1 ? '1 species' : `${count} species`}
          </Text>
          <View style={styles.filterRow}>
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
        </View>
      </View>

      {/* Grid */}
      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nothing logged yet</Text>
          <Text style={styles.emptyHint}>Head out and log your first sighting</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={item => item}
          numColumns={TILE_COLS}
          contentContainerStyle={[styles.grid, { paddingBottom: bottom + space.xl }]}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isThisYear = yearSpecies.has(item);
            return (
              <Pressable
                style={[styles.tile, styles.tilePlain, { width: tileWidth }]}
                onPress={() => router.push(`/(tabs)/species?species=${encodeURIComponent(item)}`)}
              >
                {isThisYear && <View style={styles.tileAccent} />}
                <Text style={styles.tileName} numberOfLines={2}>{item}</Text>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.skyDeepNight,
  },

  header: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    gap: space.sm,
  },
  patchName: {
    ...t.label,
    color: colors.amber,
    fontSize: 11,
    textAlign: 'center',
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  speciesCount: {
    ...t.meta,
    color: 'rgba(255,255,255,0.55)',
  },
  filterRow: {
    flexDirection: 'row',
    gap: space.xs,
  },
  filterPill: {
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  filterPillActive: {
    backgroundColor: colors.amber,
    borderColor: colors.amber,
  },
  filterText: {
    ...t.meta,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  filterTextActive: {
    color: colors.white,
  },

  grid: {
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    gap: TILE_GAP,
  },
  row: {
    gap: TILE_GAP,
  },

  tile: {
    minHeight: 52,
    borderRadius: radius.card,
    borderWidth: 1,
    paddingHorizontal: space.xs + 2,
    paddingVertical: space.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },
  tilePlain: {
    backgroundColor: colors.white,
    borderColor: colors.parchmentBorder,
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

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  emptyHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
  },
});
