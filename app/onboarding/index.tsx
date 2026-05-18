import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkyHero } from '@/components/SkyHero';
import { StepDots } from '@/components/StepDots';
import { SKY_SUNRISE } from '@/skies';
import { colors, type as t, space, radius } from '@/tokens';

export default function OnboardingWelcome() {
  const { height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <SkyHero bands={SKY_SUNRISE} height={height} />

      <View style={StyleSheet.absoluteFill}>
        {/* Top bar — dots centred, no back button */}
        <View style={[styles.topBar, { paddingTop: top + space.md }]}>
          <View style={styles.barSide} />
          <View style={styles.barCenter}>
            <StepDots current={1} />
          </View>
          <View style={styles.barSide} />
        </View>

        <View style={{ flex: 1 }} />

        {/* Bottom content */}
        <View style={[styles.content, { paddingBottom: bottom + space.xl }]}>
          <Text style={styles.tag}>Welcome to Patch</Text>
          <Text style={styles.headline}>Your local patch,{'\n'}recorded.</Text>
          <Text style={styles.subline}>
            Log what you see. Build a picture over time.
          </Text>
          <Pressable
            style={styles.cta}
            onPress={() => router.push('/onboarding/name')}
          >
            <Text style={styles.ctaText}>Get started</Text>
          </Pressable>
        </View>
      </View>
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
  barSide: { width: 36 },
  barCenter: { flex: 1, alignItems: 'center' },
  content: {
    paddingHorizontal: space.lg,
    gap: space.md,
  },
  tag: {
    ...t.label,
    color: colors.amber,
  },
  headline: {
    fontSize: 34,
    fontWeight: '500',
    color: colors.white,
    lineHeight: 42,
  },
  subline: {
    ...t.body,
    color: 'rgba(255,255,255,0.6)',
  },
  cta: {
    backgroundColor: colors.amber,
    borderRadius: radius.button,
    paddingVertical: space.md,
    alignItems: 'center',
    marginTop: space.sm,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
