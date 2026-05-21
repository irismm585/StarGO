import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { borderRadius, fontSize, spacing } from '../../constants/layout';
import type { ChatMessage } from '../../types/chat';
import { getRelativeTime } from '../../utils/formatters';

interface ChatBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

export default function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  if (message.isAlert) {
    return (
      <View style={[styles.container, styles.alertContainer]}>
        <Text style={styles.alertIcon}>⚠️</Text>
        <Text style={styles.alertText}>
          该消息因含违规关键词已被屏蔽
        </Text>
        {message.alertReason && (
          <Text style={styles.alertReason}>{message.alertReason}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
      {!isOwn && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {message.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.bubbleWrapper}>
        {!isOwn && (
          <Text style={styles.username}>{message.displayName}</Text>
        )}
        {isOwn ? (
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.ownBubble]}
          >
            <Text style={styles.ownText}>{message.content}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.otherBubble]}>
            <Text style={styles.otherText}>{message.content}</Text>
          </View>
        )}
        <Text style={[styles.time, isOwn ? styles.ownTime : styles.otherTime]}>
          {getRelativeTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  ownContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  alertContainer: {
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  alertIcon: {
    fontSize: 16,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  alertText: {
    fontSize: fontSize.xs,
    color: colors.error,
    textAlign: 'center',
  },
  alertReason: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    alignSelf: 'flex-end',
  },
  avatarText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  bubbleWrapper: {
    maxWidth: '75%',
  },
  bubble: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  ownBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  ownText: {
    fontSize: fontSize.md,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  otherText: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  username: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
    marginLeft: 2,
  },
  time: {
    fontSize: fontSize.xs,
    marginTop: 2,
    marginHorizontal: 2,
  },
  ownTime: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
  },
  otherTime: {
    color: colors.textMuted,
  },
});
