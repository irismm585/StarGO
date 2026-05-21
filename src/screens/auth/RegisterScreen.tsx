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
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from '../../utils/validation';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register, error, isLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleRegister = async () => {
    setLocalError(null);

    const usernameError = validateUsername(username);
    if (usernameError) { setLocalError(usernameError); return; }

    const emailError = validateEmail(email);
    if (emailError) { setLocalError(emailError); return; }

    const pwError = validatePassword(password);
    if (pwError) { setLocalError(pwError); return; }

    if (password !== confirmPassword) {
      setLocalError('两次密码输入不一致');
      return;
    }

    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        displayName: displayName.trim() || username.trim(),
      });
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
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.logo}>StarGo</Text>
          <Text style={styles.tagline}>加入粉丝社区</Text>
        </LinearGradient>

        <View style={styles.formCard}>
          <Text style={styles.welcomeText}>创建账号</Text>
          <Text style={styles.subtitle}>开启你的AI演出旅行体验</Text>

          {displayError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          )}

          <Input
            label="用户名"
            placeholder="取个名字吧"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <Input
            label="昵称（选填）"
            placeholder="你的显示名称"
            value={displayName}
            onChangeText={setDisplayName}
          />

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
            placeholder="至少6位字符"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Input
            label="确认密码"
            placeholder="再次输入密码"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Button
            title="注册"
            onPress={handleRegister}
            loading={isLoading}
          />

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.switchButton}
          >
            <Text style={styles.switchText}>
              已有账号？
              <Text style={styles.switchLink}>立即登录</Text>
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
