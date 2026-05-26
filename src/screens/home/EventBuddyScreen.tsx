import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/layout';
import { useTranslation } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getAllBuddies, sendFriendRequest } from '../../services/buddy';
import Header from '../../components/common/Header';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { localizeBuddy, localizeEvent } from '../../utils/localization';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import type { BuddyProfile } from '../../types/buddy';

type EventBuddyRoute = RouteProp<HomeStackParamList, 'EventBuddy'>;

/** Check if a buddy's interests overlap with the event */
function matchesEvent(buddy: BuddyProfile, artistName: string, category: string): boolean {
  const keywords = [artistName.toLowerCase(), category.toLowerCase()];
  const allInterests = [
    ...(buddy.interests ?? []).map((i) => i.toLowerCase()),
    ...(buddy.interestsEn ?? []).map((i) => i.toLowerCase()),
  ];
  return keywords.some((kw) =>
    allInterests.some((interest) => interest.includes(kw) || kw.includes(interest))
  );
}

export default function EventBuddyScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<EventBuddyRoute>();
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const event = localizeEvent(route.params.event, language);

  const [allBuddies, setAllBuddies] = useState<BuddyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllBuddies(user?.id);
        setAllBuddies(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Filter buddies: high match + interest overlap
  const matchingBuddies = allBuddies.filter((b) => {
    if (b.isFriend || b.friendRequestStatus === 'pending') return false;
    if (b.matchPercentage < 75) return false;
    return matchesEvent(b, event.artistName, event.category);
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);

  const handleAdd = async (buddyId: string) => {
    if (!user) return;
    setSendingIds((prev) => new Set(prev).add(buddyId));
    try {
      await sendFriendRequest(user.id, buddyId);
      setAllBuddies((prev) =>
        prev.map((b) =>
          b.id === buddyId ? { ...b, friendRequestStatus: 'pending' as const } : b
        )
      );
    } catch {
      // ignore
    } finally {
      setSendingIds((prev) => {
        const next = new Set(prev);
        next.delete(buddyId);
        return next;
      });
    }
  };

  const renderBuddy = ({ item }: { item: BuddyProfile }) => {
    const localized = localizeBuddy(item, language);

    const matchColor =
      item.matchPercentage >= 90 ? colors.success
        : item.matchPercentage >= 80 ? colors.primary
        : colors.warning;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{localized.avatar}</Text>
          </View>
          <View style={styles.buddyInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{localized.name}</Text>
              <View style={[styles.matchBadge, { backgroundColor: matchColor + '18', borderColor: matchColor + '40' }]}>
                <Text style={[styles.matchText, { color: matchColor }]}>
                  {item.matchPercentage}% {t.community.match}
                </Text>
              </View>
            </View>
            <Text style={styles.bio} numberOfLines={1}>{localized.bio}</Text>
          </View>
        </View>

        {/* Interests */}
        <View style={styles.tagRow}>
          {localized.interests.map((interest, idx) => (
            <View key={idx} style={styles.interestBadge}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>

        {/* Purpose + Travel Style */}
        <View style={styles.tagRow}>
          {localized.purpose.map((p, idx) => (
            <View key={idx} style={styles.purposeBadge}>
              <Text style={styles.purposeText}>{p}</Text>
            </View>
          ))}
          {localized.travelStyle.map((s, idx) => (
            <View key={idx} style={styles.styleBadge}>
              <Text style={styles.styleText}>{s}</Text>
            </View>
          ))}
        </View>

        {/* Action */}
        {item.friendRequestStatus === 'pending' ? (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>{t.findBuddy.friendRequested}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAdd(item.id)}
            disabled={sendingIds.has(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>
              {sendingIds.has(item.id) ? '...' : t.findBuddy.addFriend}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={language === 'zh' ? '发现搭子' : 'Find Buddies'}
        showBack
        onBack={() => navigation.navigate('ChatTab', { screen: 'FindBuddyFromChat' })}
      />

      {/* Event info strip */}
      <View style={styles.eventStrip}>
        <Text style={styles.eventStripTitle} numberOfLines={1}>{event.eventName}</Text>
        <Text style={styles.eventStripMeta}>{event.artistName} · {event.city} · {event.date}</Text>
      </View>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={matchingBuddies}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderBuddy}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>—</Text>
              <Text style={styles.emptyTitle}>
                {language === 'zh' ? '暂无匹配搭子' : 'No matching buddies'}
              </Text>
              <Text style={styles.emptyDesc}>
                {language === 'zh' ? '其他用户可能还未添加该演出相关兴趣' : 'Other users may not have added interests for this event yet'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.xl, paddingBottom: spacing.xxxl },

  // Event strip
  eventStrip: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  eventStripTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  eventStripMeta: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
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
  avatar: { fontSize: 24 },
  buddyInfo: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  matchBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  matchText: {
    fontSize: 10,
    fontWeight: '800',
  },
  bio: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },

  // Tags
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
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
  purposeBadge: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  purposeText: {
    fontSize: fontSize.xs,
    color: '#4C1D95',
    fontWeight: '600',
  },
  styleBadge: {
    backgroundColor: colors.verified + '18',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.verified + '30',
  },
  styleText: {
    fontSize: fontSize.xs,
    color: colors.verified,
    fontWeight: '600',
  },

  // Action
  pendingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${colors.warning}18`,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  pendingText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.warning,
  },
  addButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
