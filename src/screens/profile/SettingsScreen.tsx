import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { fontSize, spacing, borderRadius } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, useColors } from '../../contexts/ThemeContext';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { useTranslation } from '../../contexts/LanguageContext';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const colors = useColors();
  const { t } = useTranslation();

  const styles = useMemo(() => makeStyles(colors), [colors]);

  const handleLogout = () => {
    Alert.alert(t.profile.logout, t.profile.logoutConfirm, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.profile.logout,
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title={t.profile.settings} showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Account */}
        <Text style={styles.sectionTitle}>账号</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>邮箱</Text>
            <Text style={styles.rowValue}>{user?.email || '--'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>用户名</Text>
            <Text style={styles.rowValue}>{user?.username || '--'}</Text>
          </View>
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>偏好</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>深色模式</Text>
            <Switch
              value={isDark}
              onValueChange={toggle}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={isDark ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>关于</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>版本</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>服务条款</Text>
            <Text style={styles.rowArrow}>›</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>隐私政策</Text>
            <Text style={styles.rowArrow}>›</Text>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <Button
            title={t.profile.logout}
            onPress={handleLogout}
            variant="outline"
          />
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: typeof import('../../constants/colors').colors) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  rowLabel: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  rowValue: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  rowArrow: {
    fontSize: fontSize.xl,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  logoutSection: {
    marginTop: spacing.xxxl,
  },
});
}
