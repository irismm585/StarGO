import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/layout';

export interface PickerOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface PickerSelectProps {
  label: string;
  options: PickerOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string | null;
}

export default function PickerSelect({
  label,
  options,
  value,
  onChange,
  placeholder = '请选择',
  error,
}: PickerSelectProps) {
  const [visible, setVisible] = useState(false);

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, error && styles.labelError]}>{label}</Text>
      <TouchableOpacity
        style={[styles.pickerButton, error && styles.pickerButtonError]}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.pickerText,
            !value && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {selectedLabel || placeholder}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.confirmText}>确定</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            >
              {options.map((option) =>
                option.disabled ? (
                  <View key={option.value} style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderText}>{option.label}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.option,
                      value === option.value && styles.optionSelected,
                    ]}
                    onPress={() => {
                      onChange(option.value);
                      setVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        value === option.value && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {value === option.value && (
                      <Text style={styles.checkMark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ),
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
  },
  pickerButtonError: {
    borderColor: colors.error,
  },
  pickerText: {
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  placeholderText: {
    color: colors.textMuted,
  },
  arrow: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.xl,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  cancelText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  confirmText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primary,
  },
  optionsList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  sectionHeader: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeaderText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: 2,
  },
  optionSelected: {
    backgroundColor: colors.primary + '15',
  },
  optionText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  checkMark: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '700',
  },
});
