import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import { generateItinerary, saveItinerary } from '../../services/itinerary';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import type { ItineraryGenerationParams, Itinerary } from '../../types/itinerary';

const TRAVEL_STYLES = ['经济型', '舒适型', '豪华型'] as const;

export default function ItineraryCreateScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [eventName, setEventName] = useState('');
  const [venueName, setVenueName] = useState('');
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [transportPref, setTransportPref] = useState('');
  const [hotelPref, setHotelPref] = useState('');
  const [foodPref, setFoodPref] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    if (!venueName.trim()) { setError('请输入场馆名称'); return false; }
    if (!city.trim()) { setError('请输入城市'); return false; }
    if (!startDate.trim()) { setError('请输入开始日期'); return false; }
    if (!endDate.trim()) { setError('请输入结束日期'); return false; }
    if (!budget.trim() || isNaN(Number(budget)) || Number(budget) <= 0) {
      setError('请输入有效预算'); return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    setError(null);
    if (!validate()) return;

    const params: ItineraryGenerationParams = {
      eventName: eventName.trim(),
      venueName: venueName.trim(),
      city: city.trim(),
      startDate: startDate.trim(),
      endDate: endDate.trim(),
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

      // Auto-save
      if (user) {
        await saveItinerary(user.id, result, params);
      }

      navigation.replace('ItineraryDetail', {
        itineraryData: result,
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
            <Input
              label="场馆"
              placeholder="例：东京巨蛋"
              value={venueName}
              onChangeText={setVenueName}
            />
            <Input
              label="城市"
              placeholder="例：东京"
              value={city}
              onChangeText={setCity}
            />
          </Card>
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>日期</Text>
          <Card>
            <Input
              label="开始日期"
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChangeText={setStartDate}
              autoCapitalize="none"
            />
            <Input
              label="结束日期"
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChangeText={setEndDate}
              autoCapitalize="none"
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
            title="AI 智能生成行程"
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
