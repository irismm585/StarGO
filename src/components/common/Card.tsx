import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { borderRadius, spacing, shadow } from '../../constants/layout';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accent?: boolean;
}

export default function Card({ children, style, accent = false }: CardProps) {
  return (
    <View style={[styles.card, accent && styles.accentCard, style]}>
      {accent && <View style={styles.accentLine} />}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  accentCard: {
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  accentLine: {
    height: 4,
    backgroundColor: colors.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    marginBottom: spacing.md,
  },
});
