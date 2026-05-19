import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { SPECIES } from '@/data/species';
import { getWatchSpecies, currentSeason } from '@/data/phenology';
import { getSighting, updateSighting, deleteSighting } from '@/db/database';
import { usePatch } from '@/context/PatchContext';
import { colors, type as t, space, radius } from '@/tokens';
import { timeOfDayFromHour } from '@/skies';
import type { TimeOfDay } from '@/skies';
import { TimeOfDayPicker } from '@/components/TimeOfDayPicker';
import { ConditionsPicker } from '@/components/ConditionsPicker';
import type { Conditions } from '@/components/ConditionsIcon';

const PHENOLOGY = new Set(getWatchSpecies(currentSeason()).map(w => w.species));

function formatDateCompact(d: Date): string {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export default function EditSighting() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = usePatch();
  const db = useSQLiteContext();
  const { top, bottom } = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [count, setCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [seenAt, setSeenAt] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [conditions, setConditions] = useState<Conditions | null>(null);
  const [loggedSpeciesSet, setLoggedSpeciesSet] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!id || !state.patch) return;
    Promise.all([
      getSighting(db, id),
      db.getAllAsync<{ species: string }>(
        'SELECT DISTINCT species FROM sightings WHERE patch_id = ?',
        state.patch.id,
      ),
    ]).then(([sighting, rows]) => {
      if (sighting) {
        setQuery(sighting.species);
        setSelectedSpecies(sighting.species);
        setCount(sighting.count);
        setNotes(sighting.notes ?? '');
        setSeenAt(new Date(sighting.seen_at));
        setTimeOfDay(
          (sighting.time_of_day as TimeOfDay | null | undefined) ??
          timeOfDayFromHour(new Date(sighting.seen_at).getHours()),
        );
        setConditions((sighting.conditions as Conditions | null | undefined) ?? null);
      }
      setLoggedSpeciesSet(new Set(rows.map(r => r.species)));
      setReady(true);
    });
  }, [id, state.patch?.id]);

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

  async function handleSave() {
    if (!selectedSpecies || !id) return;
    await updateSighting(db, id, selectedSpecies, count, notes.trim() || null, seenAt.toISOString(), timeOfDay, conditions);
    router.navigate('/(tabs)');
  }

  function confirmDelete() {
    Alert.alert(
      'Remove this sighting?',
      "This can't be undone.",
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: handleDelete },
      ],
    );
  }

  async function handleDelete() {
    if (!id || !selectedSpecies) return;
    await deleteSighting(db, id);
    dispatch({ type: 'SET_TOAST', payload: { species: selectedSpecies, type: 'deleted' } });
    router.navigate('/(tabs)');
  }

  const canSave = !!selectedSpecies && ready;

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
        <Text style={styles.headerTitle}>Edit sighting</Text>
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
          <ConditionsPicker value={conditions} onChange={setConditions} />
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

        {/* Save CTA */}
        <Pressable
          style={[styles.cta, !canSave && styles.ctaDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Text style={styles.ctaText}>Save changes</Text>
        </Pressable>

        {/* Delete */}
        <Pressable style={styles.deleteBtn} onPress={confirmDelete}>
          <Text style={styles.deleteBtnText}>Remove sighting</Text>
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
    paddingTop: space.md,
    gap: space.md,
  },

  fieldBlock: {
    gap: space.xs,
  },
  fieldLabel: { ...t.label },

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
  stepBtnDim: { opacity: 0.35 },
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
  ctaDisabled: { opacity: 0.35 },
  ctaText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },

  deleteBtn: {
    alignItems: 'center',
    paddingVertical: space.sm,
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.red,
  },
});
