import { View, StyleSheet } from 'react-native';
import { colors, radius } from '@/tokens';

type Props = { current: 1 | 2 | 3 };

export function StepDots({ current }: Props) {
  return (
    <View style={styles.row}>
      {([1, 2, 3] as const).map(step => (
        <View
          key={step}
          style={[styles.dot, step === current ? styles.active : styles.inactive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: radius.pill,
  },
  active: {
    width: 20,
    backgroundColor: colors.amber,
  },
  inactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
});
