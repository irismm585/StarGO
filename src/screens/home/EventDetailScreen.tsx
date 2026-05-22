import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/layout';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import type { HomeStackParamList } from '../../navigation/HomeStack';

type EventDetailRoute = RouteProp<HomeStackParamList, 'EventDetail'>;

export default function EventDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<EventDetailRoute>();
  const event = route.params.event;

  // Compute the next day for end date
  const eventDateObj = new Date(event.date);
  const nextDay = new Date(eventDateObj);
  nextDay.setDate(nextDay.getDate() + 1);
  const endDateStr = nextDay.toISOString().split('T')[0];

  const handleAddToItinerary = () => {
    // Navigate to itinerary create with pre-filled data
    navigation.navigate('ItineraryTab', {
      screen: 'ItineraryCreate',
      params: {
        prefill: {
          eventName: event.eventName,
          venueName: event.venueName,
          city: event.city,
          eventDate: event.date,
          startDate: event.date,
          endDate: endDateStr,
        },
      },
    });
  };

  return (
    <View style={styles.container}>
      <Header title="演出详情" showBack />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroEmoji}>{event.image}</Text>
          <Text style={styles.heroTitle}>{event.eventName}</Text>
          <Text style={styles.heroArtist}>{event.artistName}</Text>
        </LinearGradient>

        {/* Info Card */}
        <View style={styles.section}>
          <Card>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <View>
                <Text style={styles.infoLabel}>场馆</Text>
                <Text style={styles.infoValue}>{event.venueName}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🏙️</Text>
              <View>
                <Text style={styles.infoLabel}>城市</Text>
                <Text style={styles.infoValue}>{event.city}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📅</Text>
              <View>
                <Text style={styles.infoLabel}>日期</Text>
                <Text style={styles.infoValue}>{event.date}</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>演出简介</Text>
          <Card>
            <Text style={styles.description}>{event.description}</Text>
          </Card>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <Button
          title="加入行程规划"
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
  hero: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.xxl,
    borderRadius: 24,
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 56, marginBottom: spacing.lg },
  heroTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroArtist: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.8)',
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
