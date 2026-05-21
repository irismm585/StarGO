import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { borderRadius, fontSize, spacing } from '../../constants/layout';
import type { DaySchedule } from '../../types/itinerary';

interface TimelineProps {
  days: DaySchedule[];
}

export default function ItineraryTimeline({ days }: TimelineProps) {
  const [expandedDay, setExpandedDay] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>每日行程</Text>
      {/* Day tabs */}
      <View style={styles.dayTabs}>
        {days.map((day, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => setExpandedDay(idx)}
            style={[styles.dayTab, expandedDay === idx && styles.dayTabActive]}
          >
            <Text
              style={[styles.dayTabText, expandedDay === idx && styles.dayTabTextActive]}
            >
              {day.day}
            </Text>
            <Text
              style={[styles.dayTabDate, expandedDay === idx && styles.dayTabDateActive]}
            >
              {day.date}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Timeline for selected day */}
      {days[expandedDay] && (
        <View style={styles.timeline}>
          {days[expandedDay].schedule.map((item, idx) => (
            <View key={idx} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[styles.dot, idx === 0 && styles.dotFirst]} />
                {idx < days[expandedDay].schedule.length - 1 && (
                  <View style={styles.line} />
                )}
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <View style={styles.activityCard}>
                  <Text style={styles.activityName}>{item.activity}</Text>
                  <Text style={styles.activityLocation}>{item.location}</Text>
                  <Text style={styles.activityDetails}>{item.details}</Text>
                  {item.tips && (
                    <View style={styles.tipsContainer}>
                      <Text style={styles.tipsLabel}>💡</Text>
                      <Text style={styles.tipsText}>{item.tips}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  dayTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    flexWrap: 'wrap',
  },
  dayTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  dayTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayTabText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  dayTabTextActive: {
    color: '#FFFFFF',
  },
  dayTabDate: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dayTabDateActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  timeline: {
    paddingLeft: spacing.xs,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
    marginTop: 4,
  },
  dotFirst: {
    backgroundColor: colors.primary,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  timeBadge: {
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  timeText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '700',
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  activityLocation: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  activityDetails: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${colors.warning}15`,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  tipsLabel: {
    fontSize: 14,
  },
  tipsText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
  },
});
