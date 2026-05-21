import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { borderRadius, fontSize, spacing } from '../../constants/layout';
import type { MemorialTemplate } from '../../types/memorial';

interface TemplateSelectorProps {
  selected: MemorialTemplate;
  onSelect: (template: MemorialTemplate) => void;
}

const TEMPLATES: { key: MemorialTemplate; label: string; icon: string }[] = [
  { key: 'concert_recap', label: '演唱会回顾', icon: '🎤' },
  { key: 'festival_vlog', label: '音乐节日记', icon: '🎪' },
  { key: 'fan_appreciation', label: '粉丝告白', icon: '💜' },
  { key: 'meet_greet_story', label: '见面会故事', icon: '🤝' },
  { key: 'venue_review', label: '场馆测评', icon: '🏟️' },
  { key: 'travel_memory', label: '旅行记忆', icon: '✈️' },
];

export default function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>选择模板</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {TEMPLATES.map((t) => {
          const isSelected = t.key === selected;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => onSelect(t.key)}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
              ]}
            >
              <Text style={styles.icon}>{t.icon}</Text>
              <Text style={[styles.labelText, isSelected && styles.labelTextSelected]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  scroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  card: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    minWidth: 90,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  },
  icon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  labelText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  labelTextSelected: {
    color: colors.primary,
  },
});
