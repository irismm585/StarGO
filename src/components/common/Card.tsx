import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { borderRadius, spacing, shadow } from '../../constants/layout';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glass?: boolean;
}

export default function Card({ children, style, glass = true }: CardProps) {
  return (
    <View style={[styles.card, glass && styles.glass, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  glass: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.card,
  },
});
