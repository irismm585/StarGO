import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatRoomListScreen from '../screens/chat/ChatRoomListScreen';
import ChatRoomScreen from '../screens/chat/ChatRoomScreen';
import FindBuddyScreen from '../screens/home/FindBuddyScreen';
import BuddyPostsScreen from '../screens/chat/BuddyPostsScreen';

export type ChatStackParamList = {
  ChatRoomList: { initialTab?: 'rooms' | 'posts' } | undefined;
  ChatRoom: { roomId: string; roomName: string; isEventRoom?: boolean };
  FindBuddyFromChat: { hidePosts?: boolean } | undefined;
  BuddyPosts: undefined;
};

const Stack = createNativeStackNavigator<ChatStackParamList>();

export default function ChatStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatRoomList" component={ChatRoomListScreen} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
      <Stack.Screen name="FindBuddyFromChat" component={FindBuddyScreen} />
      <Stack.Screen name="BuddyPosts" component={BuddyPostsScreen} />
    </Stack.Navigator>
  );
}
