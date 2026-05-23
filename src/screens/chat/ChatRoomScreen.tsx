import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useRoute, RouteProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors as colorsLight } from '../../constants/colors';
import { fontSize, spacing } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import { useColors } from '../../contexts/ThemeContext';
import { getMessages, sendMessage } from '../../services/chat';
import { getSavedItineraries, getItineraryById } from '../../services/itinerary';
import Header from '../../components/common/Header';
import ChatBubble from '../../components/chat/ChatBubble';
import ChatInput from '../../components/chat/ChatInput';
import ItinerarySharePanel from '../../components/chat/ItinerarySharePanel';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { ChatStackParamList } from '../../navigation/ChatStack';
import type { ChatMessage, ItineraryShareInfo } from '../../types/chat';
import type { SavedItinerary } from '../../types/itinerary';

type RoomRoute = RouteProp<ChatStackParamList, 'ChatRoom'>;

export default function ChatRoomScreen() {
  const route = useRoute<RoomRoute>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { roomId, roomName, isEventRoom } = route.params;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Share panel state
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [loadingItineraries, setLoadingItineraries] = useState(false);

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

  const handleOpenShare = async () => {
    setShowSharePanel(true);
    if (!user) return;
    setLoadingItineraries(true);
    try {
      const data = await getSavedItineraries(user.id);
      setSavedItineraries(data);
    } catch {
      setSavedItineraries([]);
    } finally {
      setLoadingItineraries(false);
    }
  };

  const handleShareSelect = async (item: SavedItinerary) => {
    if (!user) return;
    setShowSharePanel(false);
    const share: ItineraryShareInfo = {
      id: item.id,
      eventName: item.eventName,
      city: item.city,
      venueName: item.venueName,
      startDate: item.startDate,
      endDate: item.endDate,
      eventDate: item.eventDate,
      budget: item.budget,
    };
    const { message } = await sendMessage({
      roomId,
      content: `分享了行程：${share.eventName}`,
      userId: user.id,
      username: user.displayName || user.username,
      itineraryShare: share,
    });
    if (message) {
      setMessages((prev) => [...prev, message]);
    }
  };

  const handleItineraryPress = async (share: ItineraryShareInfo) => {
    try {
      const saved = await getItineraryById(share.id);
      if (saved) {
        navigation.navigate('ItineraryTab', {
          screen: 'ItineraryDetail',
          params: {
            itineraryData: saved.itineraryData,
            itineraryDataEn: saved.itineraryDataEn,
            savedId: saved.id,
            title: saved.title,
          },
        });
      }
    } catch {
      // itinerary not found
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={roomName}
        showBack
        onBack={() => navigation.navigate('ChatRoomList')}
      />

      {isEventRoom && (
        <View style={styles.verifiedStrip}>
          <View style={styles.verifiedBadgeSmall}>
            <Text style={styles.verifiedBadgeIcon}>✓</Text>
          </View>
          <Text style={styles.verifiedStripText}>
            {language === 'zh' ? '官方认证群聊' : 'Officially Verified Group'}
          </Text>
        </View>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          renderItem={({ item }) => (
            <ChatBubble
              message={item}
              isOwn={item.userId === user?.id}
              onItineraryPress={handleItineraryPress}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyIcon}>👋</Text>
              <Text style={styles.emptyTitle}>{t.community.welcomeRoom} {roomName}</Text>
              <Text style={styles.emptyText}>{t.community.startChatting}</Text>
            </View>
          }
        />
      )}

      <ChatInput
        onSend={handleSend}
      />

      {showSharePanel && (
        <ItinerarySharePanel
          itineraries={savedItineraries}
          loading={loadingItineraries}
          onSelect={handleShareSelect}
          onClose={() => setShowSharePanel(false)}
        />
      )}
    </View>
  );
}

function makeStyles(colors: typeof colorsLight) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  messageList: { flex: 1 },
  verifiedStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent + '40',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  verifiedBadgeSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.verified,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadgeIcon: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  verifiedStripText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.secondary,
  },
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
}
