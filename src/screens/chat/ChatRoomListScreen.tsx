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
import { getChatRooms, joinRoom, leaveRoom } from '../../services/chat';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import type { ChatRoom } from '../../types/chat';

type ListItem = ChatRoom | { type: 'header'; title: string };

export default function ChatRoomListScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await getChatRooms();
      setRooms(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleJoin = async (roomId: string) => {
    if (!user) return;
    await joinRoom(roomId, user.id);
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, isJoined: true } : r))
    );
  };

  const handleLeave = async (roomId: string) => {
    if (!user) return;
    await leaveRoom(roomId, user.id);
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, isJoined: false } : r))
    );
  };

  if (loading) return <View style={styles.container}><Header title="粉丝社区" /><LoadingSpinner /></View>;

  const joinedRooms = rooms.filter((r) => r.isJoined);
  const discoverRooms = rooms.filter((r) => !r.isJoined);

  const listData: ListItem[] = [
    ...(joinedRooms.length > 0 ? [{ type: 'header' as const, title: '我的房间' }] : []),
    ...joinedRooms,
    ...(discoverRooms.length > 0 ? [{ type: 'header' as const, title: '发现房间' }] : []),
    ...discoverRooms,
  ];

  return (
    <View style={styles.container}>
      <Header title="粉丝社区" />

      <FlatList
        data={listData}
        keyExtractor={(item: ListItem, idx: number) =>
          item.type === 'header' ? `h-${idx}` : (item as ChatRoom).id
        }
        contentContainerStyle={styles.list}
        renderItem={({ item }: { item: ListItem }) => {
          if ('type' in item && item.type === 'header') {
            return <Text style={styles.sectionTitle}>{item.title}</Text>;
          }
          const room = item as ChatRoom;
          return (
            <TouchableOpacity
              style={styles.roomCard}
              onPress={() =>
                navigation.navigate('ChatRoom', {
                  roomId: room.id,
                  roomName: room.name,
                })
              }
            >
              <View style={styles.roomHeader}>
                <View style={styles.roomNameRow}>
                  {room.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedIcon}>✓</Text>
                    </View>
                  )}
                  <Text style={styles.roomName} numberOfLines={1}>{room.name}</Text>
                </View>
                {room.isJoined ? (
                  <TouchableOpacity
                    onPress={() => handleLeave(room.id)}
                    style={styles.leaveButton}
                  >
                    <Text style={styles.leaveText}>退出</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleJoin(room.id)}
                    style={styles.joinButton}
                  >
                    <Text style={styles.joinText}>加入</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.roomDesc} numberOfLines={2}>{room.description}</Text>
              <View style={styles.roomFooter}>
                <Text style={styles.roomType}>{room.type === 'artist' ? '艺人' : room.type === 'venue' ? '场馆' : '演出'}</Text>
                <Text style={styles.roomMembers}>{room.memberCount} 位成员</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <EmptyState icon="💬" title="暂无聊天室" message="粉丝社区即将上线" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.xl },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  roomCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  roomNameRow: {
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
  roomName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
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
  roomDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  roomFooter: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  roomType: {
    fontSize: fontSize.xs,
    color: colors.primary,
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    fontWeight: '600',
  },
  roomMembers: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
