import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, type as t, space } from '@/tokens';

const HEADER_BG = '#2d3b2a';

const SECTIONS = [
  {
    title: 'Logging a sighting',
    body: 'Tap the + button in the tab bar. Start typing a species name — results appear after two characters. Set the count, pick a time of day and conditions if you want, add a note, then tap Add to patch. You can log as many species as you like before tapping Done.',
  },
  {
    title: 'Editing or deleting a sighting',
    body: 'Tap any sighting row on the home screen to open it. Change the species, count, date, or notes, then tap Save changes. To remove a sighting entirely, tap Remove sighting — you\'ll be asked to confirm.',
  },
  {
    title: 'Writing a journal entry',
    body: 'Open the Journal tab and tap + in the top right. Write whatever you like — there are no fields, just space for words. Navigate back and your entry is saved automatically. Tap any entry to open and edit it. Long-press an entry to delete it.',
  },
  {
    title: 'Renaming your patch',
    body: 'Long-press your patch name on the home screen and choose Edit patch. You can update the name and the size. Your sightings and journal entries are never affected by a rename.',
  },
];

export default function SettingsGuide() {
  const { top, bottom } = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: top + space.sm }]}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text style={styles.title}>How to use Patch</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + space.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((s, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
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

  scroll: { flex: 1 },
  content: { paddingHorizontal: space.lg, paddingTop: space.lg },

  section: {
    paddingVertical: space.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.parchmentBorder,
    gap: space.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.inkDark,
  },
  sectionBody: { ...t.body, color: colors.inkMid, lineHeight: 22 },
});
