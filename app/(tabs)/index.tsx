import { View, Text, StyleSheet } from 'react-native';
import { colors, type as t } from '@/tokens';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={t.headline}>Patch Home</Text>
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
