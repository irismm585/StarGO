import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../constants/colors';
import { borderRadius } from '../constants/layout';
import { useTranslation } from '../contexts/LanguageContext';
import HomeStack from './HomeStack';
import ItineraryStack from './ItineraryStack';
import ChatStack from './ChatStack';
import MemorialStack from './MemorialStack';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.6 }}>{emoji}</Text>
    </View>
  );
}

function MainTabsContent() {
  const { t } = useTranslation();

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
          borderTopLeftRadius: borderRadius.xl,
          borderTopRightRadius: borderRadius.xl,
          shadowColor: '#9578C8',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
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
          tabBarLabel: t.tabs.home,
          tabBarIcon: ({ focused }) => <TabIcon emoji="—" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ItineraryTab"
        component={ItineraryStack}
        options={{
          tabBarLabel: t.tabs.itinerary,
          tabBarIcon: ({ focused }) => <TabIcon emoji="≡" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatStack}
        options={{
          tabBarLabel: t.tabs.community,
          tabBarIcon: ({ focused }) => <TabIcon emoji="○" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="MemorialTab"
        component={MemorialStack}
        options={{
          tabBarLabel: t.tabs.memorial,
          tabBarIcon: ({ focused }) => <TabIcon emoji="◇" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: t.tabs.profile,
          tabBarIcon: ({ focused }) => <TabIcon emoji="◎" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function MainTabs() {
  return <MainTabsContent />;
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
