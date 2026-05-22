import {
  View, Text, Pressable, TextInput, StyleSheet,
  useWindowDimensions, KeyboardAvoidingView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { SkyHero } from '@/components/SkyHero';
import { StepDots } from '@/components/StepDots';
import { SKY_DAY } from '@/skies';
import { colors, type as t, space, radius } from '@/tokens';
import { usePatch } from '@/context/PatchContext';
import { setSetting } from '@/db/database';

export default function OnboardingYourName() {
  const { height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const db = useSQLiteContext();
  const { dispatch } = usePatch();
  const params = useLocalSearchParams<{ editing?: string; currentName?: string }>();
  const isEditing = params.editing === 'true';

  const [name, setName] = useState(params.currentName ?? '');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(id);
  }, []);

  const canContinue = name.trim().length > 0;

  async function handleContinue() {
    const trimmed = name.trim();
    await setSetting(db, 'user_name', trimmed);
    dispatch({ type: 'SET_USER_NAME', payload: trimmed });
    if (isEditing) {
      router.back();
    } else {
      router.push('/onboarding/name');
    }
  }

  return (
    <View style={styles.container}>
      <SkyHero bands={SKY_DAY} height={height} />

      <KeyboardAvoidingView style={StyleSheet.absoluteFill} behavior="padding">
        <View style={[styles.topBar, { paddingTop: top + space.md }]}>
          <Pressable style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <View style={styles.barCenter}>
            {!isEditing && <StepDots current={2} />}
          </View>
          <View style={{ width: 36 }} />
        </View>

        <View style={{ flex: 1 }} />

        <View style={[styles.content, { paddingBottom: bottom + space.xl }]}>
          <Text style={styles.eyebrow}>{isEditing ? 'Your profile' : 'Let\'s get started'}</Text>
          <Text style={styles.headline}>What should we call you?</Text>
          <TextInput
            ref={inputRef}
            value={name}
            onChangeText={setName}
            placeholder="Your first name"
            placeholderTextColor="rgba(255,255,255,0.35)"
            style={styles.input}
            returnKeyType="done"
            autoCapitalize="words"
            onSubmitEditing={() => { if (canContinue) handleContinue(); }}
          />
          <Text style={styles.hint}>Just your first name is fine.</Text>
          <Pressable
            style={[styles.cta, !canContinue && styles.ctaDisabled]}
            disabled={!canContinue}
            onPress={handleContinue}
          >
            <Text style={styles.ctaText}>{isEditing ? 'Save' : 'Continue'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 26,
    color: colors.white,
    lineHeight: 30,
  },
  barCenter: { flex: 1, alignItems: 'center' },
  content: {
    paddingHorizontal: space.lg,
    gap: space.md,
  },
  eyebrow: {
    ...t.label,
    color: 'rgba(255,255,255,0.5)',
  },
  headline: {
    fontSize: 28,
    fontWeight: '500',
    color: colors.white,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.card,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    fontSize: 18,
    color: colors.white,
  },
  hint: {
    ...t.body,
    color: 'rgba(255,255,255,0.45)',
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
