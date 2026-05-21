import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { borderRadius, fontSize, spacing } from '../../constants/layout';
import type { BudgetObj } from '../../types/itinerary';

interface BudgetBreakdownProps {
  budget: BudgetObj;
}

const CATEGORY_COLORS = [
  colors.primary,
  colors.accent,
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
];

export default function BudgetBreakdown({ budget }: BudgetBreakdownProps) {
  const entries = Object.entries(budget.breakdown);
  if (entries.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>预算</Text>
        <Text style={styles.total}>总计：{budget.total}</Text>
      </View>
    );
  }

  // Calculate percentages for bar visualization
  const total = entries.reduce((sum, [, val]) => {
    const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>预算</Text>
      <Text style={styles.total}>总计：{budget.total}</Text>

      {/* Bar visualization */}
      <View style={styles.barContainer}>
        {entries.map(([key, val], idx) => {
          const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
          const pct = total > 0 ? (num / total) * 100 : 0;
          if (pct < 1) return null;
          return (
            <View
              key={key}
              style={[
                styles.barSegment,
                {
                  flex: pct,
                  backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
                },
              ]}
            />
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {entries.map(([key, val], idx) => {
          const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
          const pct = total > 0 ? Math.round((num / total) * 100) : 0;
          return (
            <View key={key} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] },
                ]}
              />
              <Text style={styles.legendLabel}>{key}</Text>
              <Text style={styles.legendValue}>{val}</Text>
              <Text style={styles.legendPct}>{pct}%</Text>
            </View>
          );
        })}
      </View>
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
    marginBottom: spacing.sm,
  },
  total: {
    fontSize: fontSize.lg,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  barContainer: {
    flexDirection: 'row',
    height: 12,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  barSegment: {
    height: '100%',
  },
  legend: {
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  legendValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    minWidth: 60,
    textAlign: 'right',
  },
  legendPct: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    minWidth: 40,
    textAlign: 'right',
  },
});
