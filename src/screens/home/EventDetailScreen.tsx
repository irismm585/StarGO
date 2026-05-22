import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/layout';
import { useTranslation } from '../../contexts/LanguageContext';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { localizeEvent } from '../../utils/localization';
import type { HomeStackParamList } from '../../navigation/HomeStack';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type EventDetailRoute = RouteProp<HomeStackParamList, 'EventDetail'>;

export default function EventDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<EventDetailRoute>();
  const { t, language } = useTranslation();
  const event = localizeEvent(route.params.event, language);

  const handleAddToItinerary = () => {
    const original = route.params.event;
    navigation.navigate('ItineraryTab', {
      screen: 'ItineraryCreate',
      params: {
        prefill: {
          eventName: event.eventName,
          venueName: event.venueName,
          city: original.city,
          eventDate: original.date,
        },
      },
    });
  };

  return (
    <View style={styles.container}>
      <Header title={t.eventDetail.title} showBack />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <Image
          source={{ uri: event.image }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.heroOverlay}
        />
        <View style={styles.heroInfo}>
          <Text style={styles.heroTitle}>{event.eventName}</Text>
          <Text style={styles.heroArtist}>{event.artistName}</Text>
        </View>

        {/* Info Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.eventDetail.info}</Text>
          <Card>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>●</Text>
              <View>
                <Text style={styles.infoLabel}>{t.eventDetail.venue}</Text>
                <Text style={styles.infoValue}>{event.venueName}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>○</Text>
              <View>
                <Text style={styles.infoLabel}>{t.eventDetail.city}</Text>
                <Text style={styles.infoValue}>{event.city}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>–</Text>
              <View>
                <Text style={styles.infoLabel}>{t.eventDetail.date}</Text>
                <Text style={styles.infoValue}>{event.date}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoIcon, { color: '#FFD700' }]}>¥</Text>
              <View>
                <Text style={styles.infoLabel}>{t.eventDetail.price}</Text>
                <Text style={[styles.infoValue, { color: '#FFD700', fontWeight: '700' }]}>{event.priceRange}</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.eventDetail.description}</Text>
          <Card>
            <Text style={styles.description}>{event.description}</Text>
          </Card>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <Button
          title={t.eventDetail.addToItinerary}
          onPress={handleAddToItinerary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxl },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 280,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  heroInfo: {
    position: 'absolute',
    top: 220,
    left: spacing.xl,
    right: spacing.xl,
  },
  heroTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroArtist: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.9)',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoIcon: { fontSize: 24, marginRight: spacing.lg },
  infoLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
  },
  bottomBar: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
