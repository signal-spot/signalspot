import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { DesignSystem } from '../utils/designSystem';
import { signalSpotService, SignalSpot, SpotInteractionRequest } from '../services/signalSpot.service';
import { useAuth } from '../providers/AuthProvider';
import { useLocation } from '../hooks/useLocation';
import ShareButton from '../components/sharing/ShareButton';
import { ShareContent } from '../services/share.service';
import AnalyticsService from '../services/analytics.service';

type SpotDetailScreenRouteProp = RouteProp<RootStackParamList, 'SpotDetail'>;

export const SpotDetailScreen: React.FC = () => {
  const route = useRoute<SpotDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { location } = useLocation();
  const { spotId } = route.params;

  const [spotData, setSpotData] = useState<SignalSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [interacting, setInteracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const analyticsService = AnalyticsService.getInstance();

  useEffect(() => {
    loadSpotDetails();
  }, [spotId]);

  const loadSpotDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await signalSpotService.getSpotById(spotId);
      
      if (response.success) {
        setSpotData(response.data);
      } else {
        setError('시그널 스팟을 불러올 수 없습니다.');
      }
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInteraction = async (type: SpotInteractionRequest['type'], content?: string) => {
    if (!spotData) return;
    
    try {
      setInteracting(true);
      const response = await signalSpotService.interactWithSpot(spotData.id, {
        type,
        content,
      });
      
      if (response.success) {
        setSpotData(response.data);
        
        switch (type) {
          case 'like':
            Alert.alert('성공', '좋아요를 눌렀습니다!');
            break;
          case 'reply':
            Alert.alert('성공', '댓글이 추가되었습니다!');
            break;
          case 'share':
            await handleShare();
            break;
          case 'report':
            Alert.alert('성공', '신고가 접수되었습니다.');
            break;
        }
      }
    } catch (err: any) {
      Alert.alert('오류', err.message || '상호작용에 실패했습니다.');
    } finally {
      setInteracting(false);
    }
  };

  const handleShare = async () => {
    if (!spotData) return;
    
    try {
      await Share.share({
        message: `${spotData.title}\n\n${spotData.content}\n\n시그널 스팟에서 확인하세요!`,
        title: spotData.title,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleReply = () => {
    Alert.prompt(
      '댓글 작성',
      '댓글을 입력하세요',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '게시',
          onPress: (text) => {
            if (text?.trim()) {
              handleInteraction('reply', text.trim());
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleReport = () => {
    Alert.alert(
      '신고하기',
      '이 시그널 스팟을 신고하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '신고',
          style: 'destructive',
          onPress: () => handleInteraction('report', '부적절한 콘텐츠'),
        },
      ]
    );
  };

  const getDistance = () => {
    if (!spotData || !location) return null;
    
    const distance = signalSpotService.getSpotDistance(
      spotData,
      location.latitude,
      location.longitude
    );
    return signalSpotService.formatSpotDistance(distance);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const createdAt = new Date(dateString);
    const diffInMs = now.getTime() - createdAt.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 0) {
      return `${diffInDays}일 전`;
    } else if (diffInHours > 0) {
      return `${diffInHours}시간 전`;
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${Math.max(1, diffInMinutes)}분 전`;
    }
  };

  const isExpired = () => {
    if (!spotData) return false;
    return signalSpotService.isSpotExpired(spotData);
  };

  const isActive = () => {
    if (!spotData) return false;
    return signalSpotService.isSpotActive(spotData);
  };

  const getShareContent = (): ShareContent | null => {
    if (!spotData) return null;
    
    return {
      type: 'spot',
      title: spotData.title,
      description: spotData.content,
      url: `https://signalspot.app/spot/${spotData.id}`,
      data: {
        id: spotData.id,
        type: spotData.type,
        location: {
          latitude: spotData.coordinates.latitude,
          longitude: spotData.coordinates.longitude,
        },
      },
    };
  };

  const handleSharePress = () => {
    const shareContent = getShareContent();
    if (shareContent) {
      analyticsService.trackShareInitiated('spot', spotData!.id, 'modal');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DesignSystem.colors.primary} />
        <Text style={styles.loadingText}>시그널 스팟 로딩 중...</Text>
      </View>
    );
  }

  if (error || !spotData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || '시그널 스팟을 찾을 수 없습니다.'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSpotDetails}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeIcon}>{signalSpotService.getSpotTypeIcon(spotData.type)}</Text>
            <Text style={styles.typeText}>{spotData.type.toUpperCase()}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            isActive() ? styles.activeBadge : styles.expiredBadge
          ]}>
            <Text style={[
              styles.statusText,
              isActive() ? styles.activeText : styles.expiredText
            ]}>
              {isActive() ? '활성' : '만료됨'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.spotTitle}>{spotData.title}</Text>
        <Text style={styles.spotContent}>{spotData.content}</Text>
        
        <View style={styles.metaInfo}>
          <Text style={styles.creatorInfo}>작성자: {spotData.creatorUsername}</Text>
          <Text style={styles.timeInfo}>{getTimeAgo(spotData.createdAt)}</Text>
          {getDistance() && (
            <Text style={styles.distanceInfo}>거리: {getDistance()}</Text>
          )}
        </View>
      </View>

      {spotData.tags && spotData.tags.length > 0 && (
        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>태그</Text>
          <View style={styles.tagsContainer}>
            {spotData.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{spotData.viewCount}</Text>
          <Text style={styles.statLabel}>조회수</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{spotData.likeCount}</Text>
          <Text style={styles.statLabel}>좋아요</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{spotData.replyCount}</Text>
          <Text style={styles.statLabel}>댓글</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{spotData.shareCount}</Text>
          <Text style={styles.statLabel}>공유</Text>
        </View>
      </View>

      <View style={styles.engagementSection}>
        <Text style={styles.sectionTitle}>참여하기</Text>
        <View style={styles.engagementButtons}>
          <TouchableOpacity
            style={[
              styles.engagementButton,
              spotData.interactions.hasLiked && styles.likedButton
            ]}
            onPress={() => handleInteraction('like')}
            disabled={interacting || !isActive()}
          >
            <Text style={styles.engagementButtonText}>
              {spotData.interactions.hasLiked ? '❤️' : '🤍'} 좋아요
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.engagementButton}
            onPress={handleReply}
            disabled={interacting || !isActive()}
          >
            <Text style={styles.engagementButtonText}>💬 댓글</Text>
          </TouchableOpacity>
          
          {getShareContent() && (
            <ShareButton
              content={getShareContent()!}
              authorName={spotData.creatorUsername}
              stats={{
                likes: spotData.likeCount,
                comments: spotData.replyCount,
                views: spotData.viewCount,
              }}
              variant="ghost"
              size="medium"
              style={styles.engagementButton}
              textStyle={styles.engagementButtonText}
              onPress={handleSharePress}
            />
          )}
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.reportButton}
          onPress={handleReport}
          disabled={interacting}
        >
          <Text style={styles.reportButtonText}>⚠️ 신고하기</Text>
        </TouchableOpacity>
      </View>

      {interacting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={DesignSystem.colors.primary} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary,
  },
  loadingText: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
    marginTop: DesignSystem.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignSystem.spacing.lg,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  errorText: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.lg,
  },
  retryButton: {
    backgroundColor: DesignSystem.colors.primary,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    ...DesignSystem.typography.headline,
    color: '#FFFFFF',
  },
  header: {
    padding: DesignSystem.spacing.lg,
    backgroundColor: DesignSystem.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.background.secondary,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: 16,
  },
  typeIcon: {
    fontSize: 16,
    marginRight: DesignSystem.spacing.xs,
  },
  typeText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.secondary,
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#E8F5E8',
  },
  expiredBadge: {
    backgroundColor: '#FFF2F2',
  },
  statusText: {
    ...DesignSystem.typography.caption1,
    fontWeight: '600',
  },
  activeText: {
    color: '#2E7D2E',
  },
  expiredText: {
    color: '#D32F2F',
  },
  spotTitle: {
    ...DesignSystem.typography.title1,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
  },
  spotContent: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.primary,
    lineHeight: 24,
    marginBottom: DesignSystem.spacing.md,
  },
  metaInfo: {
    gap: DesignSystem.spacing.xs,
  },
  creatorInfo: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.secondary,
  },
  timeInfo: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.secondary,
  },
  distanceInfo: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.primary,
    fontWeight: '600',
  },
  tagsSection: {
    padding: DesignSystem.spacing.lg,
  },
  sectionTitle: {
    ...DesignSystem.typography.headline,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.xs,
  },
  tag: {
    backgroundColor: DesignSystem.colors.background.secondary,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: 16,
  },
  tagText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.secondary,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: DesignSystem.spacing.lg,
    gap: DesignSystem.spacing.xs,
  },
  statCard: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.secondary,
    padding: DesignSystem.spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    ...DesignSystem.typography.title3,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
  },
  statLabel: {
    ...DesignSystem.typography.caption2,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  engagementSection: {
    padding: DesignSystem.spacing.lg,
  },
  engagementButtons: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
  },
  engagementButton: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.secondary,
    paddingVertical: DesignSystem.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  likedButton: {
    backgroundColor: '#FFE6E6',
  },
  engagementButtonText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
  },
  actionButtons: {
    padding: DesignSystem.spacing.lg,
    paddingTop: 0,
  },
  reportButton: {
    backgroundColor: '#FFF5F5',
    paddingVertical: DesignSystem.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFEBEE',
  },
  reportButtonText: {
    ...DesignSystem.typography.caption1,
    color: '#D32F2F',
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});