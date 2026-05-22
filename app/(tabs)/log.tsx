import React, { useCallback, useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import * as ExpoCrypto from 'expo-crypto';
import { SPECIES, rankSpecies } from '@/data/species';
import { getWatchSpecies, currentSeason, PHENOLOGY_HINTS } from '@/data/phenology';
import { insertSighting, hasSpeciesBeenLogged } from '@/db/database';
import type { Sighting } from '@/db/database';
import { usePatch } from '@/context/PatchContext';
import { colors, type as t, space, radius } from '@/tokens';
import { timeOfDayFromHour } from '@/skies';
import type { TimeOfDay } from '@/skies';
import { TimeOfDayPicker } from '@/components/TimeOfDayPicker';
import { ConditionsPicker } from '@/components/ConditionsPicker';
import type { Conditions } from '@/components/ConditionsIcon';
import { SessionSummaryOverlay } from '@/components/SessionSummaryOverlay';

const PHENOLOGY = new Set(getWatchSpecies(currentSeason()).map(w => w.species));

let lastConditions: Conditions | null = null;

function formatDateCompact(d: Date): string {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export default function LogSighting() {
  const { state, dispatch } = usePatch();
  const db = useSQLiteContext();
  const { top, bottom } = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [count, setCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [seenAt, setSeenAt] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => timeOfDayFromHour(new Date().getHours()));
  const [conditions, setConditions] = useState<Conditions | null>(lastConditions);
  const [isFocused, setIsFocused] = useState(false);
  const [loggedSpeciesSet, setLoggedSpeciesSet] = useState<Set<string>>(new Set());
  const [sessionSpecies, setSessionSpecies] = useState<{ species: string; count: number }[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const now = new Date();
      setQuery('');
      setSelectedSpecies(null);
      setCount(1);
      setNotes('');
      setSeenAt(now);
      setShowDatePicker(false);
      setTimeOfDay(timeOfDayFromHour(now.getHours()));
      setConditions(lastConditions);
      setSessionSpecies([]);
      setShowSummary(false);
      setIsFocused(false);
      if (!state.patch) return;
      db.getAllAsync<{ species: string }>(
        'SELECT DISTINCT species FROM sightings WHERE patch_id = ?',
        state.patch.id,
      ).then(rows => setLoggedSpeciesSet(new Set(rows.map(r => r.species))));
    }, [state.patch?.id]),
  );

  const sessionSet = new Set(sessionSpecies.map(s => s.species));

  const results = query.length >= 2 && !selectedSpecies
    ? rankSpecies(query, sessionSet, loggedSpeciesSet, PHENOLOGY, 8)
    : [];

  const showFreeText = query.length >= 2 && !selectedSpecies &&
    !SPECIES.some(s => s.toLowerCase() === query.toLowerCase().trim());

  const zeroQuerySuggestions: string[] = isFocused && query.length === 0 && !selectedSpecies
    ? [
        ...[...sessionSpecies].reverse().map(s => s.species),
        ...getWatchSpecies(currentSeason())
          .filter(w => !sessionSet.has(w.species))
          .map(w => w.species),
      ].slice(0, 5)
    : [];

  function getHint(species: string): { text: string; accent: boolean } {
    if (sessionSet.has(species)) return { text: 'this session', accent: true };
    if (PHENOLOGY.has(species)) return { text: PHENOLOGY_HINTS[species] ?? 'expected now', accent: true };
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
      seen_at: seenAt.toISOString(),
      created_at: now,
      time_of_day: timeOfDay,
      conditions: conditions,
    };

    await insertSighting(db, sighting);
    dispatch({ type: 'SET_TOAST', payload: { species: selectedSpecies, type: toastType } });

    const addedSpecies = selectedSpecies;
    const addedCount = count;

    setSessionSpecies(prev => {
      const existing = prev.find(s => s.species === addedSpecies);
      if (existing) {
        return prev.map(s => s.species === addedSpecies ? { ...s, count: s.count + addedCount } : s);
      }
      return [...prev, { species: addedSpecies, count: addedCount }];
    });
    setLoggedSpeciesSet(prev => new Set([...prev, addedSpecies]));

    Keyboard.dismiss();
    const now2 = new Date();
    setQuery('');
    setSelectedSpecies(null);
    setCount(1);
    setNotes('');
    setSeenAt(now2);
    setShowDatePicker(false);
    setTimeOfDay(timeOfDayFromHour(now2.getHours()));
  }

  const canAdd = !!selectedSpecies;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: top + space.sm }]}>
        <Pressable style={styles.backBtn} onPress={() => router.navigate('/(tabs)')}>
          <Text style={styles.backChevron}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Log a sighting</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + space.lg }]}
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
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Start typing…"
            placeholderTextColor={colors.inkFaint}
            autoCorrect={false}
            autoCapitalize="words"
          />
          {(zeroQuerySuggestions.length > 0 || results.length > 0 || showFreeText) && (
            <View style={styles.dropdown}>
              {zeroQuerySuggestions.map((species, i) => {
                const hint = getHint(species);
                const isLast = i === zeroQuerySuggestions.length - 1;
                return (
                  <Pressable
                    key={species}
                    style={[styles.dropdownItem, !isLast && styles.dropdownItemBorder]}
                    onPress={() => selectSpecies(species)}
                  >
                    <Text style={styles.dropdownSpecies}>{species}</Text>
                    <Text style={[styles.dropdownHint, hint.accent && styles.dropdownHintAccent]}>
                      {hint.text}
                    </Text>
                  </Pressable>
                );
              })}
              {results.map((species, i) => {
                const hint = getHint(species);
                return (
                  <Pressable
                    key={species}
                    style={[styles.dropdownItem, (i < results.length - 1 || showFreeText) && styles.dropdownItemBorder]}
                    onPress={() => selectSpecies(species)}
                  >
                    <Text style={styles.dropdownSpecies}>{species}</Text>
                    <Text style={[styles.dropdownHint, hint.accent && styles.dropdownHintAccent]}>
                      {hint.text}
                    </Text>
                  </Pressable>
                );
              })}
              {showFreeText && (
                <Pressable
                  style={styles.dropdownItem}
                  onPress={() => selectSpecies(query.trim())}
                >
                  <Text style={styles.dropdownSpecies}>{query.trim()}</Text>
                  <Text style={styles.dropdownHint}>not in list</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>

        {/* Count + Date row */}
        <View style={styles.countDateRow}>
          <View style={styles.countSection}>
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

          <View style={styles.dateSection}>
            <Text style={styles.fieldLabel}>Date</Text>
            {Platform.OS === 'ios' ? (
              <DateTimePicker
                value={seenAt}
                mode="date"
                display="compact"
                maximumDate={new Date()}
                themeVariant="light"
                onChange={(_, date) => { if (date) setSeenAt(date); }}
              />
            ) : (
              <Pressable style={styles.datePill} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.datePillText}>{formatDateCompact(seenAt)}</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Android date picker dialog */}
        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            value={seenAt}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={(_, date) => {
              setShowDatePicker(false);
              if (date) setSeenAt(date);
            }}
          />
        )}

        {/* Time of day */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Time of day</Text>
          <TimeOfDayPicker value={timeOfDay} onChange={setTimeOfDay} />
        </View>

        {/* Conditions */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Conditions (optional)</Text>
          <ConditionsPicker
            value={conditions}
            onChange={c => { lastConditions = c; setConditions(c); }}
          />
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

        {/* Session tally */}
        {sessionSpecies.length > 0 && (
          <Text style={styles.sessionTally}>
            {sessionSpecies.map(s => s.count > 1 ? `${s.count} ${s.species}` : s.species).join(' · ')}
          </Text>
        )}

        {/* CTA */}
        <Pressable
          style={[styles.cta, !canAdd && styles.ctaDisabled]}
          onPress={handleAdd}
          disabled={!canAdd}
        >
          <Text style={styles.ctaText}>
            {sessionSpecies.length > 0 ? 'Add another sighting' : `Add to ${state.patch?.name ?? 'patch'}`}
          </Text>
        </Pressable>

        {sessionSpecies.length > 0 && (
          <Pressable
            style={styles.ctaFinished}
            onPress={() => {
              if (sessionSpecies.length > 1) {
                setShowSummary(true);
              } else {
                router.navigate('/(tabs)');
              }
            }}
          >
            <Text style={styles.ctaText}>Finished</Text>
          </Pressable>
        )}
      </ScrollView>

      {showSummary && state.patch && (
        <SessionSummaryOverlay
          patchName={state.patch.name}
          sessionSpecies={sessionSpecies}
          onDismiss={() => {
            setShowSummary(false);
            router.navigate('/(tabs)');
          }}
        />
      )}
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

  ctaFinished: {
    backgroundColor: colors.amber,
    borderRadius: radius.button,
    paddingVertical: space.md,
    alignItems: 'center',
  },

  sessionTally: {
    ...t.label,
    color: colors.inkFaint,
    textAlign: 'center',
    paddingVertical: space.xs,
  },

  scroll: { flex: 1 },
  content: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: space.md,
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
    fontSize: 14,
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
  dropdownSpecies: { ...t.speciesName },
  dropdownHint: { ...t.meta, color: colors.inkMid },
  dropdownHintAccent: { color: colors.amber },

  countDateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.lg,
  },
  countSection: {
    gap: space.xs,
  },
  dateSection: {
    flex: 1,
    gap: space.xs,
  },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDim: {
    opacity: 0.35,
  },
  stepBtnText: {
    fontSize: 20,
    color: colors.white,
    lineHeight: 24,
    fontWeight: '400',
  },
  stepCount: {
    fontSize: 22,
    fontWeight: '500',
    color: colors.inkDark,
    minWidth: 28,
    textAlign: 'center',
  },

  datePill: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    borderRadius: radius.card,
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
    alignSelf: 'flex-start',
  },
  datePillText: {
    fontSize: 14,
    color: colors.inkDark,
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
    minHeight: 56,
  },

  cta: {
    backgroundColor: colors.amber,
    borderRadius: radius.button,
    paddingVertical: space.md,
    alignItems: 'center',
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
