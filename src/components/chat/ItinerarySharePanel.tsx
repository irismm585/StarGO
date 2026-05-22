import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/layout';
import type { SavedItinerary } from '../../types/itinerary';

interface ItinerarySharePanelProps {
  itineraries: SavedItinerary[];
  loading: boolean;
  onSelect: (item: SavedItinerary) => void;
  onClose: () => void;
}

export default function ItinerarySharePanel({
  itineraries,
  loading,
  onSelect,
  onClose,
}: ItinerarySharePanelProps) {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.container}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>选择要分享的行程</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : itineraries.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>还没有行程</Text>
            <Text style={styles.emptySubtext}>先去规划一段旅程吧！</Text>
          </View>
        ) : (
          <FlatList
            data={itineraries}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => onSelect(item)}
                activeOpacity={0.7}
              >
                <View style={styles.cardLeft}>
                  <Text style={styles.cardIcon}>🎫</Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.eventName}
                  </Text>
                  <Text style={styles.cardSub} numberOfLines={1}>
                    📍 {item.venueName} · {item.city}
                  </Text>
                  <Text style={styles.cardDates}>
                    📅 {item.startDate} ~ {item.endDate}
                  </Text>
                  <Text style={styles.cardBudget}>
                    💰 ¥{item.budget.toLocaleString('zh-CN')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '70%',
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  list: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardLeft: {
    marginRight: spacing.md,
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 28,
  },
  cardRight: {
    flex: 1,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardSub: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  cardDates: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  cardBudget: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
});
