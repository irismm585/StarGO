import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import { generateContent } from '../../services/memorial';
import { getSavedItineraries } from '../../services/itinerary';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import TemplateSelector from '../../components/memorial/TemplateSelector';
import { formatDate, formatDateRange } from '../../utils/formatters';
import type { MemorialTemplate, MemorialGenerationParams } from '../../types/memorial';
import type { SavedItinerary } from '../../types/itinerary';

const MOODS = ['兴奋', '怀念', '感激', '充满能量', ' bittersweet'];

export default function MemorialGeneratorScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [eventName, setEventName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [venueName, setVenueName] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [template, setTemplate] = useState<MemorialTemplate>('concert_recap');
  const [mood, setMood] = useState('');
  const [highlights, setHighlights] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [importableItineraries, setImportableItineraries] = useState<SavedItinerary[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        getSavedItineraries(user.id).then(setImportableItineraries).catch(() => {});
      }
    }, [user]),
  );

  const handleImportFromItinerary = (saved: SavedItinerary) => {
    setEventName(saved.eventName);
    setVenueName(saved.venueName);
    setCity(saved.city);
    setDate(saved.eventDate);
    setShowImportModal(false);
  };

  const validate = (): boolean => {
    if (!eventName.trim()) { setError('请输入演出名称'); return false; }
    if (!venueName.trim()) { setError('请输入场馆名称'); return false; }
    if (!city.trim()) { setError('请输入城市'); return false; }
    if (!date.trim()) { setError('请输入日期'); return false; }
    return true;
  };

  const handleGenerate = async () => {
    setError(null);
    if (!validate()) return;

    const params: MemorialGenerationParams = {
      eventName: eventName.trim(),
      artistName: artistName.trim() || undefined,
      venueName: venueName.trim(),
      city: city.trim(),
      date: date.trim(),
      template,
      mood: mood || undefined,
      personalHighlights: highlights.trim() || undefined,
    };

    setIsGenerating(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await generateContent(params, controller.signal);
      navigation.navigate('MemorialPreview', { content: result });
    } catch (e: any) {
      if (e.name === 'AbortError') {
        setError('已取消生成');
      } else {
        setError(e.message || '生成失败，请重试');
      }
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  };

  return (
    <View style={styles.container}>
      <Header title="生成纪念" showBack />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Import from Itinerary */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.importButton}
            onPress={() => setShowImportModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.importIcon}>📋</Text>
            <Text style={styles.importText}>从已有行程导入</Text>
            <Text style={styles.importArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Event Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>演出信息</Text>
          <Card>
            <Input label="演出名称" placeholder="例：Taylor Swift 演唱会" value={eventName} onChangeText={setEventName} />
            <Input label="艺人（选填）" placeholder="例：Taylor Swift" value={artistName} onChangeText={setArtistName} />
            <Input label="场馆" placeholder="例：东京巨蛋" value={venueName} onChangeText={setVenueName} />
            <Input label="城市" placeholder="例：东京" value={city} onChangeText={setCity} />
            <Input label="日期" placeholder="YYYY-MM-DD" value={date} onChangeText={setDate} autoCapitalize="none" />
          </Card>
        </View>

        {/* Template */}
        <View style={styles.section}>
          <TemplateSelector selected={template} onSelect={setTemplate} />
        </View>

        {/* Mood */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>心情</Text>
          <Card>
            <View style={styles.moodRow}>
              {MOODS.map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setMood(m)}
                  style={[styles.moodChip, mood === m && styles.moodChipActive]}
                >
                  <Text style={[styles.moodText, mood === m && styles.moodTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>

        {/* Highlights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>个人亮点</Text>
          <Card>
            <Input
              label="最难忘的瞬间"
              placeholder="分享你的精彩时刻..."
              value={highlights}
              onChangeText={setHighlights}
              multiline
            />
          </Card>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Generate */}
        <View style={styles.generateSection}>
          <Button
            title="AI 生成纪念内容"
            onPress={handleGenerate}
            loading={isGenerating}
          />
        </View>
      </ScrollView>

      {/* Import Itinerary Modal */}
      <Modal
        visible={showImportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowImportModal(false)}>
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>选择行程</Text>
              <View style={{ width: 44 }} />
            </View>

            {importableItineraries.length === 0 ? (
              <View style={styles.emptyModal}>
                <Text style={styles.emptyModalText}>暂无已保存的行程</Text>
              </View>
            ) : (
              <FlatList
                data={importableItineraries}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.modalList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.itineraryItem}
                    onPress={() => handleImportFromItinerary(item)}
                  >
                    <Text style={styles.itineraryItemTitle}>{item.title}</Text>
                    <Text style={styles.itineraryItemSubtitle}>
                      {item.venueName} · {formatDate(item.startDate)} - {formatDate(item.endDate)}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {isGenerating && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <Text style={styles.overlayIcon}>✨</Text>
            <Text style={styles.overlayTitle}>StarGo AI 正在书写你的故事...</Text>
            <Button title="取消" onPress={handleCancel} variant="outline" fullWidth={false} style={styles.cancelBtn} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxl },
  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  moodChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moodChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  moodText: { fontSize: fontSize.sm, color: colors.textSecondary },
  moodTextActive: { color: '#FFFFFF', fontWeight: '600' },
  errorBanner: {
    marginHorizontal: spacing.xl,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: { color: colors.error, fontSize: fontSize.sm, textAlign: 'center' },
  generateSection: { paddingHorizontal: spacing.xl, marginTop: spacing.md },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  overlayContent: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xxl,
    marginHorizontal: spacing.xl,
    alignItems: 'center',
  },
  overlayIcon: { fontSize: 48, marginBottom: spacing.lg },
  overlayTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  cancelBtn: { minWidth: 120 },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary + '30',
    borderStyle: 'dashed',
  },
  importIcon: { fontSize: 20, marginRight: spacing.md },
  importText: { flex: 1, fontSize: fontSize.md, fontWeight: '600', color: colors.primary },
  importArrow: { fontSize: 24, color: colors.primary },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.xl,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  modalCancelText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  modalList: {
    padding: spacing.lg,
  },
  emptyModal: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyModalText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  itineraryItem: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    marginBottom: spacing.sm,
  },
  itineraryItemTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itineraryItemSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
