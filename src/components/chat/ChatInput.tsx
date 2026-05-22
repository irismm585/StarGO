import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { borderRadius, fontSize, spacing } from '../../constants/layout';
import { checkForScalping } from '../../constants/keywords';

const EMOJIS = [
  '😊', '😂', '❤️', '🔥', '🎵', '🎶', '✨', '⭐',
  '👍', '👏', '🎉', '🎊', '💪', '😭', '😍', '🤩',
  '🙌', '💜', '🌟', '🥹', '💕', '😎', '🎤', '🎸',
];

interface ChatInputProps {
  onSend: (text: string) => void;
  onPlanItinerary?: () => void;
  onShareItinerary?: () => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, onPlanItinerary, onShareItinerary, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const [warning, setWarning] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const filterResult = checkForScalping(trimmed);
    if (filterResult.isBlocked) {
      setWarning(`消息包含违规关键词：${filterResult.matchedKeywords.join(', ')}`);
      return;
    }

    setWarning(null);
    onSend(trimmed);
    setText('');
  };

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
  };

  return (
    <View style={styles.container}>
      {warning && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>{warning}</Text>
        </View>
      )}

      {/* Emoji Picker */}
      {showEmoji && (
        <View style={styles.emojiContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.emojiList}
          >
            {EMOJIS.map((emoji, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.emojiItem}
                onPress={() => insertEmoji(emoji)}
                activeOpacity={0.6}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.inputRow}>
        {/* Emoji toggle */}
        <TouchableOpacity
          onPress={() => setShowEmoji((v) => !v)}
          style={[styles.actionButton, showEmoji && styles.actionButtonActive]}
        >
          <Text style={styles.actionIcon}>😊</Text>
        </TouchableOpacity>

        {/* Plan Itinerary */}
        {onPlanItinerary && (
          <TouchableOpacity onPress={onPlanItinerary} style={styles.actionButton}>
            <Text style={styles.actionIcon}>📋</Text>
          </TouchableOpacity>
        )}

        {/* Share Itinerary */}
        {onShareItinerary && (
          <TouchableOpacity onPress={onShareItinerary} style={styles.actionButton}>
            <Text style={styles.actionIcon}>🎫</Text>
          </TouchableOpacity>
        )}

        <TextInput
          style={styles.input}
          placeholder="说点什么..."
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={(v) => {
            setText(v);
            if (warning) setWarning(null);
          }}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={disabled || !text.trim()}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              disabled || !text.trim()
                ? ['#CBD5E1', '#94A3B8']
                : [colors.gradientStart, colors.gradientEnd]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sendButton}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingTop: spacing.sm,
  },
  warning: {
    backgroundColor: '#FEF2F2',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  warningText: {
    fontSize: fontSize.xs,
    color: colors.error,
    textAlign: 'center',
  },
  emojiContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  emojiList: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  emojiItem: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  emojiText: {
    fontSize: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: `${colors.primary}25`,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
