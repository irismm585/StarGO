import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatRoomListScreen from '../screens/chat/ChatRoomListScreen';
import ChatRoomScreen from '../screens/chat/ChatRoomScreen';

export type ChatStackParamList = {
  ChatRoomList: undefined;
  ChatRoom: { roomId: string; roomName: string };
};

const Stack = createNativeStackNavigator<ChatStackParamList>();

export default function ChatStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatRoomList" component={ChatRoomListScreen} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </Stack.Navigator>
  );
}
