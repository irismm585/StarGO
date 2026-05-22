import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import { deleteItinerary, getItineraryById } from '../../services/itinerary';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ItineraryTimeline from '../../components/itinerary/ItineraryTimeline';
import BudgetBreakdown from '../../components/itinerary/BudgetBreakdown';
import type { ItineraryStackParamList } from '../../navigation/ItineraryStack';

type DetailRoute = RouteProp<ItineraryStackParamList, 'ItineraryDetail'>;

export default function ItineraryDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<DetailRoute>();
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const { itineraryData, itineraryDataEn, savedId, title } = route.params;
  const data = language === 'en' && itineraryDataEn ? itineraryDataEn : itineraryData;

  const handleEdit = async () => {
    if (!savedId) return;
    try {
      const saved = await getItineraryById(savedId);
      if (saved) {
        navigation.navigate('ItineraryCreate', { editData: saved });
      }
    } catch {
      Alert.alert(t.common.loading, t.itinerary.detailLoadError);
    }
  };

  const handleDelete = () => {
    if (!savedId) return;
    Alert.alert(
      t.itinerary.detailDelete,
      t.itinerary.detailDeleteConfirm,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItinerary(savedId);
              navigation.goBack();
            } catch {
              Alert.alert(t.common.loading, t.itinerary.error.generationFailed);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Header title={title || t.itinerary.detail} showBack />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Card */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.overviewCard}
        >
          <Text style={styles.overviewText}>{data.overview}</Text>
        </LinearGradient>

        {/* Daily Schedule Timeline */}
        <View style={styles.section}>
          <ItineraryTimeline days={data.days} title={t.itinerary.detail} />
        </View>

        {/* Transport */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.itinerary.detailTransport}</Text>
          <Card>
            <View style={styles.transportItem}>
              <Text style={styles.transportLabel}>→ {t.itinerary.detailTransportTo}</Text>
              <Text style={styles.transportDetail}>{data.transport.to}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.transportItem}>
              <Text style={styles.transportLabel}>· {t.itinerary.detailTransportLocal}</Text>
              <Text style={styles.transportDetail}>{data.transport.local}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.transportItem}>
              <Text style={styles.transportLabel}>→ {t.itinerary.detailTransportBack}</Text>
              <Text style={styles.transportDetail}>{data.transport.back}</Text>
            </View>
          </Card>
        </View>

        {/* Hotel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.itinerary.detailHotel}</Text>
          {data.hotel.map((h, idx) => (
            <Card key={idx} style={styles.hotelCard}>
              <Text style={styles.hotelName}>{h.name}</Text>
              <Text style={styles.hotelAddress}>{h.address}</Text>
              <View style={styles.hotelRow}>
                <Text style={styles.hotelPrice}>{h.price}</Text>
                <Text style={styles.hotelReason}>{h.reason}</Text>
              </View>
            </Card>
          ))}
        </View>

        {/* Food */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.itinerary.detailFood}</Text>
          {data.food.map((f, idx) => (
            <Card key={idx} style={styles.foodCard}>
              <Text style={styles.foodName}>{f.name}</Text>
              <Text style={styles.foodAddress}>{f.address}</Text>
              <Text style={styles.foodRecommend}>{f.recommendation}</Text>
            </Card>
          ))}
        </View>

        {/* Venue Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.itinerary.detailVenueTips}</Text>
          <Card>
            {data.venueTips.map((tip, idx) => (
              <View key={idx} style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Budget */}
        <View style={styles.section}>
          <BudgetBreakdown budget={data.budget} title={t.itinerary.budgetSection} totalLabel={language === 'zh' ? '总计：' : 'Total: '} />
        </View>

        {/* Notes */}
        {data.notes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.itinerary.detailReminders}</Text>
            <Card>
              {data.notes.map((note, idx) => (
                <View key={idx} style={styles.tipItem}>
                  <Text style={styles.tipBullet}>!</Text>
                  <Text style={styles.tipText}>{note}</Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Edit / Delete Actions */}
        {savedId && (
          <View style={styles.actionRow}>
            <Button
              title={t.itinerary.detailEdit}
              onPress={handleEdit}
              variant="outline"
              fullWidth={false}
              style={styles.actionButton}
            />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteButtonText}>{t.itinerary.detailDelete}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxl },
  overviewCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
    padding: spacing.xl,
    borderRadius: borderRadius.xxl,
  },
  overviewText: {
    fontSize: fontSize.md,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  transportItem: {
    marginBottom: spacing.sm,
  },
  transportLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  transportDetail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  hotelCard: {
    marginBottom: spacing.md,
  },
  hotelName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  hotelAddress: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  hotelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  hotelPrice: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primary,
  },
  hotelReason: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
    marginLeft: spacing.md,
  },
  foodCard: {
    marginBottom: spacing.md,
  },
  foodName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  foodAddress: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  foodRecommend: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
    height: 52,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.error,
    backgroundColor: colors.surface,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  tipBullet: {
    fontSize: fontSize.md,
    color: colors.primary,
  },
  tipText: {
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
});
