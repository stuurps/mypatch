import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, type as t, space } from '@/tokens';

type SessionSpecies = { species: string; count: number };

type Props = {
  patchName: string;
  sessionSpecies: SessionSpecies[];
  onDismiss: () => void;
};

export function SessionSummaryOverlay({ patchName, sessionSpecies, onDismiss }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, 1200);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handlePress() {
    if (timerRef.current) clearTimeout(timerRef.current);
    onDismiss();
  }

  const tallyText = sessionSpecies
    .map(s => s.count > 1 ? `${s.count} ${s.species}` : s.species)
    .join(' · ');

  return (
    <Pressable style={styles.overlay} onPress={handlePress}>
      <View style={styles.content}>
        <Text style={styles.patchName}>{patchName}</Text>
        <Text style={styles.tally}>{tallyText}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.parchment,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  content: {
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.xl,
  },
  patchName: {
    ...t.label,
    color: colors.amber,
  },
  tally: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.inkDark,
    textAlign: 'center',
  },
});
