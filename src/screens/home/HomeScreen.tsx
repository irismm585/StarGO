import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { fontSize, spacing } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import { getSavedItineraries } from '../../services/itinerary';
import { getChatRooms } from '../../services/chat';
import { getSavedMemorials } from '../../services/memorial';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ItineraryCard from '../../components/itinerary/ItineraryCard';
import type { SavedItinerary } from '../../types/itinerary';
import type { ChatRoom } from '../../types/chat';
import type { SavedMemorial } from '../../types/memorial';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [memorials, setMemorials] = useState<SavedMemorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [its, rooms, mems] = await Promise.all([
        getSavedItineraries(user.id),
        getChatRooms(),
        getSavedMemorials(user.id),
      ]);
      setItineraries(its);
      setChatRooms(rooms.filter((r) => r.isJoined));
      setMemorials(mems);
    } catch (e) {
      console.error('Home load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return <LoadingSpinner message="加载中..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Gradient Header */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.greeting}>
          你好，{user?.displayName || '旅行者'} 👋
        </Text>
        <Text style={styles.headerSub}>今天想去哪看演出？</Text>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('ItineraryTab', { screen: 'ItineraryCreate' })}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quickIcon}
          >
            <Text style={styles.quickIconText}>📋</Text>
          </LinearGradient>
          <Text style={styles.quickLabel}>规划行程</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('ChatTab')}
        >
          <View style={[styles.quickIcon, styles.quickIconSecondary]}>
            <Text style={styles.quickIconText}>💬</Text>
          </View>
          <Text style={styles.quickLabel}>粉丝社区</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('MemorialTab')}
        >
          <View style={[styles.quickIcon, styles.quickIconTertiary]}>
            <Text style={styles.quickIconText}>✨</Text>
          </View>
          <Text style={styles.quickLabel}>生成纪念</Text>
        </TouchableOpacity>
      </View>

      {/* Saved Itineraries */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>我的行程</Text>
        {itineraries.length === 0 ? (
          <View style={styles.emptyMini}>
            <Text style={styles.emptyText}>还没有行程，去规划你的第一段旅程吧！</Text>
          </View>
        ) : (
          itineraries.slice(0, 3).map((it) => (
            <ItineraryCard
              key={it.id}
              itinerary={it}
              onPress={() =>
                navigation.navigate('ItineraryTab', {
                  screen: 'ItineraryDetail',
                  params: { itineraryData: it.itineraryData, savedId: it.id, title: it.title },
                })
              }
            />
          ))
        )}
      </View>

      {/* Active Chat Rooms */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>我的社区</Text>
        {chatRooms.length === 0 ? (
          <View style={styles.emptyMini}>
            <Text style={styles.emptyText}>还没有加入聊天室，去发现粉丝社区吧！</Text>
          </View>
        ) : (
          chatRooms.slice(0, 2).map((room) => (
            <TouchableOpacity
              key={room.id}
              style={styles.roomItem}
              onPress={() =>
                navigation.navigate('ChatTab', {
                  screen: 'ChatRoom',
                  params: { roomId: room.id, roomName: room.name },
                })
              }
            >
              {room.isVerified && <Text style={styles.verifiedBadge}>✓</Text>}
              <View style={styles.roomInfo}>
                <Text style={styles.roomName}>{room.name}</Text>
                <Text style={styles.roomMember}>{room.memberCount} 位成员</Text>
              </View>
              <Text style={styles.roomArrow}>›</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Recent Memorials */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>最近纪念</Text>
        {memorials.length === 0 ? (
          <View style={styles.emptyMini}>
            <Text style={styles.emptyText}>还没有纪念内容，去生成你的第一篇吧！</Text>
          </View>
        ) : (
          memorials.slice(0, 2).map((mem) => (
            <TouchableOpacity key={mem.id} style={styles.memorialItem}>
              <Text style={styles.memorialEvent}>{mem.eventName}</Text>
              <Text style={styles.memorialDate}>
                {new Date(mem.createdAt).toLocaleDateString('zh-CN')}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  headerSub: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.8)',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -24,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  quickIconSecondary: {
    backgroundColor: colors.accent,
  },
  quickIconTertiary: {
    backgroundColor: colors.success,
  },
  quickIconText: {
    fontSize: 24,
  },
  quickLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyMini: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.verified,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: spacing.md,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  roomMember: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roomArrow: {
    fontSize: 24,
    color: colors.textMuted,
  },
  memorialItem: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memorialEvent: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  memorialDate: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
