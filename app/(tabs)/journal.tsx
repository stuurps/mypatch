import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { SkyHero } from '@/components/SkyHero';
import { SKY_DAY } from '@/skies';
import { colors, type as t, space, radius } from '@/tokens';
import { usePatch } from '@/context/PatchContext';
import { getYearJournalCount, getAllTimeJournalCount } from '@/db/database';

const JOURNAL_SKY = SKY_DAY;
const HERO_HEIGHT = 260;

const PHRASES = [
  "Your patch is waiting",
  "What's out there today?",
  "Every visit counts",
  "Quiet eyes, open ears",
  "You know this place",
  "The birds are ahead of you",
  "Log what you find",
];
let phraseIndexCounter = 0;

function greetingText(patchName: string): string {
  const h = new Date().getHours();
  let period: string;
  if (h >= 5 && h <= 11) period = 'Morning';
  else if (h >= 12 && h <= 16) period = 'Afternoon';
  else if (h >= 17 && h <= 20) period = 'Evening';
  else period = 'Night';
  return `${period} on ${patchName}`;
}

function nextPhrase(): string {
  const phrase = PHRASES[phraseIndexCounter % PHRASES.length];
  phraseIndexCounter++;
  return phrase;
}

export default function JournalScreen() {
  const { bottom } = useSafeAreaInsets();
  const { state } = usePatch();
  const db = useSQLiteContext();

  const [phrase] = useState(() => nextPhrase());
  const [yearCount, setYearCount] = useState(0);
  const [allTimeCount, setAllTimeCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!state.patch) return;
      const year = new Date().getFullYear();
      Promise.all([
        getYearJournalCount(db, state.patch.id, year),
        getAllTimeJournalCount(db, state.patch.id),
      ]).then(([yc, atc]) => {
        setYearCount(yc);
        setAllTimeCount(atc);
      });
    }, [state.patch?.id]),
  );

  return (
    <View style={styles.root}>
      <SkyHero bands={JOURNAL_SKY} height={HERO_HEIGHT} showTrees={false}>
        <View style={styles.heroGreeting}>
          <Text style={styles.greetingLine}>{greetingText(state.patch?.name ?? '')}</Text>
          <Text style={styles.greetingPhrase}>{phrase}</Text>
        </View>
      </SkyHero>

      <View style={styles.statsRow}>
        <View style={[styles.statBox, styles.statBoxLeft]}>
          <Text style={styles.statNumber}>{yearCount}</Text>
          <Text style={styles.statLabel}>Entries this year</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={[styles.statBox, styles.statBoxRight]}>
          <Text style={styles.statNumber}>{allTimeCount}</Text>
          <Text style={styles.statLabel}>All time</Text>
        </View>
      </View>

      <View style={[styles.body, { paddingBottom: bottom + space.lg }]}>
        <View style={styles.banner}>
          <Text style={styles.bannerLabel}>Coming soon</Text>
          <Text style={styles.bannerText}>
            A field notebook for your patch — session notes, not just species lists.
          </Text>
        </View>
      </View>
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
  statBoxLeft: {},
  statBoxRight: {},
  statDivider: { display: 'none' },
  statNumber: { ...t.statLarge },
  statLabel: { ...t.label },

  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space.xl,
  },

  banner: {
    alignItems: 'center',
    gap: space.sm,
  },
  bannerLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.amber,
  },
  bannerText: {
    ...t.body,
    textAlign: 'center',
  },
});
