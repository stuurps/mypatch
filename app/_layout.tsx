import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { initDatabase } from '@/db/database';
import { PatchProvider } from '@/context/PatchContext';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="patch.db" onInit={initDatabase}>
      <PatchProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ animation: 'none' }} />
        </Stack>
      </PatchProvider>
    </SQLiteProvider>
  );
}
