import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MemorialListScreen from '../screens/memorial/MemorialListScreen';
import MemorialGeneratorScreen from '../screens/memorial/MemorialGeneratorScreen';
import MemorialPreviewScreen from '../screens/memorial/MemorialPreviewScreen';
import type { MemorialContent } from '../types/memorial';

export type MemorialStackParamList = {
  MemorialList: undefined;
  MemorialGenerator: undefined;
  MemorialPreview: { content: MemorialContent; contentEn?: MemorialContent };
};

const Stack = createNativeStackNavigator<MemorialStackParamList>();

export default function MemorialStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MemorialList" component={MemorialListScreen} />
      <Stack.Screen name="MemorialGenerator" component={MemorialGeneratorScreen} />
      <Stack.Screen name="MemorialPreview" component={MemorialPreviewScreen} />
    </Stack.Navigator>
  );
}
