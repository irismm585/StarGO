import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors as colorsLight } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import { useColors } from '../../contexts/ThemeContext';
import { useTranslation } from '../../contexts/LanguageContext';
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
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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
      setError(t.itinerary.listLoadError);
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
    Alert.alert(t.itinerary.detailDelete, `${t.itinerary.listDeleteConfirm}"${title}"？`, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteItinerary(id);
            await loadData();
          } catch (e) {
            console.error('Delete failed:', e);
          }
        },
      },
    ]);
  };

  if (loading) return <View style={styles.container}><Header title={t.itinerary.list} /><LoadingSpinner message={t.common.loading} /></View>;
  if (error) return <View style={styles.container}><Header title={t.itinerary.list} /><ErrorState message={error} onRetry={loadData} /></View>;

  return (
    <View style={styles.container}>
      <Header title={t.itinerary.list} />
      {itineraries.length === 0 ? (
        <EmptyState
          icon="→"
          title={t.itinerary.listEmptyTitle}
          message={t.itinerary.listEmptyDesc}
          actionLabel={t.itinerary.listEmptyAction}
          onAction={() => navigation.navigate('ItineraryCreate')}
        />
      ) : (
        <FlatList
          data={itineraries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('ItineraryCreate')}
              activeOpacity={0.7}
            >
              <Text style={styles.createButtonText}>+ {t.itinerary.create}</Text>
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <View style={styles.cardContent}>
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
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id, item.title)}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

function makeStyles(colors: typeof colorsLight) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.xl },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  cardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardContent: { flex: 1 },
  deleteBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  deleteBtnText: {
    fontSize: 18,
    color: colors.error,
    fontWeight: '700',
  },
});
}
