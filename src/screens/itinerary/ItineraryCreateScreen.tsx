import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import { generateItinerary, saveItinerary, updateItinerary } from '../../services/itinerary';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import DatePicker from '../../components/common/DatePicker';
import PickerSelect from '../../components/common/PickerSelect';
import { getVenuesByCity } from '../../constants/venues';
import { getProvinceOptions, getCitiesByProvince, getCityPickerOptions } from '../../constants/cities';
import type { ItineraryGenerationParams, Itinerary } from '../../types/itinerary';
import type { ItineraryStackParamList } from '../../navigation/ItineraryStack';

type CreateRoute = RouteProp<ItineraryStackParamList, 'ItineraryCreate'>;

export default function ItineraryCreateScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<CreateRoute>();
  const { user } = useAuth();
  const { t, language } = useTranslation();

  const editData = route.params?.editData ?? null;
  const prefill = route.params?.prefill ?? null;
  const isEditing = !!editData;

  const [eventName, setEventName] = useState(editData?.eventName ?? prefill?.eventName ?? '');
  const [venueName, setVenueName] = useState(editData?.venueName ?? prefill?.venueName ?? '');
  const [showCustomVenue, setShowCustomVenue] = useState(
    editData ? !getVenuesByCity(editData.city).includes(editData.venueName) : false,
  );
  const [departureProvince, setDepartureProvince] = useState('');
  const [departureCity, setDepartureCity] = useState(editData?.departureCity ?? prefill?.departureCity ?? '');
  const [showCustomDeparture, setShowCustomDeparture] = useState(false);
  const [city, setCity] = useState(editData?.city ?? prefill?.city ?? '');
  const [showCustomCity, setShowCustomCity] = useState(
    editData ? !getProvinceOptions().some((o) => o.value === editData.city) && !getCitiesByProvince('__international__').some((o) => o.value === editData.city) : false,
  );
  const [eventDate, setEventDate] = useState(editData?.eventDate ?? prefill?.eventDate ?? '');
  const [startDate, setStartDate] = useState(editData?.startDate ?? prefill?.startDate ?? '');
  const [endDate, setEndDate] = useState(editData?.endDate ?? prefill?.endDate ?? '');
  const [budget, setBudget] = useState(editData ? String(editData.budget) : '');
  const [transportPref, setTransportPref] = useState(editData?.transportPref ?? '');
  const [hotelPref, setHotelPref] = useState(editData?.hotelPref ?? '');
  const [foodPref, setFoodPref] = useState(editData?.foodPref ?? '');

  // Reset form on every focus unless editing an existing saved trip
  useFocusEffect(
    useCallback(() => {
      if (isEditing) return;
      setEventName(prefill?.eventName ?? '');
      setVenueName(prefill?.venueName ?? '');
      setShowCustomVenue(false);
      setDepartureProvince('');
      setDepartureCity(prefill?.departureCity ?? '');
      setShowCustomDeparture(false);
      setCity(prefill?.city ?? '');
      setShowCustomCity(false);
      setEventDate(prefill?.eventDate ?? '');
      setStartDate(prefill?.startDate ?? '');
      setEndDate(prefill?.endDate ?? '');
      setBudget('');
      setTransportPref('');
      setHotelPref('');
      setFoodPref('');
      setError(null);
    }, [isEditing, prefill?.eventName, prefill?.venueName, prefill?.city, prefill?.eventDate, prefill?.departureCity, prefill?.startDate, prefill?.endDate])
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const venueOptions = useMemo(() => {
    const venues = getVenuesByCity(city.trim(), language);
    return [
      { label: t.itinerary.customVenueOption, value: '__custom__' },
      ...venues.map((v) => ({ label: v, value: v })),
    ];
  }, [city, language]);

  const startTimer = () => {
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const validate = (): boolean => {
    if (!eventName.trim()) { setError(t.itinerary.error.eventName); return false; }
    if (!venueName.trim()) { setError(t.itinerary.error.venue); return false; }
    if (!departureCity.trim()) { setError(t.itinerary.error.departureCity); return false; }
    if (!city.trim()) { setError(t.itinerary.error.city); return false; }
    if (!eventDate.trim()) { setError(t.itinerary.error.eventDate); return false; }
    if (!startDate.trim()) { setError(t.itinerary.error.startDate); return false; }
    if (!endDate.trim()) { setError(t.itinerary.error.endDate); return false; }
    if (!budget.trim() || isNaN(Number(budget)) || Number(budget) <= 0) {
      setError(t.itinerary.error.budget); return false;
    }

    // Date ordering validation
    const s = new Date(startDate.trim());
    const e = new Date(endDate.trim());
    const ev = new Date(eventDate.trim());

    if (isNaN(s.getTime()) || isNaN(e.getTime()) || isNaN(ev.getTime())) {
      setError(t.itinerary.error.dateFormat);
      return false;
    }

    if (s >= e) {
      setError(t.itinerary.error.startBeforeEnd);
      return false;
    }

    if (ev < s || ev > e) {
      setError(t.itinerary.error.eventDateInRange);
      return false;
    }

    return true;
  };

  const handleGenerate = async () => {
    setError(null);
    if (!validate()) return;

    const params: ItineraryGenerationParams = {
      eventName: eventName.trim(),
      venueName: venueName.trim(),
      departureCity: departureCity.trim(),
      city: city.trim(),
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      eventDate: eventDate.trim(),
      budget: Number(budget),
      transportPref: transportPref.trim() || t.itinerary.transportPlaceholder,
      hotelPref: hotelPref.trim() || '—',
      foodPref: foodPref.trim() || '—',
    };

    setIsGenerating(true);
    startTimer();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await generateItinerary(params, language, controller.signal);
      stopTimer();

      // Auto-save or update
      let savedId: string | undefined;
      if (user) {
        if (isEditing && editData) {
          await updateItinerary(editData.id, result.itineraryData, params, result.itineraryDataEn);
          savedId = editData.id;
        } else {
          const saved = await saveItinerary(user.id, result.itineraryData, params, result.itineraryDataEn);
          savedId = saved.id;
        }
      }

      navigation.replace('ItineraryDetail', {
        itineraryData: result.itineraryData,
        itineraryDataEn: result.itineraryDataEn,
        savedId,
        title: `${params.eventName} · ${params.city}`,
      });
    } catch (e: any) {
      stopTimer();
      if (e.name === 'AbortError') {
        setError(t.itinerary.error.cancelled);
      } else {
        setError(e.message || t.itinerary.error.generationFailed);
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

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}${t.itinerary.min}${sec}${t.itinerary.sec}`;
  };

  return (
    <View style={styles.container}>
      <Header title={t.itinerary.create} showBack />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Event Info — order: Event Name → Destination → Venue → Departure */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.eventDetail.info}</Text>
          <Card>
            <Input
              label={t.itinerary.eventName}
              placeholder={t.itinerary.eventNamePlaceholder}
              value={eventName}
              onChangeText={setEventName}
            />

            {/* Destination City */}
            <PickerSelect
              label={t.itinerary.destinationCity}
              options={getCityPickerOptions(language)}
              value={
                showCustomCity
                  ? '__custom_city__'
                  : getCityPickerOptions(language).some((o) => o.value === city)
                    ? city
                    : ''
              }
              onChange={(val) => {
                if (val === '__custom_city__') {
                  setShowCustomCity(true);
                  setCity('');
                  setVenueName('');
                } else {
                  setShowCustomCity(false);
                  setCity(val);
                }
              }}
              placeholder={t.itinerary.selectCity}
            />
            {showCustomCity && (
              <Input
                label={t.itinerary.customCity}
                placeholder={t.itinerary.customCityPlaceholder}
                value={city}
                onChangeText={(text) => {
                  setCity(text);
                  const venues = getVenuesByCity(text.trim(), language);
                  if (!showCustomVenue && venueName && !venues.includes(venueName)) {
                    setVenueName('');
                  }
                }}
              />
            )}

            {/* Venue */}
            <PickerSelect
              label={t.itinerary.venue}
              options={venueOptions}
              value={
                showCustomVenue
                  ? '__custom__'
                  : venueOptions.some((o) => o.value === venueName)
                    ? venueName
                    : ''
              }
              onChange={(val) => {
                if (val === '__custom__') {
                  setShowCustomVenue(true);
                  setVenueName('');
                } else {
                  setShowCustomVenue(false);
                  setVenueName(val);
                }
              }}
              placeholder={city.trim() ? t.itinerary.selectVenue : t.itinerary.inputVenueFirst}
            />
            {showCustomVenue && (
              <Input
                label={t.itinerary.customVenue}
                placeholder={t.itinerary.customVenuePlaceholder}
                value={venueName}
                onChangeText={setVenueName}
              />
            )}

            {/* Departure Province & City */}
            <PickerSelect
              label={t.itinerary.departureProvince}
              options={getProvinceOptions(language)}
              value={departureProvince}
              onChange={(val) => {
                if (val === '__custom_province__') {
                  setShowCustomDeparture(true);
                  setDepartureProvince('');
                  setDepartureCity('');
                } else {
                  setDepartureProvince(val);
                  setDepartureCity('');
                }
              }}
              placeholder={t.itinerary.selectDepartureProvince}
            />
            {departureProvince && departureProvince !== '__custom_province__' && (
              <PickerSelect
                label={t.itinerary.departureCity}
                options={getCitiesByProvince(departureProvince, language)}
                value={
                  getCitiesByProvince(departureProvince, language).some((o) => o.value === departureCity)
                    ? departureCity
                    : ''
                }
                onChange={(val) => {
                  setDepartureCity(val);
                }}
                placeholder={t.itinerary.departureCityPlaceholder}
              />
            )}
            {showCustomDeparture && (
              <Input
                label={t.itinerary.customDepartureCity}
                placeholder={t.itinerary.customDepartureCity}
                value={departureCity}
                onChangeText={setDepartureCity}
              />
            )}
          </Card>
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.itinerary.dateSection}</Text>
          <Card>
            <DatePicker
              label={t.itinerary.eventDate}
              value={eventDate}
              onChange={setEventDate}
            />
            <DatePicker
              label={t.itinerary.startDate}
              value={startDate}
              onChange={setStartDate}
            />
            <DatePicker
              label={t.itinerary.endDate}
              value={endDate}
              onChange={setEndDate}
            />
          </Card>
        </View>

        {/* Budget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.itinerary.budgetSection}</Text>
          <Card>
            <Input
              label={t.itinerary.budget}
              placeholder={t.itinerary.budgetPlaceholder}
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
            />
          </Card>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.itinerary.prefSection}</Text>
          <Card>
            <Input
              label={t.itinerary.transportPref}
              placeholder={t.itinerary.transportPlaceholder}
              value={transportPref}
              onChangeText={setTransportPref}
            />
            <Input
              label={t.itinerary.hotelPref}
              placeholder={t.itinerary.hotelPlaceholder}
              value={hotelPref}
              onChangeText={setHotelPref}
            />
            <Input
              label={t.itinerary.foodPref}
              placeholder={t.itinerary.foodPlaceholder}
              value={foodPref}
              onChangeText={setFoodPref}
            />
          </Card>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Generate Button */}
        <View style={styles.generateSection}>
          <Button
            title={isEditing ? t.itinerary.update : t.itinerary.generate}
            onPress={handleGenerate}
            loading={isGenerating}
          />
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {isGenerating && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <Text style={styles.overlayIcon}>◇</Text>
            <Text style={styles.overlayTitle}>{t.itinerary.generating}</Text>
            <Text style={styles.overlayTimer}>{t.itinerary.elapsed} {formatTime(elapsed)}</Text>
            <View style={styles.overlayProgress}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(elapsed * 5, 90)}%` }]} />
              </View>
            </View>
            <Button
              title={t.itinerary.cancel}
              onPress={handleCancel}
              variant="outline"
              fullWidth={false}
              style={styles.cancelButton}
            />
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
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  errorBanner: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
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
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  overlayTimer: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  overlayProgress: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  cancelButton: {
    minWidth: 140,
  },
});
