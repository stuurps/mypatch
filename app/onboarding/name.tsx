import {
  View, Text, Pressable, TextInput, StyleSheet,
  useWindowDimensions, KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import { SkyHero } from '@/components/SkyHero';
import { StepDots } from '@/components/StepDots';
import { SKY_DAY } from '@/skies';
import { colors, type as t, space, radius } from '@/tokens';

export default function OnboardingName() {
  const { height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const [name, setName] = useState('');
  const inputRef = useRef<TextInput>(null);

  // Delay focus so the slide-in animation settles first
  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(id);
  }, []);

  const canContinue = name.trim().length > 0;

  return (
    <View style={styles.container}>
      <SkyHero bands={SKY_DAY} height={height} />

      <KeyboardAvoidingView style={StyleSheet.absoluteFill} behavior="padding">
        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: top + space.md }]}>
          <Pressable style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <View style={styles.barCenter}>
            <StepDots current={2} />
          </View>
          <View style={{ width: 36 }} />
        </View>

        <View style={{ flex: 1 }} />

        {/* Form */}
        <View style={[styles.content, { paddingBottom: bottom + space.xl }]}>
          <Text style={styles.eyebrow}>Let's get started</Text>
          <Text style={styles.headline}>Name your patch</Text>
          <TextInput
            ref={inputRef}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Riverside walk"
            placeholderTextColor="rgba(255,255,255,0.35)"
            style={styles.input}
            returnKeyType="done"
            autoCapitalize="words"
            onSubmitEditing={() => {
              if (canContinue) {
                router.push(`/onboarding/size?patchName=${encodeURIComponent(name.trim())}`);
              }
            }}
          />
          <Text style={styles.hint}>
            Use the name you know it by — the reserve, the river walk, your back garden.
          </Text>
          <Pressable
            style={[styles.cta, !canContinue && styles.ctaDisabled]}
            disabled={!canContinue}
            onPress={() =>
              router.push(`/onboarding/size?patchName=${encodeURIComponent(name.trim())}`)
            }
          >
            <Text style={styles.ctaText}>Continue</Text>
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
    color: '#fff',
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
    color: '#fff',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.card,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    fontSize: 18,
    color: '#fff',
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
    color: '#fff',
  },
});
