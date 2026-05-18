import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import * as ExpoCrypto from 'expo-crypto';
import { SPECIES } from '@/data/species';
import { getWatchSpecies, currentSeason } from '@/data/phenology';
import { insertSighting, hasSpeciesBeenLogged } from '@/db/database';
import type { Sighting } from '@/db/database';
import { usePatch } from '@/context/PatchContext';
import { colors, type as t, space, radius } from '@/tokens';

const PHENOLOGY = new Set(getWatchSpecies(currentSeason()).map(w => w.species));

export default function LogSighting() {
  const { state, dispatch } = usePatch();
  const db = useSQLiteContext();
  const { top, bottom } = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [count, setCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [loggedSpeciesSet, setLoggedSpeciesSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!state.patch) return;
    db.getAllAsync<{ species: string }>(
      'SELECT DISTINCT species FROM sightings WHERE patch_id = ?',
      state.patch.id,
    ).then(rows => setLoggedSpeciesSet(new Set(rows.map(r => r.species))));
  }, [state.patch?.id]);

  const results = query.length >= 2 && !selectedSpecies
    ? SPECIES.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  function getHint(species: string): { text: string; accent: boolean } {
    if (PHENOLOGY.has(species)) return { text: 'expected soon', accent: true };
    if (!loggedSpeciesSet.has(species)) return { text: 'new for your patch', accent: true };
    return { text: 'on your patch', accent: false };
  }

  function selectSpecies(species: string) {
    setSelectedSpecies(species);
    setQuery(species);
  }

  async function handleAdd() {
    if (!selectedSpecies || !state.patch) return;

    const isNew = !(await hasSpeciesBeenLogged(db, state.patch.id, selectedSpecies));
    const toastType = isNew ? 'new' : PHENOLOGY.has(selectedSpecies) ? 'year' : 'logged';

    const now = new Date().toISOString();
    const sighting: Sighting = {
      id: ExpoCrypto.randomUUID(),
      patch_id: state.patch.id,
      species: selectedSpecies,
      count,
      notes: notes.trim() || null,
      seen_at: now,
      created_at: now,
    };

    await insertSighting(db, sighting);
    dispatch({ type: 'SET_TOAST', payload: { species: selectedSpecies, type: toastType } });
    router.back();
  }

  const canAdd = !!selectedSpecies;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: top + space.sm }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backChevron}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Log a sighting</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + space.xl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Species */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Species</Text>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={text => {
              setQuery(text);
              if (selectedSpecies) setSelectedSpecies(null);
            }}
            placeholder="Start typing…"
            placeholderTextColor={colors.inkFaint}
            autoCorrect={false}
            autoCapitalize="words"
          />
          {results.length > 0 && (
            <View style={styles.dropdown}>
              {results.map((species, i) => {
                const hint = getHint(species);
                return (
                  <Pressable
                    key={species}
                    style={[styles.dropdownItem, i < results.length - 1 && styles.dropdownItemBorder]}
                    onPress={() => selectSpecies(species)}
                  >
                    <Text style={styles.dropdownSpecies}>{species}</Text>
                    <Text style={[styles.dropdownHint, hint.accent && styles.dropdownHintAccent]}>
                      {hint.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Count stepper */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Count</Text>
          <View style={styles.stepper}>
            <Pressable
              style={[styles.stepBtn, count <= 1 && styles.stepBtnDim]}
              onPress={() => setCount(c => Math.max(1, c - 1))}
            >
              <Text style={styles.stepBtnText}>−</Text>
            </Pressable>
            <Text style={styles.stepCount}>{count}</Text>
            <Pressable style={styles.stepBtn} onPress={() => setCount(c => c + 1)}>
              <Text style={styles.stepBtnText}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. riverside hide, singing male…"
            placeholderTextColor={colors.inkFaint}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
        </View>

        {/* CTA */}
        <Pressable
          style={[styles.cta, !canAdd && styles.ctaDisabled]}
          onPress={handleAdd}
          disabled={!canAdd}
        >
          <Text style={styles.ctaText}>Add to patch</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.parchment,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.skyForest,
    paddingBottom: space.md,
    paddingHorizontal: space.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: {
    fontSize: 28,
    color: colors.white,
    lineHeight: 32,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: colors.white,
  },

  scroll: { flex: 1 },
  content: {
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    gap: space.lg,
  },

  fieldBlock: {
    gap: space.xs,
  },
  fieldLabel: {
    ...t.label,
  },

  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    borderRadius: radius.card,
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
    fontSize: 15,
    color: colors.inkDark,
  },

  dropdown: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginTop: 2,
  },
  dropdownItem: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.parchmentBorder,
  },
  dropdownSpecies: {
    ...t.speciesName,
  },
  dropdownHint: {
    ...t.meta,
    color: colors.inkMid,
  },
  dropdownHintAccent: {
    color: colors.amber,
  },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDim: {
    opacity: 0.35,
  },
  stepBtnText: {
    fontSize: 22,
    color: colors.white,
    lineHeight: 26,
    fontWeight: '400',
  },
  stepCount: {
    ...t.statLarge,
    minWidth: 32,
    textAlign: 'center',
  },

  notesInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    borderRadius: radius.card,
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
    fontSize: 14,
    color: colors.inkDark,
    minHeight: 72,
  },

  cta: {
    backgroundColor: colors.amber,
    borderRadius: radius.button,
    paddingVertical: space.md,
    alignItems: 'center',
    marginTop: space.sm,
  },
  ctaDisabled: {
    opacity: 0.35,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
