import React, { useState, useMemo } from 'react';
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

interface DatePickerProps {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  error?: string | null;
}

function getYearMonthsDays() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => String(currentYear - 1 + i));

  const months = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, '0'),
  );

  const days = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, '0'),
  );

  return { years, months, days };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export default function DatePicker({
  label,
  value,
  onChange,
  error,
}: DatePickerProps) {
  const [visible, setVisible] = useState(false);

  const parsed = useMemo(() => {
    if (!value) return { year: '', month: '', day: '' };
    const [y, m, d] = value.split('-');
    return { year: y, month: m, day: d };
  }, [value]);

  const [tempYear, setTempYear] = useState(parsed.year);
  const [tempMonth, setTempMonth] = useState(parsed.month);
  const [tempDay, setTempDay] = useState(parsed.day);

  const { years, months, days } = getYearMonthsDays();

  const openPicker = () => {
    const now = parsed;
    setTempYear(now.year || String(new Date().getFullYear()));
    setTempMonth(now.month || '01');
    setTempDay(now.day || '01');
    setVisible(true);
  };

  const confirmDate = () => {
    onChange(`${tempYear}-${tempMonth}-${tempDay}`);
    setVisible(false);
  };

  const maxDay = daysInMonth(Number(tempYear), Number(tempMonth));
  const validDays = days.slice(0, maxDay);

  const displayText = value || '点击选择日期';

  return (
    <View style={styles.container}>
      <Text style={[styles.label, error && styles.labelError]}>{label}</Text>
      <TouchableOpacity
        style={[styles.pickerButton, error && styles.pickerButtonError]}
        onPress={openPicker}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.pickerText,
            !value && styles.placeholderText,
          ]}
        >
          {displayText}
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
              <Text style={styles.modalTitle}>选择日期</Text>
              <TouchableOpacity onPress={confirmDate}>
                <Text style={styles.confirmText}>确定</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerRow}>
              {/* Year */}
              <View style={styles.pickerColumn}>
                <Text style={styles.columnLabel}>年</Text>
                <ScrollView
                  style={styles.scrollColumn}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                >
                  {years.map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={[
                        styles.option,
                        tempYear === y && styles.optionSelected,
                      ]}
                      onPress={() => setTempYear(y)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          tempYear === y && styles.optionTextSelected,
                        ]}
                      >
                        {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month */}
              <View style={styles.pickerColumn}>
                <Text style={styles.columnLabel}>月</Text>
                <ScrollView
                  style={styles.scrollColumn}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                >
                  {months.map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.option,
                        tempMonth === m && styles.optionSelected,
                      ]}
                      onPress={() => setTempMonth(m)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          tempMonth === m && styles.optionTextSelected,
                        ]}
                      >
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Day */}
              <View style={styles.pickerColumn}>
                <Text style={styles.columnLabel}>日</Text>
                <ScrollView
                  style={styles.scrollColumn}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                >
                  {validDays.map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[
                        styles.option,
                        tempDay === d && styles.optionSelected,
                      ]}
                      onPress={() => setTempDay(d)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          tempDay === d && styles.optionTextSelected,
                        ]}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
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
  pickerRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  columnLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  scrollColumn: {
    width: '100%',
    maxHeight: 280,
  },
  option: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    marginBottom: 2,
  },
  optionSelected: {
    backgroundColor: colors.primary + '20',
  },
  optionText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
});
