import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.displayName}>{user.displayName}</Text>
        <Text style={styles.username}>@{user.username}</Text>
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>--</Text>
          <Text style={styles.statLabel}>行程</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>--</Text>
          <Text style={styles.statLabel}>社区</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>--</Text>
          <Text style={styles.statLabel}>纪念</Text>
        </View>
      </View>

      {/* Verification */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>认证</Text>
        <View style={styles.verificationCard}>
          {user.isVerified ? (
            <>
              <Text style={styles.verifiedIcon}>✅</Text>
              <View>
                <Text style={styles.verifiedTitle}>已认证粉丝</Text>
                <Text style={styles.verifiedDesc}>你的身份已通过认证</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.verifiedIcon}>⭐</Text>
              <View>
                <Text style={styles.verifiedTitle}>粉丝认证</Text>
                <Text style={styles.verifiedDesc}>认证后加入专属粉丝群</Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Favorite Artists */}
      {user.favoriteArtists && user.favoriteArtists.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>喜爱的艺人</Text>
          <View style={styles.artistRow}>
            {user.favoriteArtists.map((artist, idx) => (
              <View key={idx} style={styles.artistChip}>
                <Text style={styles.artistText}>{artist}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Settings Button */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.settingsIcon}>⚙️</Text>
        <Text style={styles.settingsText}>设置</Text>
        <Text style={styles.settingsArrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  displayName: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  username: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.sm,
  },
  bio: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    paddingHorizontal: spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    marginTop: -24,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.border },
  section: { paddingHorizontal: spacing.xl, marginTop: spacing.xxl },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  verificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  verifiedIcon: { fontSize: 28 },
  verifiedTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  verifiedDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  artistRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  artistChip: {
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  artistText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    marginTop: spacing.xxl,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingsIcon: { fontSize: 20, marginRight: spacing.md },
  settingsText: { flex: 1, fontSize: fontSize.md, color: colors.text },
  settingsArrow: { fontSize: 24, color: colors.textMuted },
});
