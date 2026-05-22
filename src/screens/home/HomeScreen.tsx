import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';
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
  const [events, setEvents] = useState<MockEvent[]>(getAllEvents());

  useEffect(() => {
    setEvents(getEventsByCategory(activeCategory));
  }, [activeCategory]);

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

            {/* Quick Action Buttons */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={handlePlanTrip}
                activeOpacity={0.85}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '18' }]}>
                  <Text style={styles.quickActionEmoji}>→</Text>
                </View>
                <Text style={styles.quickActionLabel}>{t.home.planTrip}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={handleFindBuddy}
                activeOpacity={0.85}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '18' }]}>
                  <Text style={styles.quickActionEmoji}>↗</Text>
                </View>
                <Text style={styles.quickActionLabel}>{t.home.findBuddy}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={handleMemorial}
                activeOpacity={0.85}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '18' }]}>
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
            <Text style={styles.emptyIcon}>—</Text>
            <Text style={styles.emptyTitle}>{t.home.empty}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  categoryScroll: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  categoryTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
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
