import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/layout';
import { useTranslation } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAllBuddies,
  getBuddyPosts,
  filterBuddies,
  sendFriendRequest,
  addFriend,
} from '../../services/buddy';
import Header from '../../components/common/Header';
import { localizeBuddy } from '../../utils/localization';
import {
  BUDDY_PURPOSE_OPTIONS,
  getPurposeLabel,
  getPurposeIcon,
  type BuddyProfile,
  type BuddyPost,
  type BuddyFilter,
  type BuddyPurpose,
} from '../../types/buddy';

const GENDER_OPTIONS = [
  { key: 'all' as const, icon: '👥', labelZh: '全部', labelEn: 'All' },
  { key: 'male' as const, icon: '👨', labelZh: '男性', labelEn: 'Male' },
  { key: 'female' as const, icon: '👩', labelZh: '女性', labelEn: 'Female' },
];

type SectionData =
  | { type: 'header'; title: string }
  | { type: 'post'; post: BuddyPost }
  | { type: 'buddy'; buddy: BuddyProfile };

export default function FindBuddyScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { t, language } = useTranslation();

  const [buddies, setBuddies] = useState<BuddyProfile[]>([]);
  const [posts, setPosts] = useState<BuddyPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [purposeFilter, setPurposeFilter] = useState<BuddyPurpose[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allBuddies, allPosts] = await Promise.all([
        getAllBuddies(user?.id),
        getBuddyPosts(),
      ]);
      setBuddies(allBuddies);
      setPosts(allPosts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const togglePurposeFilter = (p: BuddyPurpose) => {
    setPurposeFilter((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  };

  const filter: BuddyFilter = {
    gender: genderFilter,
    purpose: purposeFilter,
    city: '',
  };

  const filteredBuddies = filterBuddies(buddies, filter);
  const myBuddies = filteredBuddies.filter((b) => b.isFriend);
  const discoverBuddies = filteredBuddies.filter((b) => !b.isFriend);

  const sections: { title: string; data: SectionData[] }[] = [
    // Posts section
    {
      title: t.findBuddy.buddyPosts,
      data: posts.length > 0
        ? posts.map((p) => ({ type: 'post' as const, post: p }))
        : [{ type: 'header' as const, title: t.findBuddy.noPosts }],
    },
    // Buddies section
    {
      title: t.findBuddy.discoverBuddies,
      data: discoverBuddies.map((b) => ({ type: 'buddy' as const, buddy: b })),
    },
  ];

  if (myBuddies.length > 0) {
    sections.unshift({
      title: t.findBuddy.myBuddies,
      data: myBuddies.map((b) => ({ type: 'buddy' as const, buddy: b })),
    });
  }

  const handleContact = (buddy: BuddyProfile) => {
    const localized = localizeBuddy(buddy, language);
    navigation.navigate('ChatTab', {
      screen: 'ChatRoom',
      params: {
        roomId: `buddy_${user?.id}_${buddy.id}`,
        roomName: localized.name,
      },
    });
  };

  const handleAddBuddy = async (buddyId: string) => {
    if (!user) return;
    await sendFriendRequest(user.id, buddyId);
    setBuddies((prev) =>
      prev.map((b) =>
        b.id === buddyId ? { ...b, friendRequestStatus: 'pending' as const } : b,
      ),
    );
  };

  const handleCreatePost = () => {
    navigation.navigate('CreateBuddyPost');
  };

  const renderPostCard = (post: BuddyPost) => {
    const genderLabel =
      post.genderPreference === 'any'
        ? language === 'zh' ? '不限' : 'Any'
        : post.genderPreference === 'male'
          ? language === 'zh' ? '男性' : 'Male'
          : language === 'zh' ? '女性' : 'Female';

    return (
      <View style={styles.postCard} key={post.id}>
        <View style={styles.postCardTop}>
          <View style={styles.postAvatar}>
            <Text style={styles.postAvatarText}>
              {post.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.postInfo}>
            <Text style={styles.postUserName}>{post.displayName}</Text>
            <Text style={styles.postEventName} numberOfLines={1}>
              🎫 {post.eventName}
            </Text>
          </View>
          <TouchableOpacity style={styles.contactBtn}>
            <Text style={styles.contactBtnText}>{t.findBuddy.contact}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.postMeta}>
          {post.eventDate ? (
            <Text style={styles.postMetaText}>📅 {post.eventDate}</Text>
          ) : null}
          <Text style={styles.postMetaText}>📍 {post.city}</Text>
          <Text style={styles.postMetaText}>
            {language === 'zh' ? '偏好' : 'Pref'}: {genderLabel}
          </Text>
        </View>

        <View style={styles.postPurposeRow}>
          {post.purpose.map((p, idx) => (
            <View key={idx} style={styles.postPurposeBadge}>
              <Text style={styles.postPurposeIcon}>{getPurposeIcon(p as BuddyPurpose)}</Text>
              <Text style={styles.postPurposeText}>
                {getPurposeLabel(p as BuddyPurpose, language)}
              </Text>
            </View>
          ))}
        </View>

        {post.description ? (
          <Text style={styles.postDesc} numberOfLines={3}>
            {post.description}
          </Text>
        ) : null}
      </View>
    );
  };

  const renderBuddyCard = (buddy: BuddyProfile) => {
    const localized = localizeBuddy(buddy, language);
    const matchColor =
      buddy.matchPercentage >= 80 ? colors.success
        : buddy.matchPercentage >= 60 ? colors.primary
        : colors.textMuted;
    const isPending = buddy.friendRequestStatus === 'pending';

    return (
      <View style={styles.buddyCard} key={buddy.id}>
        <View style={styles.buddyCardTop}>
          <View style={styles.buddyAvatarContainer}>
            <Text style={styles.buddyAvatar}>{localized.avatar}</Text>
          </View>
          <View style={styles.buddyInfoBlock}>
            <Text style={styles.buddyName}>{localized.name}</Text>
            <Text style={styles.buddyCity}>📍 {localized.city}</Text>
          </View>
          <View style={[styles.matchBadge, { backgroundColor: matchColor + '18', borderColor: matchColor + '40' }]}>
            <Text style={[styles.matchText, { color: matchColor }]}>
              {buddy.matchPercentage}%
            </Text>
          </View>
        </View>

        {/* Purpose badges */}
        <View style={styles.buddyPurposeRow}>
          {buddy.purpose.map((p, idx) => (
            <View key={idx} style={styles.buddyPurposeBadge}>
              <Text style={styles.buddyPurposeBadgeIcon}>{getPurposeIcon(p)}</Text>
              <Text style={styles.buddyPurposeBadgeText}>
                {getPurposeLabel(p, language)}
              </Text>
            </View>
          ))}
        </View>

        {/* Bio */}
        {localized.bio ? (
          <Text style={styles.buddyBio} numberOfLines={2}>{localized.bio}</Text>
        ) : null}

        {/* Actions */}
        <View style={styles.buddyActions}>
          {buddy.isFriend ? (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => handleContact(buddy)}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryBtnText}>💬 {t.findBuddy.chat}</Text>
            </TouchableOpacity>
          ) : isPending ? (
            <View style={styles.pendingBadgeFull}>
              <Text style={styles.pendingBadgeFullText}>{t.findBuddy.friendRequested}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => handleAddBuddy(buddy.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.addBtnText}>+ {t.findBuddy.addFriend}</Text>
            </TouchableOpacity>
          )}
          {!buddy.isFriend && (
            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => handleContact(buddy)}
              activeOpacity={0.7}
            >
              <Text style={styles.outlineBtnText}>💬 {t.findBuddy.privateChat}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const ListHeader = () => (
    <View>
      {/* Create Post Button */}
      <TouchableOpacity style={styles.createPostBtn} onPress={handleCreatePost} activeOpacity={0.85}>
        <Text style={styles.createPostIcon}>+</Text>
        <Text style={styles.createPostText}>{t.findBuddy.postBuddy}</Text>
      </TouchableOpacity>

      {/* Filter Toggle */}
      <TouchableOpacity
        style={styles.filterToggle}
        onPress={() => setShowFilters((v) => !v)}
        activeOpacity={0.7}
      >
        <Text style={styles.filterToggleText}>
          {language === 'zh' ? '🔍 筛选条件' : '🔍 Filters'}
        </Text>
        <Text style={styles.filterToggleArrow}>{showFilters ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Filter Panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          {/* Gender */}
          <Text style={styles.filterLabel}>{t.findBuddy.filterGender}</Text>
          <View style={styles.filterChipsRow}>
            {GENDER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.filterChip, genderFilter === opt.key && styles.filterChipActive]}
                onPress={() => setGenderFilter(opt.key)}
                activeOpacity={0.7}
              >
                <Text style={styles.filterChipIcon}>{opt.icon}</Text>
                <Text style={[styles.filterChipText, genderFilter === opt.key && styles.filterChipTextActive]}>
                  {language === 'zh' ? opt.labelZh : opt.labelEn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Purpose */}
          <Text style={[styles.filterLabel, { marginTop: spacing.md }]}>
            {t.findBuddy.filterPurpose}
          </Text>
          <View style={styles.filterChipsRow}>
            {BUDDY_PURPOSE_OPTIONS.map((opt) => {
              const active = purposeFilter.includes(opt.key);
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => togglePurposeFilter(opt.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.filterChipIcon}>{opt.icon}</Text>
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {language === 'zh' ? opt.labelZh : opt.labelEn}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );

  const activeFilters = genderFilter !== 'all' || purposeFilter.length > 0;

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title={t.findBuddy.title} showBack />
        <View style={styles.center}>
          <Text style={styles.loadingText}>{t.common.loading}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={t.findBuddy.title} showBack />

      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        renderItem={({ item: section }) => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.data.length === 0 ? (
              <Text style={styles.emptyText}>
                {section.title === t.findBuddy.buddyPosts
                  ? t.findBuddy.noPosts
                  : t.findBuddy.noBuddies}
              </Text>
            ) : (
              section.data.map((item) => {
                if (item.type === 'header') {
                  return (
                    <View key="empty" style={styles.emptyState}>
                      <Text style={styles.emptyIcon}>
                        {section.title === t.findBuddy.buddyPosts ? '📋' : '—'}
                      </Text>
                      <Text style={styles.emptyText}>
                        {item.title}
                      </Text>
                    </View>
                  );
                }
                if (item.type === 'post') {
                  return renderPostCard(item.post);
                }
                return renderBuddyCard(item.buddy);
              })
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: fontSize.md, color: colors.textSecondary },
  listContent: { paddingBottom: spacing.xxxl },

  // Create Post Button
  createPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  createPostIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  createPostText: {
    fontSize: fontSize.md,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Filter Toggle
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterToggleText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  filterToggleArrow: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Filter Panel
  filterPanel: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
  },
  filterChipIcon: { fontSize: 14 },
  filterChipText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primary,
  },

  // Sections
  section: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },

  // Post Card
  postCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  postCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  postAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  postAvatarText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primary,
  },
  postInfo: {
    flex: 1,
  },
  postUserName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  postEventName: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  contactBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  contactBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  postMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  postMetaText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  postPurposeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  postPurposeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  postPurposeIcon: { fontSize: 12 },
  postPurposeText: {
    fontSize: 10,
    color: '#4C1D95',
    fontWeight: '600',
  },
  postDesc: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },

  // Buddy Card
  buddyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  buddyCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buddyAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  buddyAvatar: {
    fontSize: 22,
  },
  buddyInfoBlock: {
    flex: 1,
    marginRight: spacing.sm,
  },
  buddyName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  buddyCity: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  matchBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  matchText: {
    fontSize: 11,
    fontWeight: '800',
  },
  buddyPurposeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  buddyPurposeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  buddyPurposeBadgeIcon: { fontSize: 12 },
  buddyPurposeBadgeText: {
    fontSize: 10,
    color: '#4C1D95',
    fontWeight: '600',
  },
  buddyBio: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  buddyActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  pendingBadgeFull: {
    backgroundColor: `${colors.warning}18`,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  pendingBadgeFullText: {
    color: colors.warning,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  outlineBtnText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
