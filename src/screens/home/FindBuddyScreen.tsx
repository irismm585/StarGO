import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/layout';
import { useTranslation } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAllBuddies,
  addFriend,
  removeFriend,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
} from '../../services/buddy';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { localizeBuddy } from '../../utils/localization';
import type { BuddyProfile } from '../../types/buddy';

export default function FindBuddyScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { t, language } = useTranslation();

  const [buddies, setBuddies] = useState<BuddyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  const loadBuddies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllBuddies(user?.id);
      setBuddies(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadBuddies();
    }, [loadBuddies])
  );

  const handleAddFriend = async (buddyId: string) => {
    if (!user) return;
    await sendFriendRequest(user.id, buddyId);
    setBuddies((prev) =>
      prev.map((b) =>
        b.id === buddyId ? { ...b, friendRequestStatus: 'pending' as const } : b
      )
    );
  };

  const handleAcceptRequest = async (buddyId: string) => {
    if (!user) return;
    await acceptFriendRequest(user.id, buddyId);
    setBuddies((prev) =>
      prev.map((b) =>
        b.id === buddyId
          ? { ...b, isFriend: true, friendRequestStatus: 'accepted' as const }
          : b
      )
    );
  };

  const handleDeclineRequest = async (buddyId: string) => {
    if (!user) return;
    await declineFriendRequest(user.id, buddyId);
    setBuddies((prev) =>
      prev.map((b) =>
        b.id === buddyId
          ? { ...b, friendRequestStatus: 'none' as const }
          : b
      )
    );
  };

  const handleRemoveFriend = async (buddyId: string) => {
    await removeFriend(buddyId);
    setBuddies((prev) =>
      prev.map((b) =>
        b.id === buddyId
          ? { ...b, isFriend: false, friendRequestStatus: 'none' as const }
          : b
      )
    );
  };

  const handleChat = (buddy: BuddyProfile) => {
    const localized = localizeBuddy(buddy, language);
    navigation.navigate('ChatTab', {
      screen: 'ChatRoom',
      params: {
        roomId: `buddy_${user?.id}_${buddy.id}`,
        roomName: localized.name,
      },
    });
  };

  const incomingRequests = buddies.filter(
    (b) => b.friendRequestStatus === 'pending'
  );

  const friendBuddies = buddies.filter((b) => b.isFriend);
  const discoverBuddies = buddies.filter((b) => !b.isFriend);

  const listData: (BuddyProfile | { type: 'header'; title: string })[] = [
    ...(friendBuddies.length > 0
      ? [{ type: 'header' as const, title: t.findBuddy.myBuddies }]
      : []),
    ...friendBuddies,
    ...(discoverBuddies.length > 0
      ? [{ type: 'header' as const, title: t.findBuddy.discoverBuddies }]
      : []),
    ...discoverBuddies,
  ];

  const renderBuddyCard = ({ item }: { item: BuddyProfile | { type: 'header'; title: string } }) => {
    if ('type' in item && item.type === 'header') {
      return <Text style={styles.sectionTitle}>{item.title}</Text>;
    }
    const buddyItem = item as BuddyProfile;
    const localized = localizeBuddy(buddyItem, language);
    const isFriend = buddyItem.isFriend;
    const isPending = buddyItem.friendRequestStatus === 'pending';

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{localized.avatar}</Text>
          </View>
          <View style={styles.buddyInfo}>
            <Text style={styles.buddyName}>{localized.name}</Text>
            <Text style={styles.buddyBio} numberOfLines={1}>
              {localized.bio}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          {isFriend ? (
            <>
              <TouchableOpacity
                style={styles.friendBadge}
                activeOpacity={1}
              >
                <Text style={styles.friendBadgeText}>
                  ✓ {t.findBuddy.added}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtnSmall}
                onPress={() => handleChat(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryBtnSmallText}>
                  {t.findBuddy.chat}
                </Text>
              </TouchableOpacity>
            </>
          ) : isPending ? (
            <>
              <TouchableOpacity
                style={styles.pendingBadge}
                activeOpacity={1}
              >
                <Text style={styles.pendingBadgeText}>
                  {t.findBuddy.friendRequested}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtnSmall}
                onPress={() => handleChat(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryBtnSmallText}>
                  {t.findBuddy.privateChat}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.primaryBtnSmall}
                onPress={() => handleAddFriend(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryBtnSmallText}>
                  {t.findBuddy.addFriend}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.outlineBtnSmall}
                onPress={() => handleChat(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.outlineBtnSmallText}>
                  {t.findBuddy.privateChat}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t.community.location}</Text>
            <Text style={styles.detailValue}>{localized.city}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t.community.age}</Text>
            <Text style={styles.detailValue}>{item.age}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t.community.gender}</Text>
            <Text style={styles.detailValue}>
              {item.gender === 'male'
                ? t.community.genderMale
                : t.community.genderFemale}
            </Text>
          </View>
        </View>

        <View style={styles.interestsRow}>
          <Text style={styles.detailLabel}>{t.community.interests}：</Text>
          {localized.interests.map((interest, idx) => (
            <View key={idx} style={styles.interestBadge}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title={t.findBuddy.title} showBack />

      {/* Friend Requests Button */}
      {incomingRequests.length > 0 && (
        <TouchableOpacity
          style={styles.requestsBanner}
          onPress={() => setShowRequestsModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.requestsBannerText}>
            {t.findBuddy.friendRequests} ({incomingRequests.length})
          </Text>
          <Text style={styles.requestsBannerArrow}>›</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={listData}
        keyExtractor={(item, idx) =>
          'type' in item && item.type === 'header' ? `h-${idx}` : (item as BuddyProfile).id
        }
        renderItem={renderBuddyCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>—</Text>
            <Text style={styles.emptyTitle}>{t.findBuddy.noBuddies}</Text>
          </View>
        }
      />

      {/* Friend Requests Modal */}
      <Modal
        visible={showRequestsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRequestsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowRequestsModal(false)}>
                <Text style={styles.modalCancelText}>{t.common.cancel}</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {t.findBuddy.friendRequests}
              </Text>
              <View style={{ width: 44 }} />
            </View>

            {incomingRequests.length === 0 ? (
              <View style={styles.emptyModal}>
                <Text style={styles.emptyModalText}>
                  {t.findBuddy.noRequests}
                </Text>
              </View>
            ) : (
              <FlatList
                data={incomingRequests}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.modalList}
                renderItem={({ item }) => {
                  const localized = localizeBuddy(item, language);
                  return (
                    <View style={styles.requestItem}>
                      <View style={styles.requestInfo}>
                        <Text style={styles.requestAvatar}>
                          {localized.avatar}
                        </Text>
                        <View style={styles.requestTextBlock}>
                          <Text style={styles.requestName}>
                            {localized.name}
                          </Text>
                          <Text style={styles.requestBio} numberOfLines={1}>
                            {localized.bio}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.requestActions}>
                        <TouchableOpacity
                          style={styles.acceptBtn}
                          onPress={() => {
                            handleAcceptRequest(item.id);
                          }}
                        >
                          <Text style={styles.acceptBtnText}>
                            {t.findBuddy.friendAccept}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.declineBtn}
                          onPress={() => {
                            handleDeclineRequest(item.id);
                          }}
                        >
                          <Text style={styles.declineBtnText}>
                            {t.findBuddy.friendDecline}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
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
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatar: {
    fontSize: 26,
  },
  buddyInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  buddyName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  buddyBio: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  primaryBtnSmall: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
  },
  primaryBtnSmallText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  outlineBtnSmall: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
  },
  outlineBtnSmallText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  friendBadge: {
    backgroundColor: `${colors.success}18`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
  },
  friendBadgeText: {
    color: colors.success,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  pendingBadge: {
    backgroundColor: `${colors.warning}18`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
  },
  pendingBadgeText: {
    color: colors.warning,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  interestBadge: {
    backgroundColor: `${colors.primary}12`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  interestText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  // Requests Banner
  requestsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    backgroundColor: colors.primary + '12',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  requestsBannerText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  requestsBannerArrow: {
    fontSize: 22,
    color: colors.primary,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.xl,
    maxHeight: '60%',
    shadowColor: '#9578C8',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  modalCancelText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  modalList: {
    padding: spacing.lg,
  },
  emptyModal: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyModalText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    marginBottom: spacing.sm,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  requestAvatar: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  requestTextBlock: {
    flex: 1,
  },
  requestName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  requestBio: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  acceptBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  declineBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  declineBtnText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
