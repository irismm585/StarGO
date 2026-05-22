import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { borderRadius, fontSize, spacing } from '../../constants/layout';
import type { ChatMessage } from '../../types/chat';
import { getRelativeTime } from '../../utils/formatters';

interface ChatBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  onItineraryPress?: (share: NonNullable<ChatMessage['itineraryShare']>) => void;
}

export default function ChatBubble({ message, isOwn, onItineraryPress }: ChatBubbleProps) {
  // Alert messages
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

  // Itinerary share messages
  if (message.itineraryShare) {
    const share = message.itineraryShare;
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
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onItineraryPress?.(share)}
            style={[
              styles.shareCard,
              isOwn ? styles.shareCardOwn : styles.shareCardOther,
            ]}
          >
            <View style={styles.shareHeader}>
              <Text style={styles.shareIcon}>🎫</Text>
              <Text style={[styles.shareLabel, isOwn ? styles.shareLabelOwn : styles.shareLabelOther]}>
                行程分享
              </Text>
            </View>
            <Text style={[styles.shareTitle, isOwn ? styles.shareTextLight : styles.shareTextDark]}>
              {share.eventName}
            </Text>
            <View style={styles.shareDetails}>
              <Text style={[styles.shareDetail, isOwn ? styles.shareTextLight : styles.shareTextDark]}>
                📍 {share.venueName} · {share.city}
              </Text>
              <Text style={[styles.shareDetail, isOwn ? styles.shareTextLight : styles.shareTextDark]}>
                📅 {share.startDate} ~ {share.endDate}
              </Text>
              <Text style={[styles.shareDetail, isOwn ? styles.shareTextLight : styles.shareTextDark]}>
                💰 ¥{share.budget.toLocaleString('zh-CN')}
              </Text>
            </View>
          </TouchableOpacity>
          <Text style={[styles.time, isOwn ? styles.ownTime : styles.otherTime]}>
            {getRelativeTime(message.timestamp)}
          </Text>
        </View>
      </View>
    );
  }

  // Normal text messages
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
  // Itinerary share card
  shareCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minWidth: 200,
  },
  shareCardOwn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  shareCardOther: {
    backgroundColor: '#F8F6FF',
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
  },
  shareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  shareIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  shareLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  shareLabelOwn: {
    color: 'rgba(255,255,255,0.8)',
  },
  shareLabelOther: {
    color: colors.primary,
  },
  shareTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  shareDetails: {
    gap: 3,
  },
  shareDetail: {
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  shareTextLight: {
    color: 'rgba(255,255,255,0.85)',
  },
  shareTextDark: {
    color: colors.text,
  },
});
