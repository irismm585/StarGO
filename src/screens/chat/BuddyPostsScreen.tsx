import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
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
  BUDDY_PURPOSE_OPTIONS,
  getPurposeLabel,
  getPurposeIcon,
  type BuddyPost,
  type BuddyPurpose,
} from '../../types/buddy';

const GENDER_OPTIONS = [
  { key: 'any' as const, icon: '👥', labelZh: '不限', labelEn: 'Any' },
  { key: 'male' as const, icon: '👨', labelZh: '男性', labelEn: 'Male' },
  { key: 'female' as const, icon: '👩', labelZh: '女性', labelEn: 'Female' },
];

export default function BuddyPostsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const colors = useColors();

  const [posts, setPosts] = useState<BuddyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Search & Filter state ──
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [purposeFilter, setPurposeFilter] = useState<BuddyPurpose[]>([]);
  const [genderFilter, setGenderFilter] = useState<'any' | 'male' | 'female'>('any');

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

  const togglePurposeFilter = (p: BuddyPurpose) => {
    setPurposeFilter((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  };

  const clearFilters = () => {
    setSearchText('');
    setPurposeFilter([]);
    setGenderFilter('any');
  };

  // ── Filtered posts ──
  const filteredPosts = useMemo(() => {
    let result = posts;

    // Text search across event name, display name, city, description
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.eventName.toLowerCase().includes(q) ||
          p.displayName.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    // Purpose filter
    if (purposeFilter.length > 0) {
      result = result.filter((p) =>
        purposeFilter.some((pf) => p.purpose.includes(pf)),
      );
    }

    // Gender preference filter
    if (genderFilter !== 'any') {
      result = result.filter((p) => p.genderPreference === genderFilter);
    }

    return result;
  }, [posts, searchText, purposeFilter, genderFilter]);

  const hasActiveFilters = searchText.trim() !== '' || purposeFilter.length > 0 || genderFilter !== 'any';

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

  const ListHeader = () => (
    <View>
      {/* Search bar */}
      <View style={[styles.searchBar, hasActiveFilters && styles.searchBarActive]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder={t.findBuddy.searchPlaceholder}
          placeholderTextColor={colors.textMuted}
          clearButtonMode="while-editing"
        />
        {/* Filter toggle button */}
        <TouchableOpacity
          style={[styles.filterBtn, hasActiveFilters && styles.filterBtnActive]}
          onPress={() => setShowFilters((v) => !v)}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterBtnIcon, hasActiveFilters && styles.filterBtnIconActive]}>
            ☰
          </Text>
          {hasActiveFilters && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Filter panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          {/* Purpose */}
          <Text style={styles.filterLabel}>{t.findBuddy.filterPurpose}</Text>
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

          {/* Gender preference */}
          <Text style={[styles.filterLabel, { marginTop: spacing.md }]}>
            {t.findBuddy.filterGenderPref}
          </Text>
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

          {/* Clear */}
          {hasActiveFilters && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilters} activeOpacity={0.7}>
              <Text style={styles.clearBtnText}>✕ {t.findBuddy.filterClear}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

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
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderPostCard}
        ListHeaderComponent={ListHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>
              {hasActiveFilters ? '🔍' : '📋'}
            </Text>
            <Text style={styles.emptyTitle}>
              {hasActiveFilters
                ? (language === 'zh' ? '没有匹配的帖子' : 'No matching posts')
                : t.findBuddy.noPosts}
            </Text>
            <Text style={styles.emptyDesc}>
              {hasActiveFilters
                ? (language === 'zh' ? '试试调整搜索或筛选条件' : 'Try adjusting your search or filters')
                : t.findBuddy.noPostsDesc}
            </Text>
          </View>
        }
      />
    </View>
  );
}

function makeStyles(colors: typeof colorsLight) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },

    // ── Search bar ──
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
      paddingHorizontal: spacing.md,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
      height: 44,
    },
    searchBarActive: {
      borderColor: colors.primary,
    },
    searchIcon: {
      fontSize: 16,
      marginRight: spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: fontSize.sm,
      color: colors.text,
      paddingVertical: 0,
    },
    filterBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: spacing.xs,
    },
    filterBtnActive: {
      backgroundColor: `${colors.primary}15`,
    },
    filterBtnIcon: {
      fontSize: 18,
      color: colors.textSecondary,
    },
    filterBtnIconActive: {
      color: colors.primary,
    },
    filterDot: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },

    // ── Filter panel ──
    filterPanel: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
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
    clearBtn: {
      alignSelf: 'flex-end',
      marginTop: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    clearBtnText: {
      fontSize: fontSize.xs,
      color: colors.primary,
      fontWeight: '600',
    },

    // ── Card ──
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

    // ── Empty state ──
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
