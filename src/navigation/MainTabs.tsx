import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../constants/colors';
import HomeStack from './HomeStack';
import ItineraryStack from './ItineraryStack';
import ChatStack from './ChatStack';
import MemorialStack from './MemorialStack';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    '首页': '🏠',
    '行程': '📋',
    '社区': '💬',
    '纪念': '✨',
    '我的': '👤',
  };

  return (
    <View style={styles.tabIcon}>
      <Text style={{ fontSize: 22 }}>{icons[label] || '●'}</Text>
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 0,
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: '首页',
          tabBarIcon: ({ focused }) => <TabIcon label="首页" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ItineraryTab"
        component={ItineraryStack}
        options={{
          tabBarLabel: '行程',
          tabBarIcon: ({ focused }) => <TabIcon label="行程" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatStack}
        options={{
          tabBarLabel: '社区',
          tabBarIcon: ({ focused }) => <TabIcon label="社区" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="MemorialTab"
        component={MemorialStack}
        options={{
          tabBarLabel: '纪念',
          tabBarIcon: ({ focused }) => <TabIcon label="纪念" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: '我的',
          tabBarIcon: ({ focused }) => <TabIcon label="我的" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
