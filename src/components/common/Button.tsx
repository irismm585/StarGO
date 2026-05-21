import React, { useCallback, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { borderRadius, fontSize, spacing, shadow } from '../../constants/layout';

type Variant = 'gradient' | 'outline' | 'ghost';

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
  variant = 'gradient',
  loading = false,
  disabled = false,
  style,
  fullWidth = true,
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
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

  if (variant === 'gradient') {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && styles.fullWidth]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isDisabled ? ['#CBD5E1', '#94A3B8'] : [colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.button, styles.gradientButton, style]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.gradientText}>{title}</Text>
            )}
          </LinearGradient>
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
          activeOpacity={0.8}
          style={[
            styles.button,
            styles.outlineButton,
            isDisabled && styles.disabledOutline,
            style,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Text style={[styles.outlineText, isDisabled && styles.disabledText]}>{title}</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // ghost variant
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.ghostButton, style]}
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : (
        <Text style={[styles.ghostText, isDisabled && styles.disabledText]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  button: {
    height: 52,
    borderRadius: borderRadius.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  gradientButton: {
    ...shadow.button,
  },
  gradientText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  disabledOutline: {
    borderColor: '#CBD5E1',
  },
  outlineText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  disabledText: {
    color: '#94A3B8',
  },
  ghostButton: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  ghostText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
