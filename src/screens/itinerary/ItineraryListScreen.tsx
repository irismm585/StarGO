import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { fontSize, spacing } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import { getSavedItineraries, deleteItinerary } from '../../services/itinerary';
import Header from '../../components/common/Header';
import ItineraryCard from '../../components/itinerary/ItineraryCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import type { SavedItinerary } from '../../types/itinerary';

export default function ItineraryListScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      const data = await getSavedItineraries(user.id);
      setItineraries(data);
    } catch (e) {
      setError('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDelete = (id: string, title: string) => {
    Alert.alert('删除行程', `确定要删除"${title}"吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await deleteItinerary(id);
          setItineraries((prev) => prev.filter((item) => item.id !== id));
        },
      },
    ]);
  };

  if (loading) return <View style={styles.container}><Header title="我的行程" /><LoadingSpinner message="加载中..." /></View>;
  if (error) return <View style={styles.container}><Header title="我的行程" /><ErrorState message={error} onRetry={loadData} /></View>;

  return (
    <View style={styles.container}>
      <Header title="我的行程" />
      {itineraries.length === 0 ? (
        <EmptyState
          icon="🗺️"
          title="还没有行程"
          message="去规划你的第一段旅程吧！让 AI 帮你安排演出旅行的每一个细节。"
          actionLabel="开始规划"
          onAction={() => navigation.navigate('ItineraryCreate')}
        />
      ) : (
        <FlatList
          data={itineraries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ItineraryCard
              itinerary={item}
              onPress={() =>
                navigation.navigate('ItineraryDetail', {
                  itineraryData: item.itineraryData,
                  savedId: item.id,
                  title: item.title,
                })
              }
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.xl },
});
