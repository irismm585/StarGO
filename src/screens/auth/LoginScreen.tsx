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
import { fontSize, spacing } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { validateEmail, validatePassword } from '../../utils/validation';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, error, clearError, isLoading } = useAuth();

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
          <Text style={styles.tagline}>AI 驱动的演出旅行</Text>
        </LinearGradient>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.welcomeText}>欢迎回来</Text>
          <Text style={styles.subtitle}>登录以继续你的旅程</Text>

          {displayError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          )}

          <Input
            label="邮箱"
            placeholder="请输入邮箱地址"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="密码"
            placeholder="请输入密码"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title="登录"
            onPress={handleLogin}
            loading={isLoading}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Register' as never)}
            style={styles.switchButton}
          >
            <Text style={styles.switchText}>
              还没有账号？
              <Text style={styles.switchLink}>立即注册</Text>
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
    borderRadius: 24,
    padding: spacing.xxl,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
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
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
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
