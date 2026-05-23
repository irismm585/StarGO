import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import { createBuddyPost } from '../../services/buddy';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import DatePicker from '../../components/common/DatePicker';
import {
  BUDDY_PURPOSE_OPTIONS,
  getPurposeLabel,
  type BuddyPurpose,
} from '../../types/buddy';
import type { HomeStackParamList } from '../../navigation/HomeStack';

type CreatePostRoute = RouteProp<HomeStackParamList, 'CreateBuddyPost'>;

export default function CreateBuddyPostScreen() {
  const navigation = useNavigation();
  const route = useRoute<CreatePostRoute>();
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const prefill = route.params?.prefill;

  const [eventName, setEventName] = useState(prefill?.eventName ?? '');
  const [eventDate, setEventDate] = useState(prefill?.eventDate ?? '');
  const [city, setCity] = useState(prefill?.city ?? '');
  const [venueName, setVenueName] = useState('');
  const [selectedPurposes, setSelectedPurposes] = useState<BuddyPurpose[]>([]);
  const [genderPref, setGenderPref] = useState<'male' | 'female' | 'any'>('any');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const togglePurpose = (p: BuddyPurpose) => {
    setSelectedPurposes((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!eventName.trim()) { Alert.alert(t.common.loading, language === 'zh' ? '请输入活动名称' : 'Enter event name'); return; }
    if (!city.trim()) { Alert.alert(t.common.loading, language === 'zh' ? '请输入城市' : 'Enter city'); return; }
    if (selectedPurposes.length === 0) { Alert.alert(t.common.loading, language === 'zh' ? '请选择至少一个出行目的' : 'Select at least one purpose'); return; }

    setSubmitting(true);
    try {
      await createBuddyPost({
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        eventName: eventName.trim(),
        eventDate: eventDate.trim(),
        city: city.trim(),
        venueName: venueName.trim() || undefined,
        purpose: selectedPurposes,
        genderPreference: genderPref,
        description: description.trim(),
      });
      Alert.alert(
        language === 'zh' ? '发布成功' : 'Posted',
        language === 'zh' ? '找搭子帖子已发布！' : 'Your buddy post is live!',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch {
      Alert.alert(t.common.loading, language === 'zh' ? '发布失败，请重试' : 'Failed to post, try again');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title={language === 'zh' ? '发布找搭子' : 'Post a Buddy Request'} showBack />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Event Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'zh' ? '活动信息' : 'Event Info'}
          </Text>
          <Input
            label={language === 'zh' ? '活动名称' : 'Event Name'}
            placeholder={language === 'zh' ? '例：Taylor Swift 演唱会' : 'e.g. Taylor Swift Concert'}
            value={eventName}
            onChangeText={setEventName}
          />
          <DatePicker
            label={language === 'zh' ? '活动日期' : 'Event Date'}
            value={eventDate}
            onChange={setEventDate}
          />
          <Input
            label={language === 'zh' ? '城市' : 'City'}
            placeholder={language === 'zh' ? '活动城市' : 'Event city'}
            value={city}
            onChangeText={setCity}
          />
          <Input
            label={language === 'zh' ? '场馆（选填）' : 'Venue (optional)'}
            placeholder={language === 'zh' ? '场馆名称' : 'Venue name'}
            value={venueName}
            onChangeText={setVenueName}
          />
        </View>

        {/* Purpose */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'zh' ? '出行目的' : 'Purpose'}
          </Text>
          <Text style={styles.hint}>
            {language === 'zh' ? '选择你找搭子的目的（可多选）' : 'Select your purpose (multiple allowed)'}
          </Text>
          <View style={styles.purposeGrid}>
            {BUDDY_PURPOSE_OPTIONS.map((opt) => {
              const active = selectedPurposes.includes(opt.key);
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.purposeChip, active && styles.purposeChipActive]}
                  onPress={() => togglePurpose(opt.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.purposeChipIcon}>{opt.icon}</Text>
                  <Text style={[styles.purposeChipLabel, active && styles.purposeChipLabelActive]}>
                    {language === 'zh' ? opt.labelZh : opt.labelEn}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Gender Preference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'zh' ? '搭子性别偏好' : 'Buddy Gender Preference'}
          </Text>
          <View style={styles.genderRow}>
            {([
              { key: 'any' as const, labelZh: '不限', labelEn: 'Any' },
              { key: 'male' as const, labelZh: '男性', labelEn: 'Male' },
              { key: 'female' as const, labelZh: '女性', labelEn: 'Female' },
            ]).map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.genderChip, genderPref === opt.key && styles.genderChipActive]}
                onPress={() => setGenderPref(opt.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.genderChipText, genderPref === opt.key && styles.genderChipTextActive]}>
                  {language === 'zh' ? opt.labelZh : opt.labelEn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'zh' ? '描述' : 'Description'}
          </Text>
          <Input
            label=""
            placeholder={
              language === 'zh'
                ? '介绍一下你的计划，比如时间、预算、想找什么样的搭子...'
                : 'Describe your plan, timing, budget, what kind of buddy you want...'
            }
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        {/* Submit */}
        <View style={styles.submitSection}>
          <Button
            title={language === 'zh' ? '发布' : 'Post'}
            onPress={handleSubmit}
            loading={submitting}
          />
        </View>
      </ScrollView>
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
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  purposeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  purposeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  purposeChipActive: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
  },
  purposeChipIcon: { fontSize: 16 },
  purposeChipLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  purposeChipLabelActive: {
    color: colors.primary,
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genderChip: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  genderChipActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}12`,
  },
  genderChipText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  genderChipTextActive: {
    color: colors.primary,
  },
  submitSection: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
});
