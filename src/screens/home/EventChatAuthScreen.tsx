import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors as colorsLight } from '../../constants/colors';
import { useColors } from '../../contexts/ThemeContext';
import { fontSize, spacing, borderRadius } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { localizeEvent } from '../../utils/localization';
import { getOrCreateEventRoom } from '../../services/chat';
import type { HomeStackParamList } from '../../navigation/HomeStack';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type EventChatAuthRoute = RouteProp<HomeStackParamList, 'EventChatAuth'>;

export default function EventChatAuthScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<EventChatAuthRoute>();
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const event = localizeEvent(route.params.event, language);
  const [verifying, setVerifying] = useState(false);

  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const handleVerify = async () => {
    if (!user) return;
    setVerifying(true);
    try {
      // Auto-join or create the event's group chat room
      const room = await getOrCreateEventRoom(route.params.event, user.id);
      // Navigate to the chat room in the Community tab
      navigation.navigate('ChatTab', {
        screen: 'ChatRoom',
        params: {
          roomId: room.id,
          roomName: room.name,
          isEventRoom: true,
        },
      });
    } catch (e) {
      console.error('Failed to join event room:', e);
      setVerifying(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title={language === 'zh' ? '门票认证' : 'Ticket Verification'} showBack />

      <View style={styles.content}>
        {/* Ticket Card */}
        <View style={styles.ticketCard}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ticketGradient}
          >
            <Text style={styles.ticketLabel}>
              {language === 'zh' ? '电子门票' : 'E-Ticket'}
            </Text>
            <View style={styles.ticketDivider} />
            <Text style={styles.ticketEventName}>{event.eventName}</Text>
            <Text style={styles.ticketArtist}>{event.artistName}</Text>
            <View style={styles.ticketInfoRow}>
              <Text style={styles.ticketInfoIcon}>●</Text>
              <Text style={styles.ticketInfoText}>{event.venueName}</Text>
            </View>
            <View style={styles.ticketInfoRow}>
              <Text style={styles.ticketInfoIcon}>○</Text>
              <Text style={styles.ticketInfoText}>{event.city}</Text>
            </View>
            <View style={styles.ticketInfoRow}>
              <Text style={styles.ticketInfoIcon}>–</Text>
              <Text style={styles.ticketInfoText}>{event.date}</Text>
            </View>
            <View style={styles.ticketBarcode}>
              <View style={styles.barcodeLine} />
              <View style={[styles.barcodeLine, { width: 60 }]} />
              <View style={styles.barcodeLine} />
              <View style={[styles.barcodeLine, { width: 40 }]} />
              <View style={styles.barcodeLine} />
              <View style={[styles.barcodeLine, { width: 55 }]} />
              <View style={styles.barcodeLine} />
              <View style={[styles.barcodeLine, { width: 35 }]} />
              <View style={styles.barcodeLine} />
              <View style={[styles.barcodeLine, { width: 50 }]} />
            </View>
            <Text style={styles.ticketOrderNo}>
              {language === 'zh' ? '订单号: ' : 'Order: '}STARGO-{route.params.event.id.toUpperCase()}-{Date.now().toString().slice(-6)}
            </Text>
          </LinearGradient>
        </View>

        {/* Description */}
        <View style={styles.descSection}>
          <Text style={styles.descTitle}>
            {language === 'zh' ? '认证说明' : 'Verification Info'}
          </Text>
          <Text style={styles.descText}>
            {language === 'zh'
              ? '请确认以上门票信息无误。确认认证后，你将加入该活动的官方粉丝群，与其他观众交流观演心得、分享行程安排。'
              : 'Please confirm your ticket information above. After verification, you will join the official fan group for this event to share experiences and travel plans with other attendees.'}
          </Text>
        </View>

        {/* Verification status - just for display */}
        <View style={styles.statusCard}>
          <Text style={styles.statusIcon}>✓</Text>
          <View>
            <Text style={styles.statusTitle}>
              {language === 'zh' ? '该群聊为官方认证群组' : 'Officially Verified Group'}
            </Text>
            <Text style={styles.statusText}>
              {language === 'zh'
                ? '认证后可获得官方标识，与其他粉丝放心交流'
                : 'Get verified to unlock the official badge and chat with fellow fans'}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <Button
          title={language === 'zh' ? '确认认证' : 'Confirm & Enter'}
          onPress={handleVerify}
          loading={verifying}
        />
      </View>
    </View>
  );
}

function makeStyles(colors: typeof colorsLight) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    padding: spacing.xl,
  },

  // Ticket Card
  ticketCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  ticketGradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  ticketLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  ticketDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: spacing.md,
  },
  ticketEventName: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  ticketArtist: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: spacing.lg,
  },
  ticketInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    width: '100%',
  },
  ticketInfoIcon: {
    fontSize: 16,
    marginRight: spacing.md,
    color: 'rgba(255,255,255,0.6)',
  },
  ticketInfoText: {
    fontSize: fontSize.md,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  ticketBarcode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    height: 40,
  },
  barcodeLine: {
    width: 50,
    height: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  ticketOrderNo: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    marginTop: spacing.xs,
  },

  // Description
  descSection: {
    marginTop: spacing.xl,
  },
  descTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  descText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Status Card
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '30',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.verified,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 36,
    overflow: 'hidden',
  },
  statusTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  statusText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Bottom
  bottomBar: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  });
}
