import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors as colorsLight } from '../../constants/colors';
import { borderRadius, fontSize, spacing, shadow } from '../../constants/layout';
import { useColors } from '../../contexts/ThemeContext';
import { formatDateRange } from '../../utils/formatters';
import type { SavedItinerary } from '../../types/itinerary';

interface ItineraryCardProps {
  itinerary: SavedItinerary;
  onPress: () => void;
}

export default function ItineraryCard({ itinerary, onPress }: ItineraryCardProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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

function makeStyles(colors: typeof colorsLight) {
  return StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
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
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tag: {
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
}
