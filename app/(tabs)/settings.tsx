import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { colors, type as t, space } from '@/tokens';
import { usePatch } from '@/context/PatchContext';
import { getAllPatches, getAllSightings, getAllJournalEntries } from '@/db/database';

const HEADER_BG = '#2d3b2a';

export default function SettingsScreen() {
  const { top } = useSafeAreaInsets();
  const { state, dispatch } = usePatch();
  const db = useSQLiteContext();
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    try {
      const [patches, sightings, journal] = await Promise.all([
        getAllPatches(db),
        getAllSightings(db),
        getAllJournalEntries(db),
      ]);
      const date = new Date().toISOString().slice(0, 10);
      const json = JSON.stringify({ exported_at: new Date().toISOString(), patches, sightings, journal }, null, 2);
      const path = `${FileSystem.cacheDirectory}patch-export-${date}.json`;
      await FileSystem.writeAsStringAsync(path, json, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(path, { mimeType: 'application/json', dialogTitle: 'Export your Patch data' });
    } finally {
      setExporting(false);
    }
  }

  function editPatch() {
    if (!state.patch) return;
    dispatch({ type: 'SET_EDITING_PATCH', payload: true });
    router.navigate(
      `/onboarding/name?currentName=${encodeURIComponent(state.patch.name)}&currentRadius=${state.patch.radius_km}&editing=true`,
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: top + space.sm }]}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.sectionLabel}>
        <Text style={styles.sectionLabelText}>Profile</Text>
      </View>
      <Pressable
        style={styles.row}
        onPress={() => router.push(
          `/onboarding/your-name?editing=true&currentName=${encodeURIComponent(state.userName ?? '')}`
        )}
      >
        <Text style={styles.rowLabel}>Your name</Text>
        <View style={styles.rowRight}>
          {state.userName ? <Text style={styles.rowValue}>{state.userName}</Text> : null}
          <Text style={styles.chevron}>›</Text>
        </View>
      </Pressable>

      <View style={styles.sectionLabel}>
        <Text style={styles.sectionLabelText}>Your patch</Text>
      </View>
      <Pressable style={styles.row} onPress={editPatch}>
        <Text style={styles.rowLabel}>Patch name & size</Text>
        <View style={styles.rowRight}>
          {state.patch ? <Text style={styles.rowValue}>{state.patch.name}</Text> : null}
          <Text style={styles.chevron}>›</Text>
        </View>
      </Pressable>

      <View style={styles.sectionLabel}>
        <Text style={styles.sectionLabelText}>Help</Text>
      </View>
      <Pressable style={styles.row} onPress={() => router.push('/(tabs)/settings-guide')}>
        <Text style={styles.rowLabel}>How to use Patch</Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <View style={styles.sectionLabel}>
        <Text style={styles.sectionLabelText}>Feedback</Text>
      </View>
      <Pressable style={styles.row} onPress={() => Linking.openURL('https://github.com/stuurps/mypatch/issues')}>
        <Text style={styles.rowLabel}>Send feedback</Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
      <View style={styles.sectionLabel}>
        <Text style={styles.sectionLabelText}>Data</Text>
      </View>
      <Pressable style={styles.row} onPress={handleExport} disabled={exporting}>
        <Text style={[styles.rowLabel, exporting && styles.rowLabelMuted]}>
          {exporting ? 'Exporting…' : 'Export your data'}
        </Text>
        {!exporting && <Text style={styles.chevron}>›</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.parchment },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEADER_BG,
    paddingHorizontal: space.md,
    paddingBottom: space.md,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 26, color: colors.white, lineHeight: 30 },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },

  sectionLabel: {
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.xs,
  },
  sectionLabelText: { ...t.label, color: colors.inkFaint },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.parchmentBorder,
  },
  rowLabel: { fontSize: 15, fontWeight: '400', color: colors.inkDark },
  rowLabelMuted: { color: colors.inkFaint },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  rowValue: { fontSize: 14, color: colors.inkFaint },
  chevron: { fontSize: 18, color: colors.inkFaint, lineHeight: 22 },
});
