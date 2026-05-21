import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { fontSize, spacing } from '../../constants/layout';
import Button from './Button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export default function ErrorState({ message, onRetry, retryLabel = '重试' }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>😕</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button
          title={retryLabel}
          onPress={onRetry}
          variant="outline"
          fullWidth={false}
          style={styles.retryButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  message: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  retryButton: {
    minWidth: 120,
  },
});
