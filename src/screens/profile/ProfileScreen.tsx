import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius, shadow } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import { getSavedItineraries } from '../../services/itinerary';
import { getSavedMemorials } from '../../services/memorial';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [tripCount, setTripCount] = useState(0);
  const [memorialCount, setMemorialCount] = useState(0);

  const loadStats = useCallback(async () => {
    if (!user) return;
    try {
      const trips = await getSavedItineraries(user.id);
      setTripCount(trips.length);
      const memorials = await getSavedMemorials(user.id);
      setMemorialCount(memorials.length);
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

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
        <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('ItineraryTab')}>
          <Text style={styles.statValue}>{tripCount}</Text>
          <Text style={styles.statLabel}>{t.profile.statTrips}</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('ChatTab')}>
          <Text style={styles.statValue}>--</Text>
          <Text style={styles.statLabel}>{t.profile.statCommunity}</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('MemorialTab')}>
          <Text style={styles.statValue}>{memorialCount}</Text>
          <Text style={styles.statLabel}>{t.profile.statMemorials}</Text>
        </TouchableOpacity>
      </View>

      {/* Verification */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.profile.verification}</Text>
        <View style={styles.verificationCard}>
          {user.isVerified ? (
            <>
              <Text style={styles.verifiedIcon}>✓</Text>
              <View>
                <Text style={styles.verifiedTitle}>{t.profile.verified}</Text>
                <Text style={styles.verifiedDesc}>{t.profile.verifiedDesc}</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.verifiedIcon}>☆</Text>
              <View>
                <Text style={styles.verifiedTitle}>{t.profile.verifyTitle}</Text>
                <Text style={styles.verifiedDesc}>{t.profile.verifyDesc}</Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Favorite Artists */}
      {user.favoriteArtists && user.favoriteArtists.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.profile.favoriteArtists}</Text>
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
        <Text style={styles.settingsIcon}>—</Text>
        <Text style={styles.settingsText}>{t.profile.settings}</Text>
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
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
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
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#9578C8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
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
    borderColor: colors.borderLight,
    gap: spacing.md,
    ...shadow.card,
  },
  verifiedIcon: {
    fontSize: 28,
    color: colors.verified,
  },
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
    marginBottom: spacing.xxxl,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.card,
  },
  settingsIcon: { fontSize: 20, marginRight: spacing.md },
  settingsText: { flex: 1, fontSize: fontSize.md, color: colors.text },
  settingsArrow: { fontSize: 24, color: colors.textMuted },
});
