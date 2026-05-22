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
  const { itineraryData, savedId, title } = route.params;
  const data = itineraryData;
  const { user } = useAuth();

  const handleEdit = async () => {
    if (!savedId) return;
    try {
      const saved = await getItineraryById(savedId);
      if (saved) {
        navigation.navigate('ItineraryCreate', { editData: saved });
      }
    } catch {
      Alert.alert('错误', '无法加载行程数据');
    }
  };

  const handleDelete = () => {
    if (!savedId) return;
    Alert.alert(
      '删除行程',
      '确定要删除此行程吗？此操作不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItinerary(savedId);
              navigation.goBack();
            } catch {
              Alert.alert('错误', '删除失败，请重试');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Header title={title || '行程详情'} showBack />

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
          <ItineraryTimeline days={data.days} />
        </View>

        {/* Transport */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>交通</Text>
          <Card>
            <View style={styles.transportItem}>
              <Text style={styles.transportLabel}>🚄 去程</Text>
              <Text style={styles.transportDetail}>{data.transport.to}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.transportItem}>
              <Text style={styles.transportLabel}>🚌 当地</Text>
              <Text style={styles.transportDetail}>{data.transport.local}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.transportItem}>
              <Text style={styles.transportLabel}>🚄 返程</Text>
              <Text style={styles.transportDetail}>{data.transport.back}</Text>
            </View>
          </Card>
        </View>

        {/* Hotel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>住宿</Text>
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
          <Text style={styles.sectionTitle}>美食</Text>
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
          <Text style={styles.sectionTitle}>场馆贴士</Text>
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
          <BudgetBreakdown budget={data.budget} />
        </View>

        {/* Notes */}
        {data.notes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>重要提醒</Text>
            <Card>
              {data.notes.map((note, idx) => (
                <View key={idx} style={styles.tipItem}>
                  <Text style={styles.tipBullet}>⚠️</Text>
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
              title="编辑行程"
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
              <Text style={styles.deleteButtonText}>删除行程</Text>
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
    borderRadius: 20,
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
    borderRadius: 26,
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
