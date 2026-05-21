import React from 'react';
import { View, Text, ScrollView, StyleSheet, Share } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { fontSize, spacing } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import { saveMemorial } from '../../services/memorial';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ContentPreview from '../../components/memorial/ContentPreview';
import type { MemorialStackParamList } from '../../navigation/MemorialStack';

type PreviewRoute = RouteProp<MemorialStackParamList, 'MemorialPreview'>;

export default function MemorialPreviewScreen() {
  const route = useRoute<PreviewRoute>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { content } = route.params;

  const handleSave = async () => {
    if (!user) return;
    await saveMemorial(user.id, content);
    navigation.goBack();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${content.captions.medium}\n\n${content.hashtags.join(' ')}`,
      });
    } catch {
      // user cancelled
    }
  };

  const handleRegenerate = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header title="纪念内容" showBack />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Info */}
        <Card style={styles.eventCard}>
          <Text style={styles.eventName}>{content.eventName}</Text>
          <View style={styles.templateBadge}>
            <Text style={styles.templateBadgeText}>{content.template}</Text>
          </View>
        </Card>

        {/* Captions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>文案</Text>
          <ContentPreview title="短文案（朋友圈/Instagram）" content={content.captions.short} accentColor={colors.primary} />
          <ContentPreview title="中长文（微博/小红书）" content={content.captions.medium} accentColor={colors.accent} />
          <ContentPreview title="长故事（公众号/备忘录）" content={content.captions.long} accentColor={colors.success} />
        </View>

        {/* Hashtags */}
        {content.hashtags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>话题标签</Text>
            <Card>
              <View style={styles.hashtagRow}>
                {content.hashtags.map((tag, idx) => (
                  <View key={idx} style={styles.hashtag}>
                    <Text style={styles.hashtagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>
        )}

        {/* Platform Posts */}
        {content.suggestedPosts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>平台推文</Text>
            {content.suggestedPosts.map((post, idx) => (
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
          <Button title="保存" onPress={handleSave} style={styles.actionBtn} />
          <Button title="分享" onPress={handleShare} variant="outline" style={styles.actionBtn} />
          <Button title="重新生成" onPress={handleRegenerate} variant="ghost" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxl },
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
