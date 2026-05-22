import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
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

  const [isGenerating, setIsGenerating] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const venueOptions = useMemo(() => {
    const venues = getVenuesByCity(city.trim());
    return [
      { label: '自行输入...', value: '__custom__' },
      ...venues.map((v) => ({ label: v, value: v })),
    ];
  }, [city]);

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
    if (!eventName.trim()) { setError('请输入演出名称'); return false; }
    if (!venueName.trim()) { setError('请选择或输入场馆'); return false; }
    if (!departureCity.trim()) { setError('请选择或输入出发城市'); return false; }
    if (!city.trim()) { setError('请选择目的地城市'); return false; }
    if (!eventDate.trim()) { setError('请选择演出日期'); return false; }
    if (!startDate.trim()) { setError('请选择出发日期'); return false; }
    if (!endDate.trim()) { setError('请选择结束日期'); return false; }
    if (!budget.trim() || isNaN(Number(budget)) || Number(budget) <= 0) {
      setError('请输入有效预算'); return false;
    }

    // Date ordering validation
    const s = new Date(startDate.trim());
    const e = new Date(endDate.trim());
    const ev = new Date(eventDate.trim());

    if (isNaN(s.getTime()) || isNaN(e.getTime()) || isNaN(ev.getTime())) {
      setError('日期格式无效，请使用 YYYY-MM-DD 格式');
      return false;
    }

    if (s >= e) {
      setError('出发日期必须在返程日期之前');
      return false;
    }

    if (ev < s || ev > e) {
      setError('演出日期必须在出发日期和返程日期之间');
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
      transportPref: transportPref.trim() || '无特殊要求',
      hotelPref: hotelPref.trim() || '无特殊要求',
      foodPref: foodPref.trim() || '无特殊要求',
    };

    setIsGenerating(true);
    startTimer();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await generateItinerary(params, controller.signal);
      stopTimer();

      // Auto-save or update
      let savedId: string | undefined;
      if (user) {
        if (isEditing && editData) {
          await updateItinerary(editData.id, result, params);
          savedId = editData.id;
        } else {
          const saved = await saveItinerary(user.id, result, params);
          savedId = saved.id;
        }
      }

      navigation.replace('ItineraryDetail', {
        itineraryData: result,
        savedId,
        title: `${params.eventName} · ${params.city}`,
      });
    } catch (e: any) {
      stopTimer();
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

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}分${sec}秒`;
  };

  return (
    <View style={styles.container}>
      <Header title="规划行程" showBack />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Event Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>演出信息</Text>
          <Card>
            <Input
              label="演出名称"
              placeholder="例：Taylor Swift 时代巡演"
              value={eventName}
              onChangeText={setEventName}
            />
            <PickerSelect
              label="场馆"
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
              placeholder={city.trim() ? '请选择场馆' : '请先输入目的地城市'}
            />
            {showCustomVenue && (
              <Input
                label="自行输入场馆"
                placeholder="输入场馆名称"
                value={venueName}
                onChangeText={setVenueName}
              />
            )}
            <PickerSelect
              label="出发省份"
              options={getProvinceOptions()}
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
              placeholder="选择出发省份"
            />
            {departureProvince && departureProvince !== '__custom_province__' && (
              <PickerSelect
                label="出发城市"
                options={getCitiesByProvince(departureProvince)}
                value={
                  getCitiesByProvince(departureProvince).some((o) => o.value === departureCity)
                    ? departureCity
                    : ''
                }
                onChange={(val) => {
                  setDepartureCity(val);
                }}
                placeholder="选择出发城市"
              />
            )}
            {showCustomDeparture && (
              <Input
                label="自行输入出发城市"
                placeholder="输入城市名称"
                value={departureCity}
                onChangeText={setDepartureCity}
              />
            )}
            <PickerSelect
              label="目的地城市"
              options={getCityPickerOptions()}
              value={
                showCustomCity
                  ? '__custom_city__'
                  : getCityPickerOptions().some((o) => o.value === city)
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
              placeholder="选择目的地城市"
            />
            {showCustomCity && (
              <Input
                label="自行输入城市"
                placeholder="输入城市名称"
                value={city}
                onChangeText={(t) => {
                  setCity(t);
                  const venues = getVenuesByCity(t.trim());
                  if (!showCustomVenue && venueName && !venues.includes(venueName)) {
                    setVenueName('');
                  }
                }}
              />
            )}
          </Card>
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>日期</Text>
          <Card>
            <DatePicker
              label="演出日期"
              value={eventDate}
              onChange={setEventDate}
            />
            <DatePicker
              label="出发日期"
              value={startDate}
              onChange={setStartDate}
            />
            <DatePicker
              label="返程日期"
              value={endDate}
              onChange={setEndDate}
            />
          </Card>
        </View>

        {/* Budget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>预算</Text>
          <Card>
            <Input
              label="总预算（元）"
              placeholder="例：3000"
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
            />
          </Card>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>偏好设置</Text>
          <Card>
            <Input
              label="交通偏好"
              placeholder="例：高铁、飞机"
              value={transportPref}
              onChangeText={setTransportPref}
            />
            <Input
              label="住宿要求"
              placeholder="例：距场馆近、经济型"
              value={hotelPref}
              onChangeText={setHotelPref}
            />
            <Input
              label="美食偏好"
              placeholder="例：当地特色、素食"
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
            title={isEditing ? '更新行程' : 'AI 智能生成行程'}
            onPress={handleGenerate}
            loading={isGenerating}
          />
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {isGenerating && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <Text style={styles.overlayIcon}>🚀</Text>
            <Text style={styles.overlayTitle}>StarGo AI 正在为你规划行程...</Text>
            <Text style={styles.overlayTimer}>已用时 {formatTime(elapsed)}</Text>
            <View style={styles.overlayProgress}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(elapsed * 5, 90)}%` }]} />
              </View>
            </View>
            <Button
              title="取消生成"
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
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
