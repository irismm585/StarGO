import React, { useState, useRef, useCallback, useMemo } from 'react';
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
import { colors as colorsLight } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import { useColors } from '../../contexts/ThemeContext';
import { generateContent } from '../../services/memorial';
import { getSavedItineraries } from '../../services/itinerary';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import DatePicker from '../../components/common/DatePicker';
import TemplateSelector from '../../components/memorial/TemplateSelector';
import { formatDate, formatDateRange } from '../../utils/formatters';
import type { MemorialTemplate, MemorialGenerationParams } from '../../types/memorial';
import type { SavedItinerary } from '../../types/itinerary';

export default function MemorialGeneratorScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const moods = [t.memorial.moodExcited, t.memorial.moodNostalgic, t.memorial.moodGrateful, t.memorial.moodEnergetic, t.memorial.moodBittersweet];

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
    if (!eventName.trim()) { setError(t.memorial.error.eventName); return false; }
    if (!venueName.trim()) { setError(t.memorial.error.venueName); return false; }
    if (!city.trim()) { setError(t.memorial.error.city); return false; }
    if (!date.trim()) { setError(t.memorial.error.date); return false; }
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
      navigation.navigate('MemorialPreview', { content: result.content, contentEn: result.contentEn });
    } catch (e: any) {
      if (e.name === 'AbortError') {
        setError(t.memorial.error.cancelled);
      } else {
        setError(e.message || t.memorial.error.generationFailed);
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
      <Header title={t.memorial.header} showBack />

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
            <Text style={styles.importIcon}>←</Text>
            <Text style={styles.importText}>{t.memorial.importText}</Text>
            <Text style={styles.importArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Event Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.memorial.eventInfo}</Text>
          <Card>
            <Input label={t.memorial.eventName} placeholder={t.memorial.placeholder.eventName} value={eventName} onChangeText={setEventName} />
            <Input label={t.memorial.artistName} placeholder={t.memorial.placeholder.artistName} value={artistName} onChangeText={setArtistName} />
            <Input label={t.memorial.venueName} placeholder={t.memorial.placeholder.venueName} value={venueName} onChangeText={setVenueName} />
            <Input label={t.memorial.city} placeholder={t.memorial.placeholder.city} value={city} onChangeText={setCity} />
            <DatePicker label={t.memorial.date} value={date} onChange={setDate} />
          </Card>
        </View>

        {/* Template */}
        <View style={styles.section}>
          <TemplateSelector selected={template} onSelect={setTemplate} />
        </View>

        {/* Mood */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.memorial.moods}</Text>
          <Card>
            <View style={styles.moodRow}>
              {moods.map((m) => (
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
          <Text style={styles.sectionTitle}>{t.memorial.highlights}</Text>
          <Card>
            <Input
              label={t.memorial.highlightLabel}
              placeholder={t.memorial.highlightPlaceholder}
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
            title={t.memorial.generate}
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
                <Text style={styles.modalCancelText}>{t.common.cancel}</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{t.memorial.selectTrip}</Text>
              <View style={{ width: 44 }} />
            </View>

            {importableItineraries.length === 0 ? (
              <View style={styles.emptyModal}>
                <Text style={styles.emptyModalText}>{t.memorial.noSavedTrips}</Text>
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
            <Text style={styles.overlayIcon}>◇</Text>
            <Text style={styles.overlayTitle}>{t.memorial.generating}</Text>
            <Button title={t.memorial.cancel} onPress={handleCancel} variant="outline" fullWidth={false} style={styles.cancelBtn} />
          </View>
        </View>
      )}
    </View>
  );
}

function makeStyles(colors: typeof colorsLight) {
  return StyleSheet.create({
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
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
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    marginHorizontal: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#9578C8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
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
    borderColor: colors.primary,
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
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.xl,
    maxHeight: '60%',
    shadowColor: '#9578C8',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 10,
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
}
