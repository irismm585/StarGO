import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MemorialGeneratorScreen from '../screens/memorial/MemorialGeneratorScreen';
import MemorialPreviewScreen from '../screens/memorial/MemorialPreviewScreen';
import type { MemorialContent } from '../types/memorial';

export type MemorialStackParamList = {
  MemorialGenerator: undefined;
  MemorialPreview: { content: MemorialContent };
};

const Stack = createNativeStackNavigator<MemorialStackParamList>();

export default function MemorialStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MemorialGenerator" component={MemorialGeneratorScreen} />
      <Stack.Screen name="MemorialPreview" component={MemorialPreviewScreen} />
    </Stack.Navigator>
  );
}
