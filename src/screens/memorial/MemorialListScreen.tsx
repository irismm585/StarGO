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
import { useTranslation } from '../../contexts/LanguageContext';
import { useColors } from '../../contexts/ThemeContext';
import { getSavedMemorials, deleteMemorial } from '../../services/memorial';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import type { SavedMemorial } from '../../types/memorial';

export default function MemorialListScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [memorials, setMemorials] = useState<SavedMemorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      const data = await getSavedMemorials(user.id);
      setMemorials(data);
    } catch (e) {
      setError(t.memorial.listLoadError);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDelete = (id: string, eventName: string) => {
    Alert.alert(t.common.delete, `${t.memorial.listDeleteConfirm}"${eventName}"？`, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMemorial(id);
            await loadData();
          } catch (e) {
            console.error('Delete failed:', e);
          }
        },
      },
    ]);
  };

  if (loading) return <View style={styles.container}><Header title={t.memorial.title} /><LoadingSpinner message={t.common.loading} /></View>;
  if (error) return <View style={styles.container}><Header title={t.memorial.title} /><ErrorState message={error} onRetry={loadData} /></View>;

  return (
    <View style={styles.container}>
      <Header title={t.memorial.title} />
      {memorials.length === 0 ? (
        <EmptyState
          icon="◇"
          title={t.memorial.listEmpty}
          message={t.memorial.listEmptyDesc}
          actionLabel={t.memorial.listEmptyAction}
          onAction={() => navigation.navigate('MemorialGenerator')}
        />
      ) : (
        <FlatList
          data={memorials}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('MemorialGenerator')}
              activeOpacity={0.7}
            >
              <Text style={styles.createButtonText}>+ {t.memorial.header}</Text>
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <View style={styles.cardContent}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('MemorialPreview', { content: item.content, contentEn: item.contentEn })
                  }
                  activeOpacity={0.85}
                >
                  <Card glass>
                    <Text style={styles.eventName}>{item.eventName}</Text>
                    <Text style={styles.dateText}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </Card>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id, item.eventName)}
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
  eventName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dateText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
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
