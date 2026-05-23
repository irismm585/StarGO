import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  Modal,
  TouchableOpacity,
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
  const { t, language } = useTranslation();

  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');

  const handleShowTerms = () => {
    setModalTitle(t.profile.termsTitle);
    setModalContent(t.profile.termsContent);
    setModalVisible(true);
  };

  const handleShowPrivacy = () => {
    setModalTitle(t.profile.privacyTitle);
    setModalContent(t.profile.privacyContent);
    setModalVisible(true);
  };

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
          <TouchableOpacity style={styles.row} onPress={handleShowTerms} activeOpacity={0.7}>
            <Text style={styles.rowLabel}>{t.profile.termsTitle}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={handleShowPrivacy} activeOpacity={0.7}>
            <Text style={styles.rowLabel}>{t.profile.privacyTitle}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
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

      {/* Terms / Privacy Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalText}>{modalContent}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseText}>{t.common.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  modalCloseButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
}
