import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import EventDetailScreen from '../screens/home/EventDetailScreen';
import FindBuddyScreen from '../screens/home/FindBuddyScreen';
import type { MockEvent } from '../constants/events';

export type HomeStackParamList = {
  Home: undefined;
  EventDetail: { event: MockEvent };
  FindBuddy: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="FindBuddy" component={FindBuddyScreen} />
    </Stack.Navigator>
  );
}
