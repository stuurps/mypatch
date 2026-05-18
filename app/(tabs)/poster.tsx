import { View, Text, StyleSheet } from 'react-native';
import { colors, type as t } from '@/tokens';

export default function Poster() {
  return (
    <View style={styles.container}>
      <Text style={t.headline}>Seasonal Poster</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.parchment,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
