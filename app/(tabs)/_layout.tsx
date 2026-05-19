import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '@/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.amber,
        tabBarInactiveTintColor: colors.inkMid,
        tabBarStyle: {
          backgroundColor: colors.parchment,
          borderTopColor: colors.parchmentBorder,
          borderTopWidth: 1,
          elevation: 0,
        },
        tabBarIcon: () => null,
        tabBarIconStyle: { display: 'none' },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '500',
        },
        tabBarItemStyle: {
          justifyContent: 'center',
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen
        name="log"
        options={{
          title: '',
          tabBarLabel: () => (
            <Text style={{ fontSize: 22, fontWeight: '400', color: colors.amber }}>+</Text>
          ),
        }}
      />
      <Tabs.Screen name="edit" options={{ href: null }} />
      <Tabs.Screen name="poster" options={{ title: 'Your patch' }} />
    </Tabs>
  );
}
