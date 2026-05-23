import React, { useContext } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BottomTabBarHeightCallbackContext } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router';
import { colors } from '@/tokens';

const NAV_ROUTES = ['index', 'journal'];
const TAB_LABELS: Record<string, string> = {
  index: 'Sightings',
  journal: 'Journal',
};

const BAR_HEIGHT = 56;
const FAB_SIZE = 44;

export function PatchTabBar({ state, navigation, insets }: BottomTabBarProps) {
  const onHeightChange = useContext(BottomTabBarHeightCallbackContext);
  const bottom = insets.bottom;

  const visibleRoutes = state.routes.filter(r => NAV_ROUTES.includes(r.name));
  const [leftRoute, rightRoute] = visibleRoutes;
  const onJournal = state.routes[state.index]?.name === 'journal';

  const handleLayout = (e: LayoutChangeEvent) => {
    onHeightChange?.(e.nativeEvent.layout.height);
  };

  function renderTab(route: (typeof visibleRoutes)[number]) {
    const isFocused = state.routes[state.index]?.name === route.name;
    return (
      <Pressable
        key={route.key}
        style={styles.tab}
        onPress={() => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }}
      >
        <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
          {TAB_LABELS[route.name]}
        </Text>
      </Pressable>
    );
  }

  return (
    <View
      style={[styles.bar, { height: BAR_HEIGHT + bottom, paddingBottom: bottom }]}
      onLayout={handleLayout}
    >
      {leftRoute && renderTab(leftRoute)}

      <View style={[styles.fabWrap, onJournal && styles.fabWrapOutlined]}>
        <Pressable
          style={[styles.fab, onJournal && styles.fabOutlined]}
          onPress={() => router.navigate(onJournal ? '/(tabs)/journal-compose' : '/(tabs)/log')}
          hitSlop={8}
          android_ripple={{ borderless: false, color: 'rgba(0,0,0,0.12)' }}
        >
          <Text style={[styles.fabText, onJournal && styles.fabTextOutlined]}>+</Text>
        </Pressable>
      </View>

      {rightRoute && renderTab(rightRoute)}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.parchment,
    borderTopWidth: 1,
    borderTopColor: colors.parchmentBorder,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.inkMid,
  },
  tabLabelActive: {
    color: colors.amber,
  },
  fabWrap: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fabWrapOutlined: {
    shadowOpacity: 0.08,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fabOutlined: {
    backgroundColor: colors.parchment,
    borderWidth: 2,
    borderColor: colors.amber,
  },
  fabText: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.white,
  },
  fabTextOutlined: {
    color: colors.amber,
  },
});
