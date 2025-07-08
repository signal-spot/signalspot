import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import ShareService, { ShareContent, ShareResult } from '../../services/share.service';
import ShareableCard from './ShareableCard';
import { DesignSystem } from '../../design-system';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  content: ShareContent;
  authorName?: string;
  authorAvatar?: string;
  stats?: {
    likes?: number;
    comments?: number;
    views?: number;
  };
}

interface ShareOption {
  id: string;
  title: string;
  icon: string;
  color: string;
  platform: 'instagram' | 'kakaotalk' | 'twitter' | 'general';
}

const SHARE_OPTIONS: ShareOption[] = [
  {
    id: 'instagram',
    title: 'Instagram Stories',
    icon: '📸',
    color: '#E4405F',
    platform: 'instagram',
  },
  {
    id: 'kakaotalk',
    title: 'KakaoTalk',
    icon: '💬',
    color: '#FEE500',
    platform: 'kakaotalk',
  },
  {
    id: 'twitter',
    title: 'Twitter',
    icon: '🐦',
    color: '#1DA1F2',
    platform: 'twitter',
  },
  {
    id: 'general',
    title: '더 많은 앱',
    icon: '📤',
    color: '#007AFF',
    platform: 'general',
  },
];

const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  content,
  authorName,
  authorAvatar,
  stats,
}) => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const shareableCardRef = useRef<View>(null);
  const shareService = ShareService.getInstance();

  const handleShare = async (option: ShareOption) => {
    try {
      setIsGeneratingImage(true);

      // Capture the shareable card as an image
      const imageUri = await shareService.captureView(shareableCardRef.current, {
        format: 'png',
        quality: 1.0,
      });

      setIsGeneratingImage(false);
      setIsSharing(true);

      // Share the content with the generated image
      const result: ShareResult = await shareService.shareContent(
        {
          ...content,
          imageUri,
        },
        {
          platform: option.platform,
          includeImage: true,
        }
      );

      setIsSharing(false);

      if (result.success) {
        // Track successful share
        shareService.trackShare(content, option.platform, true);
        
        Alert.alert(
          '공유 완료',
          `${option.title}로 성공적으로 공유되었습니다.`,
          [{ text: '확인', onPress: onClose }]
        );
      } else {
        // Track failed share
        shareService.trackShare(content, option.platform, false);
        
        Alert.alert(
          '공유 실패',
          result.error || '공유 중 오류가 발생했습니다.',
          [{ text: '확인' }]
        );
      }

      // Clean up the temporary image file
      if (imageUri) {
        await shareService.cleanupTempFiles(imageUri);
      }
    } catch (error) {
      setIsGeneratingImage(false);
      setIsSharing(false);
      
      shareService.trackShare(content, option.platform, false);
      
      Alert.alert(
        '공유 실패',
        '공유 중 오류가 발생했습니다. 다시 시도해주세요.',
        [{ text: '확인' }]
      );
    }
  };

  const renderShareOption = (option: ShareOption) => (
    <TouchableOpacity
      key={option.id}
      style={[styles.shareOption, { borderColor: option.color }]}
      onPress={() => handleShare(option)}
      disabled={isGeneratingImage || isSharing}
    >
      <View style={[styles.shareOptionIcon, { backgroundColor: option.color }]}>
        <Text style={styles.shareOptionIconText}>{option.icon}</Text>
      </View>
      <Text style={styles.shareOptionTitle}>{option.title}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>공유하기</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Preview Card */}
          <View style={styles.previewContainer}>
            <Text style={styles.sectionTitle}>미리보기</Text>
            <View style={styles.cardContainer}>
              <ViewShot ref={shareableCardRef} options={{ format: 'png', quality: 1.0 }}>
                <ShareableCard
                  type={content.type}
                  title={content.title}
                  description={content.description}
                  imageUri={content.imageUri}
                  authorName={authorName}
                  authorAvatar={authorAvatar}
                  stats={stats}
                  timestamp={new Date()}
                />
              </ViewShot>
            </View>
          </View>

          {/* Share Options */}
          <View style={styles.optionsContainer}>
            <Text style={styles.sectionTitle}>공유할 앱 선택</Text>
            <View style={styles.shareOptionsGrid}>
              {SHARE_OPTIONS.map(renderShareOption)}
            </View>
          </View>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.sectionTitle}>공유 팁</Text>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>
                Instagram Stories에 공유하면 더 많은 사람들이 볼 수 있어요
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>🎯</Text>
              <Text style={styles.tipText}>
                해시태그를 함께 사용하면 더 많은 발견이 가능해요
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>👥</Text>
              <Text style={styles.tipText}>
                친구들과 공유해서 함께 SignalSpot을 즐겨보세요
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Loading Overlay */}
        {(isGeneratingImage || isSharing) && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={DesignSystem.colors.primary} />
              <Text style={styles.loadingText}>
                {isGeneratingImage ? '이미지 생성 중...' : '공유 중...'}
              </Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.background.secondary,
  },

  closeButton: {
    padding: DesignSystem.spacing.xs,
  },

  closeButtonText: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.primary,
    fontWeight: '600',
  },

  headerTitle: {
    ...DesignSystem.typography.title3,
    fontWeight: '600',
    color: DesignSystem.colors.text.primary,
  },

  placeholder: {
    width: 40, // Same width as close button for centering
  },

  content: {
    flex: 1,
  },

  previewContainer: {
    padding: DesignSystem.spacing.md,
  },

  sectionTitle: {
    ...DesignSystem.typography.title3,
    fontWeight: '600',
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.md,
  },

  cardContainer: {
    alignItems: 'center',
  },

  optionsContainer: {
    padding: DesignSystem.spacing.md,
    paddingTop: 0,
  },

  shareOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.md,
  },

  shareOption: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: DesignSystem.spacing.md,
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: DesignSystem.colors.background.primary,
  },

  shareOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },

  shareOptionIconText: {
    fontSize: 24,
  },

  shareOptionTitle: {
    ...DesignSystem.typography.caption,
    fontWeight: '600',
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
  },

  tipsContainer: {
    padding: DesignSystem.spacing.md,
    paddingTop: 0,
  },

  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: DesignSystem.spacing.sm,
  },

  tipIcon: {
    fontSize: 16,
    marginRight: DesignSystem.spacing.sm,
    marginTop: 2,
  },

  tipText: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingContainer: {
    backgroundColor: DesignSystem.colors.background.primary,
    padding: DesignSystem.spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 200,
  },

  loadingText: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.primary,
    marginTop: DesignSystem.spacing.md,
    textAlign: 'center',
  },
});

export default ShareModal;