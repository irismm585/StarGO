import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { validateEmail, validatePassword } from '../../utils/validation';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, error, clearError, isLoading } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLocalError(null);
    clearError();

    const emailError = validateEmail(email);
    if (emailError) { setLocalError(emailError); return; }

    const pwError = validatePassword(password);
    if (pwError) { setLocalError(pwError); return; }

    try {
      await login({ email: email.trim(), password });
    } catch {
      // error is set in AuthContext
    }
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.logo}>StarGo</Text>
          <Text style={styles.tagline}>{t.auth.tagline}</Text>
        </LinearGradient>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.welcomeText}>{t.auth.loginTitle}</Text>
          <Text style={styles.subtitle}>{t.auth.loginSubtitle}</Text>

          {displayError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          )}

          <Input
            label={t.auth.email}
            placeholder={t.auth.emailPlaceholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label={t.auth.password}
            placeholder={t.auth.passwordPlaceholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title={t.auth.login}
            onPress={handleLogin}
            loading={isLoading}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Register' as never)}
            style={styles.switchButton}
          >
            <Text style={styles.switchText}>
              {t.auth.noAccount}
              <Text style={styles.switchLink}>{t.auth.registerNow}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  header: {
    paddingTop: 80,
    paddingBottom: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  logo: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.sm,
  },
  formCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    marginTop: -30,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#9578C8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 8,
  },
  welcomeText: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  errorBanner: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  switchButton: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  switchText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  switchLink: {
    color: colors.primary,
    fontWeight: '700',
  },
});
