import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors as colorsLight } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/layout';
import { useTranslation } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useColors } from '../../contexts/ThemeContext';
import { getBuddyPosts } from '../../services/buddy';
import Header from '../../components/common/Header';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  getPurposeLabel,
  getPurposeIcon,
  type BuddyPost,
  type BuddyPurpose,
} from '../../types/buddy';

export default function BuddyPostsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const colors = useColors();

  const [posts, setPosts] = useState<BuddyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const styles = useMemo(() => makeStyles(colors), [colors]);

  const loadPosts = useCallback(async () => {
    try {
      const allPosts = await getBuddyPosts();
      setPosts(allPosts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [loadPosts]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const renderPostCard = ({ item }: { item: BuddyPost }) => {
    const genderLabel =
      item.genderPreference === 'any'
        ? language === 'zh' ? '不限' : 'Any'
        : item.genderPreference === 'male'
          ? language === 'zh' ? '男性' : 'Male'
          : language === 'zh' ? '女性' : 'Female';

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.userName}>{item.displayName}</Text>
            <Text style={styles.eventName} numberOfLines={1}>
              🎫 {item.eventName}
            </Text>
          </View>
        </View>

        <View style={styles.meta}>
          {item.eventDate ? (
            <Text style={styles.metaText}>📅 {item.eventDate}</Text>
          ) : null}
          <Text style={styles.metaText}>📍 {item.city}</Text>
          <Text style={styles.metaText}>
            {language === 'zh' ? '偏好' : 'Pref'}: {genderLabel}
          </Text>
        </View>

        <View style={styles.purposeRow}>
          {item.purpose.map((p, idx) => (
            <View key={idx} style={styles.purposeBadge}>
              <Text style={styles.purposeIcon}>{getPurposeIcon(p as BuddyPurpose)}</Text>
              <Text style={styles.purposeText}>
                {getPurposeLabel(p as BuddyPurpose, language)}
              </Text>
            </View>
          ))}
        </View>

        {item.description ? (
          <Text style={styles.desc} numberOfLines={3}>
            {item.description}
          </Text>
        ) : null}

        <Text style={styles.time}>
          {new Date(item.createdAt).toLocaleDateString(
            language === 'zh' ? 'zh-CN' : 'en-US',
          )}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title={language === 'zh' ? '发现帖子' : 'Buddy Posts'} showBack />
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={language === 'zh' ? '发现帖子' : 'Buddy Posts'} showBack />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderPostCard}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>{t.findBuddy.noPosts}</Text>
            <Text style={styles.emptyDesc}>{t.findBuddy.noPostsDesc}</Text>
          </View>
        }
      />
    </View>
  );
}

function makeStyles(colors: typeof colorsLight) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.xl, paddingBottom: spacing.xxxl },

  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primary,
  },
  cardInfo: { flex: 1 },
  userName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  eventName: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  purposeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  purposeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  purposeIcon: { fontSize: 12 },
  purposeText: {
    fontSize: 10,
    color: '#4C1D95',
    fontWeight: '600',
  },
  desc: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'right',
  },

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
}
