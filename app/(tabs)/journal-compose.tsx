import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import * as ExpoCrypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import { colors, type as t, space } from '@/tokens';
import { usePatch } from '@/context/PatchContext';
import { insertJournalEntry } from '@/db/database';
import { formatDate } from '@/utils/format';

export default function JournalCompose() {
  const { state } = usePatch();
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const { top, bottom } = useSafeAreaInsets();
  const [body, setBody] = useState('');
  const inputRef = useRef<TextInput>(null);
  const savingRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setBody('');
      savingRef.current = false;
      setTimeout(() => inputRef.current?.focus(), 100);
    }, []),
  );

  // Intercepts all back gestures (swipe, hardware back, button) so the entry
  // is always saved regardless of how the user leaves the screen.
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (savingRef.current) return;
      savingRef.current = true;
      e.preventDefault();
      (async () => {
        if (body.trim() && state.patch) {
          await insertJournalEntry(db, {
            id: ExpoCrypto.randomUUID(),
            patch_id: state.patch.id,
            body: body.trim(),
            created_at: new Date().toISOString(),
          });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        navigation.dispatch(e.data.action);
      })();
    });
    return unsubscribe;
  }, [navigation, body, state.patch, db]);

  function handleBack() {
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: top + space.sm }]}>
        <Pressable style={styles.backBtn} onPress={handleBack}>
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

});
