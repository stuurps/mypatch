import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { TimeOfDayIcon } from '@/components/TimeOfDayIcon';
import type { TimeOfDay } from '@/skies';
import { colors } from '@/tokens';

const PERIODS: { value: TimeOfDay; label: string }[] = [
  { value: 'dawn',  label: 'Dawn'  },
  { value: 'day',   label: 'Day'   },
  { value: 'dusk',  label: 'Dusk'  },
  { value: 'night', label: 'Night' },
];

type Props = {
  value: TimeOfDay;
  onChange: (period: TimeOfDay) => void;
};

export function TimeOfDayPicker({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {PERIODS.map(p => {
        const selected = p.value === value;
        const tint = selected ? colors.amber : colors.inkFaint;
        return (
          <Pressable
            key={p.value}
            style={styles.chip}
            onPress={() => onChange(p.value)}
          >
            <TimeOfDayIcon period={p.value} size={22} color={tint} />
            <Text style={[styles.label, { color: tint }]}>{p.label}</Text>
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
