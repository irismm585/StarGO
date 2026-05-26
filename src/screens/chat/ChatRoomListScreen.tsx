import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import { getChatRooms, joinRoom, leaveRoom } from '../../services/chat';
import Header from '../../components/common/Header';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { localizeRoom } from '../../utils/localization';
import type { ChatRoom } from '../../types/chat';

type CommunityTab = 'rooms' | 'buddies';

export default function ChatRoomListScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { t, language } = useTranslation();

  const [activeTab, setActiveTab] = useState<CommunityTab>('rooms');

  // Room state
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  // Load rooms
  const loadRooms = useCallback(async () => {
    setRoomsLoading(true);
    try {
      const data = await getChatRooms();
      setRooms(data);
    } catch (e) {
      console.error(e);
    } finally {
      setRoomsLoading(false);
    }
  }, []);

  const handleTabChange = (tab: CommunityTab) => {
    if (tab === 'buddies') {
      // Navigate to FindBuddyScreen (shared with Home)
      navigation.navigate('FindBuddyFromChat');
      return;
    }
    setActiveTab(tab);
  };

  useFocusEffect(
    useCallback(() => {
      loadRooms();
    }, [loadRooms])
  );

  // ── Room actions ──

  const handleJoinRoom = async (roomId: string) => {
    if (!user) return;
    await joinRoom(roomId, user.id);
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, isJoined: true } : r))
    );
  };

  const handleLeaveRoom = async (roomId: string) => {
    if (!user) return;
    await leaveRoom(roomId, user.id);
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, isJoined: false } : r))
    );
  };

  // ── Room render ──

  const getRoomTypeLabel = (type: string): string => {
    switch (type) {
      case 'artist': return t.community.roomTypeArtist;
      case 'venue': return t.community.roomTypeVenue;
      case 'event': return t.community.roomTypeEvent;
      default: return type;
    }
  };

  const joinedRooms = rooms.filter((r) => r.isJoined);
  const discoverRooms = rooms.filter((r) => !r.isJoined);

  const roomListData: (ChatRoom | { type: 'header'; title: string })[] = [
    ...(joinedRooms.length > 0 ? [{ type: 'header' as const, title: t.community.myRooms }] : []),
    ...joinedRooms,
    ...(discoverRooms.length > 0 ? [{ type: 'header' as const, title: t.community.discoverRooms }] : []),
    ...discoverRooms,
  ];

  const renderRoomItem = ({ item }: { item: ChatRoom | { type: 'header'; title: string } }) => {
    if ('type' in item && item.type === 'header') {
      return <Text style={styles.sectionTitle}>{item.title}</Text>;
    }
    const room = localizeRoom(item as ChatRoom, language);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('ChatRoom', {
            roomId: room.id,
            roomName: room.name,
          })
        }
        activeOpacity={0.85}
      >
        <View style={styles.cardTop}>
          <View style={styles.cardNameRow}>
            {room.isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
              </View>
            )}
            <Text style={styles.cardName} numberOfLines={1}>{room.name}</Text>
          </View>
          {room.isJoined ? (
            <TouchableOpacity
              onPress={() => handleLeaveRoom(room.id)}
              style={styles.leaveButton}
            >
              <Text style={styles.leaveText}>{t.community.leave}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => handleJoinRoom(room.id)}
              style={styles.joinButton}
            >
              <Text style={styles.joinText}>{t.community.join}</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.cardDesc} numberOfLines={2}>{room.description}</Text>
        <View style={styles.cardFooter}>
          {room.isVerified ? (
            <View style={styles.verifiedTag}>
              <Text style={styles.verifiedTagText}>{t.community.verified}</Text>
            </View>
          ) : (
            <View style={styles.unverifiedTag}>
              <Text style={styles.unverifiedTagText}>{t.community.unverified}</Text>
            </View>
          )}
          <Text style={styles.roomTypeBadge}>{getRoomTypeLabel(room.type)}</Text>
          <Text style={styles.memberCount}>{room.memberCount.toLocaleString()} {t.community.memberCount}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ── Main Render ──

  if (roomsLoading) {
    return (
      <View style={styles.container}>
        <Header title={t.community.title} />
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={t.community.title} />

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rooms' && styles.tabActive]}
          onPress={() => setActiveTab('rooms')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'rooms' && styles.tabTextActive]}>
            {t.community.discoverRooms}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'buddies' && styles.tabActive]}
          onPress={() => handleTabChange('buddies')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'buddies' && styles.tabTextActive]}>
            {t.community.discoverBuddies}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={roomListData}
        keyExtractor={(item, idx) =>
          'type' in item && item.type === 'header' ? `rh-${idx}` : (item as ChatRoom).id
        }
        contentContainerStyle={styles.list}
        renderItem={renderRoomItem}
        ListEmptyComponent={
          <EmptyState icon="—" title={t.community.emptyRooms} message={t.community.emptyRoomsDesc} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.xl, paddingBottom: spacing.xxxl },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  // Sections
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },

  // Room card
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#9578C8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  verifiedBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.verified,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cardName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  cardDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  roomTypeBadge: {
    fontSize: fontSize.xs,
    color: colors.primary,
    backgroundColor: `${colors.primary}12`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    fontWeight: '600',
    overflow: 'hidden',
  },
  verifiedTag: {
    backgroundColor: colors.verified + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.verified + '40',
  },
  verifiedTagText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.verified,
  },
  unverifiedTag: {
    backgroundColor: colors.textMuted + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.textMuted + '30',
  },
  unverifiedTagText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  memberCount: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  joinText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  leaveButton: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  leaveText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
