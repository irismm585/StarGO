import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { borderRadius, fontSize, spacing } from '../../constants/layout';
import { useTranslation } from '../../contexts/LanguageContext';
import type { MemorialTemplate } from '../../types/memorial';

interface TemplateSelectorProps {
  selected: MemorialTemplate;
  onSelect: (template: MemorialTemplate) => void;
}

const TEMPLATE_KEYS: { key: MemorialTemplate; icon: string; i18nKey: string }[] = [
  { key: 'concert_recap', icon: '🎤', i18nKey: 'templateConcertRecap' },
  { key: 'festival_vlog', icon: '🎪', i18nKey: 'templateFestivalVlog' },
  { key: 'fan_appreciation', icon: '💜', i18nKey: 'templateFanAppreciation' },
  { key: 'meet_greet_story', icon: '🤝', i18nKey: 'templateMeetGreet' },
  { key: 'venue_review', icon: '🏟️', i18nKey: 'templateVenueReview' },
  { key: 'travel_memory', icon: '✈️', i18nKey: 'templateTravelMemory' },
];

export default function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t.memorial.template}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {TEMPLATE_KEYS.map((item) => {
          const isSelected = item.key === selected;
          const label = (t.memorial as any)[item.i18nKey] || item.key;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => onSelect(item.key)}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
              ]}
            >
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={[styles.labelText, isSelected && styles.labelTextSelected]}>
                {label}
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
