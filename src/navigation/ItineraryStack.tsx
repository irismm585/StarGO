import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ItineraryListScreen from '../screens/itinerary/ItineraryListScreen';
import ItineraryCreateScreen from '../screens/itinerary/ItineraryCreateScreen';
import ItineraryDetailScreen from '../screens/itinerary/ItineraryDetailScreen';
import type { Itinerary, SavedItinerary } from '../types/itinerary';

export type ItineraryPrefill = {
  eventName?: string;
  venueName?: string;
  city?: string;
  eventDate?: string;
  startDate?: string;
  endDate?: string;
  departureCity?: string;
};

export type ItineraryStackParamList = {
  ItineraryList: undefined;
  ItineraryCreate: { editData?: SavedItinerary; prefill?: ItineraryPrefill } | undefined;
  ItineraryDetail: { itineraryData: Itinerary; savedId?: string; title?: string };
};

const Stack = createNativeStackNavigator<ItineraryStackParamList>();

export default function ItineraryStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ItineraryList" component={ItineraryListScreen} />
      <Stack.Screen name="ItineraryCreate" component={ItineraryCreateScreen} />
      <Stack.Screen name="ItineraryDetail" component={ItineraryDetailScreen} />
    </Stack.Navigator>
  );
}
