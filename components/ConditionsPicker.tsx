import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ConditionsIcon } from '@/components/ConditionsIcon';
import type { Conditions } from '@/components/ConditionsIcon';
import { colors } from '@/tokens';

const OPTIONS: { value: Conditions; label: string }[] = [
  { value: 'clear',    label: 'Clear'    },
  { value: 'overcast', label: 'Overcast' },
  { value: 'rain',     label: 'Rain'     },
  { value: 'mist',     label: 'Mist'     },
];

type Props = {
  value: Conditions | null;
  onChange: (c: Conditions | null) => void;
};

export function ConditionsPicker({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {OPTIONS.map(o => {
        const selected = o.value === value;
        const tint = selected ? colors.amber : colors.inkFaint;
        return (
          <Pressable
            key={o.value}
            style={styles.chip}
            onPress={() => onChange(selected ? null : o.value)}
          >
            <ConditionsIcon condition={o.value} size={22} color={tint} />
            <Text style={[styles.label, { color: tint }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.6,
    fontWeight: '500',
  },
});
