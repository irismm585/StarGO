import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useRoute, RouteProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { fontSize, spacing } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import { getMessages, sendMessage } from '../../services/chat';
import Header from '../../components/common/Header';
import ChatBubble from '../../components/chat/ChatBubble';
import ChatInput from '../../components/chat/ChatInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { ChatStackParamList } from '../../navigation/ChatStack';
import type { ChatMessage } from '../../types/chat';

type RoomRoute = RouteProp<ChatStackParamList, 'ChatRoom'>;

export default function ChatRoomScreen() {
  const route = useRoute<RoomRoute>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { roomId, roomName } = route.params;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = useCallback(async () => {
    try {
      const data = await getMessages(roomId);
      setMessages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [loadMessages])
  );

  const handleSend = async (content: string) => {
    if (!user) return;
    const { message } = await sendMessage({
      roomId,
      content,
      userId: user.id,
      username: user.displayName || user.username,
    });
    if (message) {
      setMessages((prev) => [...prev, message]);
    }
  };

  const handlePlanItinerary = () => {
    navigation.navigate('ItineraryTab', {
      screen: 'ItineraryCreate',
    });
  };

  return (
    <View style={styles.container}>
      <Header title={roomName} showBack />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          renderItem={({ item }) => (
            <ChatBubble message={item} isOwn={item.userId === user?.id} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyIcon}>👋</Text>
              <Text style={styles.emptyTitle}>欢迎加入 {roomName}</Text>
              <Text style={styles.emptyText}>开始聊天吧！</Text>
            </View>
          }
        />
      )}

      <ChatInput
        onSend={handleSend}
        onPlanItinerary={handlePlanItinerary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  messageList: { flex: 1 },
  messageContent: {
    paddingVertical: spacing.lg,
    flexGrow: 1,
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing.lg },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
