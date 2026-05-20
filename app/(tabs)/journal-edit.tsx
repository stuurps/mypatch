import React, { useCallback, useRef, useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { colors, type as t, space } from '@/tokens';
import { getJournalEntry, updateJournalEntry, deleteJournalEntry } from '@/db/database';
import { formatDate } from '@/utils/format';

export default function JournalEdit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const { top, bottom } = useSafeAreaInsets();
  const [body, setBody] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const savingRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      savingRef.current = false;
      if (!id) return;
      getJournalEntry(db, id).then(entry => {
        if (!entry) return;
        setBody(entry.body);
        setCreatedAt(entry.created_at);
      });
    }, [id]),
  );

  async function handleBack() {
    if (savingRef.current) return;
    savingRef.current = true;
    if (body.trim() && id) {
      await updateJournalEntry(db, id, body.trim());
    }
    router.navigate('/(tabs)/journal');
  }

  function handleDelete() {
    Alert.alert(
      'Remove this entry?',
      "This can't be undone.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteJournalEntry(db, id);
            router.navigate('/(tabs)/journal');
          },
        },
      ],
    );
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
        <Text style={styles.headerTitle}>Edit entry</Text>
        <View style={{ width: 36 }} />
      </View>

      <Pressable style={styles.scrollPressable} onLongPress={handleDelete} delayLongPress={600}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: bottom + space.lg }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {createdAt ? (
            <Text style={styles.dateLabel}>{formatDate(createdAt)}</Text>
          ) : null}

          <TextInput
            style={styles.bodyInput}
            value={body}
            onChangeText={setBody}
            multiline
            textAlignVertical="top"
            autoCorrect
            autoCapitalize="sentences"
            placeholderTextColor={colors.inkFaint}
          />
        </ScrollView>
      </Pressable>
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

  scrollPressable: { flex: 1 },
});
