import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors } from '../../constants/colors';
import { borderRadius, fontSize, spacing } from '../../constants/layout';

interface InputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
  secureTextEntry?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  multiline = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = error
    ? colors.error
    : borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.border, colors.primary],
      });

  return (
    <View style={styles.container}>
      <Text style={[styles.label, error && styles.labelError]}>{label}</Text>
      <Animated.View
        style={[
          styles.inputWrapper,
          { borderColor },
          isFocused && styles.inputFocused,
          error && styles.inputError,
          multiline && styles.multilineWrapper,
        ]}
      >
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  labelError: {
    color: colors.error,
  },
  inputWrapper: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  inputFocused: {
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    height: 50,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.md,
    color: colors.text,
  },
  multilineWrapper: {
    minHeight: 100,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
