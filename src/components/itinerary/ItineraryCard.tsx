import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { borderRadius, fontSize, spacing, shadow } from '../../constants/layout';
import { formatDateRange } from '../../utils/formatters';
import type { SavedItinerary } from '../../types/itinerary';

interface ItineraryCardProps {
  itinerary: SavedItinerary;
  onPress: () => void;
}

export default function ItineraryCard({ itinerary, onPress }: ItineraryCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={styles.card}>
        <LinearGradient
          colors={['#9578C8', '#7E5FA8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accent}
        />
        <View style={styles.content}>
          <Text style={styles.eventName} numberOfLines={1}>
            {itinerary.eventName}
          </Text>
          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{itinerary.venueName}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{itinerary.city}</Text>
            </View>
          </View>
          <Text style={styles.date}>
            {formatDateRange(itinerary.startDate, itinerary.endDate)}
          </Text>
          <Text style={styles.title} numberOfLines={1}>
            {itinerary.title}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(30, 24, 44, 0.85)',
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadow.card,
  },
  accent: {
    width: 6,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  eventName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#E8E4F0',
    marginBottom: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tag: {
    backgroundColor: 'rgba(149, 120, 200, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: fontSize.xs,
    color: '#B8A0E0',
    fontWeight: '600',
  },
  date: {
    fontSize: fontSize.sm,
    color: '#B8B0CC',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.md,
    color: '#B8B0CC',
  },
});
