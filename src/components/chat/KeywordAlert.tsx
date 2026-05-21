import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { borderRadius, fontSize, spacing } from '../../constants/layout';

interface KeywordAlertProps {
  matchedKeywords: string[];
  visible: boolean;
}

export default function KeywordAlert({ matchedKeywords, visible }: KeywordAlertProps) {
  if (!visible || matchedKeywords.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🚫</Text>
      <View style={styles.content}>
        <Text style={styles.title}>检测到违规内容</Text>
        <Text style={styles.detail}>
          消息包含敏感关键词：{matchedKeywords.join('、')}
        </Text>
        <Text style={styles.hint}>请移除相关词汇后重新发送</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: spacing.xs,
  },
  detail: {
    fontSize: fontSize.sm,
    color: '#B91C1C',
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
