import React, { useCallback, useRef, useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import * as ExpoCrypto from 'expo-crypto';
import { colors, type as t, space, radius } from '@/tokens';
import { usePatch } from '@/context/PatchContext';
import { insertJournalEntry } from '@/db/database';
import { formatDate } from '@/utils/format';

export default function JournalCompose() {
  const { state } = usePatch();
  const db = useSQLiteContext();
  const { top, bottom } = useSafeAreaInsets();
  const [body, setBody] = useState('');
  const inputRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      setBody('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }, []),
  );

  async function handleSave() {
    if (!body.trim() || !state.patch) return;
    const now = new Date().toISOString();
    await insertJournalEntry(db, {
      id: ExpoCrypto.randomUUID(),
      patch_id: state.patch.id,
      body: body.trim(),
      created_at: now,
    });
    router.navigate('/(tabs)/journal');
  }

  const canSave = body.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: top + space.sm }]}>
        <Pressable style={styles.backBtn} onPress={() => router.navigate('/(tabs)/journal')}>
          <Text style={styles.backChevron}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>New entry</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + space.lg }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.dateLabel}>{formatDate(new Date().toISOString())}</Text>

        <TextInput
          ref={inputRef}
          style={styles.bodyInput}
          value={body}
          onChangeText={setBody}
          placeholder="Write about your session…"
          placeholderTextColor={colors.inkFaint}
          multiline
          textAlignVertical="top"
          autoCorrect
          autoCapitalize="sentences"
        />

        <Pressable
          style={[styles.cta, !canSave && styles.ctaDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Text style={styles.ctaText}>Save</Text>
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
    flexGrow: 1,
  },

  dateLabel: {
    ...t.label,
  },

  bodyInput: {
    flex: 1,
    minHeight: 240,
    fontSize: 15,
    lineHeight: 24,
    color: colors.inkDark,
    paddingTop: 0,
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
