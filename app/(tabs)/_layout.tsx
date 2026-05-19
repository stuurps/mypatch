import { Tabs } from 'expo-router';
import { PatchTabBar } from '@/components/PatchTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={props => <PatchTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="log" options={{ href: null }} />
      <Tabs.Screen name="edit" options={{ href: null }} />
      <Tabs.Screen name="poster" />
      <Tabs.Screen name="journal" />
      <Tabs.Screen name="journal-compose" options={{ href: null }} />
      <Tabs.Screen name="journal-edit" options={{ href: null }} />
    </Tabs>
  );
}
