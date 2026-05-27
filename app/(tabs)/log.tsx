import React, { useCallback, useRef, useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, Keyboard, Animated,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import * as ExpoCrypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';
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

const TIME_LABELS: Record<TimeOfDay, string> = { dawn: 'Dawn', day: 'Day', dusk: 'Dusk', night: 'Night' };

function formatDateCompact(d: Date): string {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export default function LogSighting() {
  const { state } = usePatch();
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
  const [sessionMode, setSessionMode] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmedSpecies, setConfirmedSpecies] = useState('');
  const [confirmedIsNew, setConfirmedIsNew] = useState(false);
  const [confirmedCount, setConfirmedCount] = useState(1);
  const [confirmedDate, setConfirmedDate] = useState(new Date());
  const [confirmedTimeOfDay, setConfirmedTimeOfDay] = useState<TimeOfDay>('day');

  const speciesInputRef = useRef<TextInput>(null);
  const titleOpacity = useRef(new Animated.Value(1)).current;
  const [titleText, setTitleText] = useState('Log a sighting');
  const [titleIsNew, setTitleIsNew] = useState(false);
  const confTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoNavTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      setSessionMode(false);
      setConfirming(false);
      setIsFocused(false);
      if (confTimer.current) clearTimeout(confTimer.current);
      if (autoNavTimer.current) clearTimeout(autoNavTimer.current);
      setTitleText('Log a sighting');
      setTitleIsNew(false);
      titleOpacity.setValue(1);
      if (!state.patch) return;
      db.getAllAsync<{ species: string }>(
        'SELECT DISTINCT species FROM sightings WHERE patch_id = ?',
        state.patch.id,
      ).then(rows => setLoggedSpeciesSet(new Set(rows.map(r => r.species))));
      setTimeout(() => speciesInputRef.current?.focus(), 100);

      return () => {
        if (confTimer.current) clearTimeout(confTimer.current);
        if (autoNavTimer.current) clearTimeout(autoNavTimer.current);
      };
    }, [state.patch?.id]),
  );

  function showConf(species: string, isNew: boolean) {
    if (confTimer.current) clearTimeout(confTimer.current);
    Animated.timing(titleOpacity, { toValue: 0, duration: 100, useNativeDriver: true }).start(() => {
      setTitleText(isNew ? `✓ ${species} — first here` : `✓ ${species}`);
      setTitleIsNew(isNew);
      Animated.timing(titleOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start(() => {
        confTimer.current = setTimeout(() => {
          Animated.timing(titleOpacity, { toValue: 0, duration: 100, useNativeDriver: true }).start(() => {
            setTitleText('Log a sighting');
            setTitleIsNew(false);
            Animated.timing(titleOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
          });
        }, 1600);
      });
    });
  }

  const sessionSet = new Set(sessionSpecies.map(s => s.species));

  const results = query.length >= 2 && !selectedSpecies
    ? rankSpecies(query, sessionSet, loggedSpeciesSet, PHENOLOGY, 5)
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
    Keyboard.dismiss();
  }

  async function handleAdd() {
    if (!selectedSpecies || !state.patch) return;

    const isNew = !(await hasSpeciesBeenLogged(db, state.patch.id, selectedSpecies));
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
      conditions,
    };

    await insertSighting(db, sighting);

    const addedSpecies = selectedSpecies;
    const addedCount = count;
    const addedDate = new Date(seenAt);
    const addedTimeOfDay = timeOfDay;

    setSessionSpecies(prev => {
      const existing = prev.find(s => s.species === addedSpecies);
      if (existing) return prev.map(s => s.species === addedSpecies ? { ...s, count: s.count + addedCount } : s);
      return [...prev, { species: addedSpecies, count: addedCount }];
    });
    setLoggedSpeciesSet(prev => new Set([...prev, addedSpecies]));

    if (isNew) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    showConf(addedSpecies, isNew);
    Keyboard.dismiss();

    const now2 = new Date();
    setQuery('');
    setSelectedSpecies(null);
    setCount(1);
    setNotes('');
    setSeenAt(now2);
    setShowDatePicker(false);
    setTimeOfDay(timeOfDayFromHour(now2.getHours()));

    if (!sessionMode) {
      setConfirmedSpecies(addedSpecies);
      setConfirmedIsNew(isNew);
      setConfirmedCount(addedCount);
      setConfirmedDate(addedDate);
      setConfirmedTimeOfDay(addedTimeOfDay);
      setConfirming(true);
      autoNavTimer.current = setTimeout(() => {
        setConfirming(false);
        router.navigate('/(tabs)');
      }, 1800);
    }
  }

  function handleLogAnother() {
    if (autoNavTimer.current) clearTimeout(autoNavTimer.current);
    setConfirming(false);
    setSessionMode(true);
    setTimeout(() => speciesInputRef.current?.focus(), 100);
  }

  function handleDone() {
    if (sessionSpecies.length > 1) {
      setShowSummary(true);
    } else {
      router.navigate('/(tabs)');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: top + space.sm }]}>
        <Pressable style={styles.backBtn} onPress={() => router.navigate('/(tabs)')}>
          <Text style={styles.backChevron}>‹</Text>
        </Pressable>
        <Animated.Text style={[styles.headerTitle, titleIsNew && styles.headerTitleConf, { opacity: titleOpacity }]}>
          {titleText}
        </Animated.Text>
        {sessionMode ? (
          <Pressable style={styles.doneBtn} onPress={handleDone}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        ) : (
          <View style={{ width: 48 }} />
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + space.xl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Session tally — session mode only */}
        {sessionMode && sessionSpecies.length > 0 && (
          <Text style={styles.sessionTally}>
            {sessionSpecies.map(s => s.count > 1 ? `${s.count} ${s.species}` : s.species).join(' · ')}
          </Text>
        )}

        {/* Confirmation card — shown during 1.8s post-add window */}
        {confirming ? (
          <>
            <View style={styles.confirmCard}>
              <View style={styles.confirmSpeciesRow}>
                <Text style={styles.confirmSpecies}>{confirmedSpecies}</Text>
                {confirmedCount > 1 && (
                  <Text style={styles.confirmCountLabel}>× {confirmedCount}</Text>
                )}
              </View>
              <Text style={styles.confirmMeta}>
                {formatDateCompact(confirmedDate)} · {TIME_LABELS[confirmedTimeOfDay]}
              </Text>
              {confirmedIsNew && state.patch && (
                <Text style={styles.confirmNew}>New for {state.patch.name}</Text>
              )}
            </View>
            <Pressable style={styles.logAnotherBtn} onPress={handleLogAnother}>
              <Text style={styles.logAnotherText}>Log another</Text>
            </Pressable>
          </>
        ) : (
          <>
            {/* Species input */}
            <View style={styles.speciesSection}>
              <TextInput
                ref={speciesInputRef}
                style={styles.speciesInput}
                value={query}
                onChangeText={text => {
                  setQuery(text);
                  if (selectedSpecies) setSelectedSpecies(null);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Species…"
                placeholderTextColor={colors.inkFaint}
                autoCorrect={false}
                autoCapitalize="words"
              />
              {(zeroQuerySuggestions.length > 0 || results.length > 0 || showFreeText) && (
                <View style={styles.dropdown}>
                  {zeroQuerySuggestions.map((species, i) => {
                    const hint = getHint(species);
                    const isLast = i === zeroQuerySuggestions.length - 1 && !results.length && !showFreeText;
                    return (
                      <Pressable
                        key={species}
                        style={[styles.dropdownItem, !isLast && styles.dropdownItemBorder]}
                        onPress={() => selectSpecies(species)}
                      >
                        <Text style={styles.dropdownSpecies}>{species}</Text>
                        <Text style={[styles.dropdownHint, hint.accent && styles.dropdownHintAccent]}>{hint.text}</Text>
                      </Pressable>
                    );
                  })}
                  {results.map((species, i) => {
                    const hint = getHint(species);
                    const isLast = i === results.length - 1 && !showFreeText;
                    return (
                      <Pressable
                        key={species}
                        style={[styles.dropdownItem, !isLast && styles.dropdownItemBorder]}
                        onPress={() => selectSpecies(species)}
                      >
                        <Text style={styles.dropdownSpecies}>{species}</Text>
                        <Text style={[styles.dropdownHint, hint.accent && styles.dropdownHintAccent]}>{hint.text}</Text>
                      </Pressable>
                    );
                  })}
                  {showFreeText && (
                    <Pressable style={styles.dropdownItem} onPress={() => selectSpecies(query.trim())}>
                      <Text style={styles.dropdownSpecies}>{query.trim()}</Text>
                      <Text style={styles.dropdownHint}>not in list</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>

            {/* Count stepper — only after species selected */}
            {selectedSpecies && (
              <View style={styles.countRow}>
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
            )}

            {/* Details card — always visible once species selected */}
            {selectedSpecies && (
              <View style={styles.detailsCard}>
                {/* Date */}
                <View style={[styles.detailRow, styles.detailRowH]}>
                  <Text style={styles.detailLabel}>Date</Text>
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
                {Platform.OS === 'android' && showDatePicker && (
                  <DateTimePicker
                    value={seenAt}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={(_, date) => { setShowDatePicker(false); if (date) setSeenAt(date); }}
                  />
                )}
                {/* Time of day */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Time of day</Text>
                  <TimeOfDayPicker value={timeOfDay} onChange={setTimeOfDay} />
                </View>
                {/* Conditions */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Conditions</Text>
                  <ConditionsPicker
                    value={conditions}
                    onChange={c => { lastConditions = c; setConditions(c); }}
                  />
                </View>
                {/* Notes — last row, no bottom border */}
                <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.detailLabel}>Notes</Text>
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
              </View>
            )}

            {/* CTA */}
            {selectedSpecies && (
              <Pressable style={styles.cta} onPress={handleAdd}>
                <Text style={styles.ctaText}>
                  {sessionMode ? 'Add another' : `Add to ${state.patch?.name ?? 'patch'}`}
                </Text>
              </Pressable>
            )}
          </>
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
  headerTitleConf: {
    color: colors.amber,
  },
  doneBtn: {
    width: 48,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.white,
  },

  scroll: { flex: 1 },
  content: {
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    gap: space.md,
  },

  sessionTally: {
    ...t.label,
    color: colors.inkFaint,
    textAlign: 'center',
  },

  // Confirmation card
  confirmCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    borderRadius: radius.card,
    paddingHorizontal: space.lg,
    paddingVertical: space.lg,
    gap: space.xs,
  },
  confirmSpeciesRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.sm,
  },
  confirmSpecies: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.inkDark,
  },
  confirmCountLabel: {
    fontSize: 15,
    color: colors.inkMid,
  },
  confirmMeta: {
    fontSize: 13,
    color: colors.inkFaint,
  },
  confirmNew: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.amber,
    marginTop: space.xs,
  },

  logAnotherBtn: {
    alignItems: 'center',
    paddingVertical: space.md,
  },
  logAnotherText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.amber,
  },

  // Species input
  speciesSection: {
    gap: space.xs,
  },
  speciesInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    borderRadius: radius.card,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    fontSize: 18,
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

  // Count stepper
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xl,
    paddingVertical: space.sm,
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
    fontSize: 32,
    fontWeight: '500',
    color: colors.inkDark,
    minWidth: 44,
    textAlign: 'center',
  },

  // Details card
  detailsCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  detailRow: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
    gap: space.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.parchmentBorder,
  },
  detailRowH: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0,
  },
  detailLabel: {
    ...t.label,
  },
  datePill: {
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    borderRadius: radius.card,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs + 2,
  },
  datePillText: {
    fontSize: 13,
    color: colors.inkDark,
  },
  notesInput: {
    fontSize: 14,
    color: colors.inkDark,
    minHeight: 48,
    textAlignVertical: 'top',
  },

  // CTA
  cta: {
    backgroundColor: colors.amber,
    borderRadius: radius.button,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
