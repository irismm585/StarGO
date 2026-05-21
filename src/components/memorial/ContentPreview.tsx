import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../../constants/colors';
import { borderRadius, fontSize, spacing } from '../../constants/layout';

interface ContentPreviewProps {
  title: string;
  content: string;
  accentColor?: string;
}

export default function ContentPreview({
  title,
  content,
  accentColor = colors.primary,
}: ContentPreviewProps) {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(content);
  };

  return (
    <View style={[styles.container, { borderColor: accentColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
        <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
          <Text style={styles.copyText}>复制</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.content} selectable>
        {content}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderLeftWidth: 4,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  copyButton: {
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  copyText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 22,
  },
});
