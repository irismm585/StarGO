import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors as colorsLight } from '../../constants/colors';
import { borderRadius, spacing, shadow } from '../../constants/layout';
import { useColors } from '../../contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glass?: boolean;
}

export default function Card({ children, style, glass = true }: CardProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={[styles.card, glass && styles.glass, style]}>
      {children}
    </View>
  );
}

function makeStyles(colors: typeof colorsLight) {
  return StyleSheet.create({
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
}
