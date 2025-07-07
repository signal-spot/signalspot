import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { DesignSystem } from '../utils/designSystem';

type SpotDetailScreenRouteProp = RouteProp<RootStackParamList, 'SpotDetail'>;

export const SpotDetailScreen: React.FC = () => {
  const route = useRoute<SpotDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { spotId } = route.params;

  // TODO: Fetch spot details from API
  const spotData = {
    id: spotId,
    name: '강남역 스타벅스',
    category: 'CAFE',
    address: '서울특별시 강남구 강남대로 390',
    signalStrength: 'EXCELLENT',
    visitCount: 156,
    lastVisit: '2024-01-15',
    photos: [],
    description: '강남역 4번 출구 바로 앞에 위치한 스타벅스입니다.',
  };

  const handleNavigate = () => {
    Alert.alert('길안내', '길안내 기능은 준비 중입니다.');
  };

  const handleShare = () => {
    Alert.alert('공유', '공유 기능은 준비 중입니다.');
  };

  const getSignalColor = (strength: string) => {
    switch (strength) {
      case 'EXCELLENT':
        return DesignSystem.colors.primary;
      case 'GOOD':
        return '#34C759';
      case 'FAIR':
        return '#FF9500';
      case 'POOR':
        return '#FF3B30';
      default:
        return DesignSystem.colors.text.secondary;
    }
  };

  const getSignalText = (strength: string) => {
    switch (strength) {
      case 'EXCELLENT':
        return '매우 좋음';
      case 'GOOD':
        return '좋음';
      case 'FAIR':
        return '보통';
      case 'POOR':
        return '나쁨';
      default:
        return '알 수 없음';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CAFE':
        return '☕';
      case 'RESTAURANT':
        return '🍽️';
      case 'SHOPPING':
        return '🛍️';
      case 'OFFICE':
        return '🏢';
      default:
        return '📍';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryIcon}>{getCategoryIcon(spotData.category)}</Text>
          <Text style={styles.categoryText}>{spotData.category}</Text>
        </View>
        <Text style={styles.spotName}>{spotData.name}</Text>
        <Text style={styles.address}>{spotData.address}</Text>
      </View>

      <View style={styles.signalInfo}>
        <Text style={styles.sectionTitle}>신호 강도</Text>
        <View style={styles.signalCard}>
          <View
            style={[
              styles.signalIndicator,
              { backgroundColor: getSignalColor(spotData.signalStrength) },
            ]}
          />
          <Text style={styles.signalText}>{getSignalText(spotData.signalStrength)}</Text>
        </View>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{spotData.visitCount}</Text>
          <Text style={styles.statLabel}>방문 횟수</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{spotData.lastVisit}</Text>
          <Text style={styles.statLabel}>마지막 방문</Text>
        </View>
      </View>

      {spotData.description && (
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>설명</Text>
          <Text style={styles.description}>{spotData.description}</Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleNavigate}>
          <Text style={styles.primaryButtonText}>길안내</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
          <Text style={styles.secondaryButtonText}>공유</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  header: {
    padding: DesignSystem.spacing.lg,
    backgroundColor: DesignSystem.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.background.secondary,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: DesignSystem.colors.background.secondary,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: 16,
    marginBottom: DesignSystem.spacing.sm,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: DesignSystem.spacing.xs,
  },
  categoryText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.secondary,
    textTransform: 'uppercase',
  },
  spotName: {
    ...DesignSystem.typography.title1,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
  },
  address: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
  },
  signalInfo: {
    padding: DesignSystem.spacing.lg,
  },
  sectionTitle: {
    ...DesignSystem.typography.headline,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.md,
  },
  signalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    padding: DesignSystem.spacing.md,
    borderRadius: 12,
  },
  signalIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: DesignSystem.spacing.sm,
  },
  signalText: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.primary,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: DesignSystem.spacing.lg,
    gap: DesignSystem.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.secondary,
    padding: DesignSystem.spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    ...DesignSystem.typography.title2,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
  },
  statLabel: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.secondary,
  },
  descriptionSection: {
    padding: DesignSystem.spacing.lg,
  },
  description: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.primary,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: DesignSystem.spacing.lg,
    gap: DesignSystem.spacing.md,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: DesignSystem.colors.primary,
    paddingVertical: DesignSystem.spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...DesignSystem.typography.headline,
    color: '#FFFFFF',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.secondary,
    paddingVertical: DesignSystem.spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...DesignSystem.typography.headline,
    color: DesignSystem.colors.text.primary,
  },
});