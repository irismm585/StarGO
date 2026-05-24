import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors as colorsLight } from '../../constants/colors';
import { useColors } from '../../contexts/ThemeContext';
import { fontSize, spacing, borderRadius } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import {
  getAllEvents,
  getEventsByCategory,
  CATEGORIES,
  type EventCategory,
  type MockEvent,
} from '../../constants/events';
import { localizeEvent } from '../../utils/localization';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.xl * 2;
const CARD_HEIGHT = 200;

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { t, language, toggleLanguage } = useTranslation();

  const [activeCategory, setActiveCategory] = useState<EventCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCity, setFilterCity] = useState('');
  const [priceSort, setPriceSort] = useState<'none' | 'low-high' | 'high-low'>('none');
  const [dateSort, setDateSort] = useState<'none' | 'earliest' | 'latest'>('none');
  const [events, setEvents] = useState<MockEvent[]>(getAllEvents());

  // Filter events by category, search query, city, price sort, date sort
  useEffect(() => {
    let filtered = getEventsByCategory(activeCategory);

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((ev) => {
        const fields = [
          ev.eventName, ev.eventNameEn,
          ev.artistName, ev.artistNameEn,
          ev.venueName, ev.venueNameEn,
          ev.city, ev.cityEn,
        ];
        return fields.some((f) => f && f.toLowerCase().includes(q));
      });
    }

    // City filter
    if (filterCity.trim()) {
      const q = filterCity.trim().toLowerCase();
      filtered = filtered.filter((ev) =>
        (ev.city && ev.city.toLowerCase().includes(q)) ||
        (ev.cityEn && ev.cityEn.toLowerCase().includes(q))
      );
    }

    // Price sort (parse min price from "¥580-¥3,280" format)
    if (priceSort !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        const aMin = parseFloat(a.priceRange.replace(/[^0-9.-]/g, '').split('-')[0] || '0');
        const bMin = parseFloat(b.priceRange.replace(/[^0-9.-]/g, '').split('-')[0] || '0');
        return priceSort === 'low-high' ? aMin - bMin : bMin - aMin;
      });
    }

    // Date sort
    if (dateSort !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        const aDate = new Date(a.date).getTime();
        const bDate = new Date(b.date).getTime();
        return dateSort === 'earliest' ? aDate - bDate : bDate - aDate;
      });
    }

    setEvents(filtered);
  }, [activeCategory, searchQuery, filterCity, priceSort, dateSort]);

  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const handleCategoryChange = (cat: EventCategory | 'all') => {
    setActiveCategory(cat);
  };

  const getCategoryLabel = (cat: EventCategory | 'all'): string => {
    if (cat === 'all') return t.home.all;
    const found = CATEGORIES.find((c) => c.key === cat);
    if (!found) return cat;
    return language === 'zh' ? found.labelZh : found.labelEn;
  };

  const handleEventPress = (event: MockEvent) => {
    navigation.navigate('EventDetail', { event });
  };

  const handlePlanTrip = () => {
    navigation.navigate('ItineraryTab', { screen: 'ItineraryList' });
  };

  const handleFindBuddy = () => {
    navigation.navigate('FindBuddy');
  };

  const handleMemorial = () => {
    navigation.navigate('MemorialTab', { screen: 'MemorialGenerator' });
  };

  const resetFilters = () => {
    setFilterCity('');
    setPriceSort('none');
    setDateSort('none');
    setSearchQuery('');
  };

  const hasActiveFilters = filterCity || priceSort !== 'none' || dateSort !== 'none';

  const renderEventCard = ({ item }: { item: MockEvent }) => {
    const localized = localizeEvent(item, language);
    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => handleEventPress(item)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: localized.image }}
          style={styles.eventImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.eventImageOverlay}
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            {getCategoryLabel(item.category)}
          </Text>
        </View>
        <View style={styles.eventInfo}>
          <Text style={styles.eventName} numberOfLines={1}>
            {localized.eventName}
          </Text>
          <Text style={styles.eventArtist} numberOfLines={1}>
            {localized.artistName}
          </Text>
          <View style={styles.eventMeta}>
            <Text style={styles.eventMetaText}>
              · {localized.venueName} · {localized.city}
            </Text>
          </View>
          <Text style={styles.eventDate}>— {localized.date}</Text>
          <Text style={styles.eventPrice}>{localized.priceRange}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header - Logo only */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoRow}>
            <Text style={styles.logoIcon}>✦</Text>
            <Text style={styles.logoText}>𝓢𝓽𝓪𝓻𝓖𝓸</Text>
          </View>
          <TouchableOpacity
            style={styles.langToggle}
            onPress={toggleLanguage}
            activeOpacity={0.7}
          >
            <Text style={styles.langToggleText}>
              {language === 'zh' ? 'EN' : '中'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEventCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Greeting */}
            <View style={styles.greetingSection}>
              <Text style={styles.greeting}>{t.home.title}</Text>
              <Text style={styles.headerSub}>{t.home.greeting}</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder={language === 'zh' ? '搜索活动、艺人、城市...' : 'Search events, artists, cities...'}
                  placeholderTextColor={colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7} style={styles.searchClearBtn}>
                    <Text style={styles.searchClear}>✕</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.filterBtn, (showFilters || hasActiveFilters) && styles.filterBtnActive]}
                  onPress={() => setShowFilters((v) => !v)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterBtnText, (showFilters || hasActiveFilters) && styles.filterBtnTextActive]}>
                    ⚙
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Filter Panel */}
            {showFilters && (
              <View style={styles.filterPanel}>
                {/* Price Sort */}
                <Text style={styles.filterLabel}>
                  {language === 'zh' ? '价格排序' : 'Price Sort'}
                </Text>
                <View style={styles.filterChipsRow}>
                  {(['none', 'low-high', 'high-low'] as const).map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.filterChip, priceSort === opt && styles.filterChipActive]}
                      onPress={() => setPriceSort(opt)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.filterChipText, priceSort === opt && styles.filterChipTextActive]}>
                        {opt === 'none'
                          ? (language === 'zh' ? '默认' : 'Default')
                          : opt === 'low-high'
                            ? (language === 'zh' ? '低到高 ↑' : 'Low-High ↑')
                            : (language === 'zh' ? '高到低 ↓' : 'High-Low ↓')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Date Sort */}
                <Text style={[styles.filterLabel, { marginTop: spacing.md }]}>
                  {language === 'zh' ? '日期排序' : 'Date Sort'}
                </Text>
                <View style={styles.filterChipsRow}>
                  {(['none', 'earliest', 'latest'] as const).map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.filterChip, dateSort === opt && styles.filterChipActive]}
                      onPress={() => setDateSort(opt)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.filterChipText, dateSort === opt && styles.filterChipTextActive]}>
                        {opt === 'none'
                          ? (language === 'zh' ? '默认' : 'Default')
                          : opt === 'earliest'
                            ? (language === 'zh' ? '最早' : 'Earliest')
                            : (language === 'zh' ? '最晚' : 'Latest')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* City Filter */}
                <Text style={[styles.filterLabel, { marginTop: spacing.md }]}>
                  {language === 'zh' ? '城市筛选' : 'City Filter'}
                </Text>
                <TextInput
                  style={styles.filterCityInput}
                  placeholder={language === 'zh' ? '输入城市名...' : 'Enter city name...'}
                  placeholderTextColor={colors.textMuted}
                  value={filterCity}
                  onChangeText={setFilterCity}
                />

                {/* Reset */}
                {hasActiveFilters && (
                  <TouchableOpacity
                    style={styles.resetBtn}
                    onPress={resetFilters}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resetBtnText}>
                      {language === 'zh' ? '🔄 重置筛选' : '🔄 Reset Filters'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Quick Action Buttons */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={handlePlanTrip}
                activeOpacity={0.85}
              >
                <View style={styles.quickActionIcon}>
                  <Text style={styles.quickActionEmoji}>→</Text>
                </View>
                <Text style={styles.quickActionLabel}>{t.home.planTrip}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={handleFindBuddy}
                activeOpacity={0.85}
              >
                <View style={styles.quickActionIcon}>
                  <Text style={styles.quickActionEmoji}>↗</Text>
                </View>
                <Text style={styles.quickActionLabel}>{t.home.findBuddy}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={handleMemorial}
                activeOpacity={0.85}
              >
                <View style={styles.quickActionIcon}>
                  <Text style={styles.quickActionEmoji}>◇</Text>
                </View>
                <Text style={styles.quickActionLabel}>{t.home.memorialText}</Text>
              </TouchableOpacity>
            </View>

            {/* Category Tabs */}
            <View style={styles.categoryContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {(['all', ...CATEGORIES.map((c) => c.key)] as const).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryTab,
                      activeCategory === cat && styles.categoryTabActive,
                    ]}
                    onPress={() => handleCategoryChange(cat)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        activeCategory === cat && styles.categoryTextActive,
                      ]}
                    >
                      {getCategoryLabel(cat)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>{searchQuery ? '🔍' : '—'}</Text>
            <Text style={styles.emptyTitle}>
              {searchQuery
                ? (language === 'zh' ? '未找到匹配的活动' : 'No matching events found')
                : t.home.empty}
            </Text>
          </View>
        }
      />
    </View>
  );
}

function makeStyles(colors: typeof colorsLight) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 44,
    paddingBottom: 14,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoIcon: {
    fontSize: 28,
  },
  logoText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontStyle: 'italic',
  },
  langToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  langToggleText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  greetingSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSub: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: 0,
  },
  searchClear: {
    fontSize: 16,
    color: colors.textMuted,
    paddingLeft: spacing.sm,
  },
  searchClearBtn: {
    padding: spacing.xs,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  filterBtnActive: {
    backgroundColor: colors.primary + '25',
  },
  filterBtnText: {
    fontSize: 18,
  },
  filterBtnTextActive: {
    color: colors.primary,
  },
  filterPanel: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primary,
  },
  filterCityInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.text,
    height: 40,
  },
  resetBtn: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetBtnText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#9578C8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.primary + '28',
  },
  quickActionEmoji: {
    fontSize: 22,
  },
  quickActionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  categoryContainer: {
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryScroll: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  categoryTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl + 40,
  },
  eventCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    shadowColor: '#9578C8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  eventImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  categoryBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4C1D95',
  },
  eventInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  eventName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  eventArtist: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: spacing.sm,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  eventMetaText: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.75)',
  },
  eventDate: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.75)',
  },
  eventPrice: {
    fontSize: fontSize.sm,
    color: '#FFD700',
    fontWeight: '700',
    marginTop: 3,
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
  });
}
