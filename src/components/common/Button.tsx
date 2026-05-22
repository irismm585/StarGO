import React, { useCallback, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { colors } from '../../constants/colors';
import { borderRadius, fontSize, spacing, shadow } from '../../constants/layout';

type Variant = 'primary' | 'outline' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  fullWidth = true,
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  }, [scaleAnim]);

  const isDisabled = loading || disabled;

  if (variant === 'primary') {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && styles.fullWidth]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
          activeOpacity={0.9}
          style={[styles.button, styles.primaryButton, isDisabled && styles.disabledButton, style]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={[styles.primaryText, isDisabled && styles.disabledText]}>{title}</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === 'outline') {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && styles.fullWidth]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
          activeOpacity={0.9}
          style={[styles.button, styles.outlineButton, isDisabled && styles.disabledOutline, style]}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <Text style={[styles.outlineText, isDisabled && styles.disabledText]}>{title}</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[styles.ghostButton, style]}
    >
      {loading ? (
        <ActivityIndicator color={colors.textSecondary} size="small" />
      ) : (
        <Text style={[styles.ghostText, isDisabled && styles.disabledText]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  button: {
    height: 52,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    ...shadow.button,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  disabledButton: {
    backgroundColor: '#D4D4D4',
  },
  disabledOutline: {
    borderColor: '#D4D4D4',
  },
  outlineText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  disabledText: {
    color: '#B0B0B0',
  },
  ghostButton: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  ghostText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
});
