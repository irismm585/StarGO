import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Share, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { fontSize, spacing } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import { saveMemorial } from '../../services/memorial';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ContentPreview from '../../components/memorial/ContentPreview';
import { useTranslation } from '../../contexts/LanguageContext';
import type { MemorialStackParamList } from '../../navigation/MemorialStack';

type PreviewRoute = RouteProp<MemorialStackParamList, 'MemorialPreview'>;

export default function MemorialPreviewScreen() {
  const route = useRoute<PreviewRoute>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { content, contentEn } = route.params;
  const [memorialLang, setMemorialLang] = useState<'zh' | 'en'>('zh');

  const displayContent = memorialLang === 'en' && contentEn ? contentEn : content;

  const toggleMemorialLang = () => {
    setMemorialLang((prev) => (prev === 'zh' ? 'en' : 'zh'));
  };

  const handleSave = async () => {
    if (!user) return;
    await saveMemorial(user.id, content, contentEn);
    navigation.goBack();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${displayContent.captions.medium}\n\n${displayContent.hashtags.join(' ')}`,
      });
    } catch {
      // user cancelled
    }
  };

  const handleRegenerate = () => {
    navigation.goBack();
  };

  const langToggle = (
    <TouchableOpacity
      style={styles.langBtn}
      onPress={toggleMemorialLang}
      activeOpacity={0.7}
    >
      <Text style={styles.langBtnText}>
        {memorialLang === 'zh' ? 'EN' : '中'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title={t.memorial.preview} showBack rightAction={langToggle} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Info */}
        <Card style={styles.eventCard}>
          <Text style={styles.eventName}>{displayContent.eventName}</Text>
          <View style={styles.templateBadge}>
            <Text style={styles.templateBadgeText}>{displayContent.template}</Text>
          </View>
        </Card>

        {/* Captions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {memorialLang === 'zh' ? '文案' : 'Captions'}
          </Text>
          <ContentPreview
            title={memorialLang === 'zh' ? '短文案（朋友圈/Instagram）' : 'Short (Moments/Instagram)'}
            content={displayContent.captions.short}
            accentColor={colors.primary}
          />
          <ContentPreview
            title={memorialLang === 'zh' ? '中长文（微博/小红书）' : 'Medium (Weibo/Xiaohongshu)'}
            content={displayContent.captions.medium}
            accentColor={colors.accent}
          />
          <ContentPreview
            title={memorialLang === 'zh' ? '长故事（公众号/备忘录）' : 'Long Story (Blog/Memo)'}
            content={displayContent.captions.long}
            accentColor={colors.success}
          />
        </View>

        {/* Hashtags */}
        {displayContent.hashtags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {memorialLang === 'zh' ? '话题标签' : 'Hashtags'}
            </Text>
            <Card>
              <View style={styles.hashtagRow}>
                {displayContent.hashtags.map((tag, idx) => (
                  <View key={idx} style={styles.hashtag}>
                    <Text style={styles.hashtagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>
        )}

        {/* Platform Posts */}
        {displayContent.suggestedPosts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {memorialLang === 'zh' ? '平台推文' : 'Platform Posts'}
            </Text>
            {displayContent.suggestedPosts.map((post, idx) => (
              <ContentPreview
                key={idx}
                title={`${post.platform.toUpperCase()}`}
                content={post.content}
                accentColor={colors.warning}
              />
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button title={t.memorial.save} onPress={handleSave} style={styles.actionBtn} />
          <Button title={t.memorial.share} onPress={handleShare} variant="outline" style={styles.actionBtn} />
          <Button title={t.memorial.regenerate} onPress={handleRegenerate} variant="ghost" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxl },
  langBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  eventCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  eventName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  templateBadge: {
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  templateBadgeText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  hashtagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  hashtag: {
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  hashtagText: { fontSize: fontSize.sm, color: colors.primary },
  actions: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  actionBtn: {
    marginBottom: 0,
  },
});
