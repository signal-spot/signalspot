import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SacredSiteList } from '../../components/sacred-site/SacredSiteList';
import { SacredSite, SiteQuery, SiteTier, sacredSiteService } from '../../services/sacred-site.service';
import { useLocation } from '../../hooks/useLocation';
import { DesignSystem } from '../../utils/designSystem';

export const SacredSitesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { location } = useLocation();
  
  const [query, setQuery] = useState<SiteQuery>({
    limit: 20,
    offset: 0,
    sortBy: 'score',
    sortOrder: 'desc',
    radiusKm: 10,
    latitude: location?.latitude,
    longitude: location?.longitude,
  });

  const [showFilters, setShowFilters] = useState(false);

  // Update query with location when available
  React.useEffect(() => {
    if (location?.latitude && location?.longitude) {
      setQuery(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
      }));
    }
  }, [location]);

  // Handle site press
  const handleSitePress = useCallback((site: SacredSite) => {
    navigation.navigate('SacredSiteDetail' as never, { siteId: site.id } as never);
  }, [navigation]);

  // Handle site visit
  const handleSiteVisit = useCallback(async (site: SacredSite) => {
    try {
      await sacredSiteService.recordVisit(site.id, location ? {
        latitude: location.latitude,
        longitude: location.longitude,
      } : undefined);
      
      // Navigate to site detail after recording visit
      handleSitePress(site);
    } catch (error) {
      console.error('Error recording visit:', error);
      // Still navigate to detail even if visit recording fails
      handleSitePress(site);
    }
  }, [location, handleSitePress]);

  // Handle filter changes
  const handleTierFilter = useCallback((tier?: SiteTier) => {
    setQuery(prev => ({ ...prev, tier, offset: 0 }));
    setShowFilters(false);
  }, []);

  const handleSortChange = useCallback((sortBy: 'score' | 'distance' | 'recent' | 'name') => {
    setQuery(prev => ({ ...prev, sortBy, offset: 0 }));
    setShowFilters(false);
  }, []);

  const handleRadiusChange = useCallback((radiusKm: number) => {
    setQuery(prev => ({ ...prev, radiusKm, offset: 0 }));
    setShowFilters(false);
  }, []);

  // Render header with filters
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>성스러운 장소</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterButtonText}>필터 ⚙️</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.subtitle}>
        커뮤니티가 만들어낸 특별한 장소들을 발견해보세요
      </Text>

      {/* Active filters */}
      <View style={styles.activeFilters}>
        {query.tier && (
          <View style={styles.activeFilter}>
            <Text style={styles.activeFilterText}>
              {sacredSiteService.getTierDisplayName(query.tier)} 등급
            </Text>
            <TouchableOpacity onPress={() => handleTierFilter(undefined)}>
              <Text style={styles.removeFilterText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.activeFilter}>
          <Text style={styles.activeFilterText}>
            {query.radiusKm}km 반경
          </Text>
        </View>

        <View style={styles.activeFilter}>
          <Text style={styles.activeFilterText}>
            {query.sortBy === 'score' ? '점수순' :
             query.sortBy === 'distance' ? '거리순' :
             query.sortBy === 'recent' ? '최신순' : '이름순'}
          </Text>
        </View>
      </View>
    </View>
  );

  // Render filters modal
  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Text style={styles.modalCloseButton}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>필터 설정</Text>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Text style={styles.modalDoneButton}>완료</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          {/* Tier filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>등급별 필터</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  !query.tier && styles.filterOptionActive,
                ]}
                onPress={() => handleTierFilter(undefined)}
              >
                <Text style={[
                  styles.filterOptionText,
                  !query.tier && styles.filterOptionTextActive,
                ]}>
                  전체
                </Text>
              </TouchableOpacity>
              
              {Object.values(SiteTier).map((tier) => (
                <TouchableOpacity
                  key={tier}
                  style={[
                    styles.filterOption,
                    query.tier === tier && styles.filterOptionActive,
                  ]}
                  onPress={() => handleTierFilter(tier)}
                >
                  <Text style={styles.filterOptionIcon}>
                    {sacredSiteService.getTierIcon(tier)}
                  </Text>
                  <Text style={[
                    styles.filterOptionText,
                    query.tier === tier && styles.filterOptionTextActive,
                  ]}>
                    {sacredSiteService.getTierDisplayName(tier)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>정렬 방식</Text>
            <View style={styles.filterOptions}>
              {[
                { key: 'score', label: '점수순', icon: '🏆' },
                { key: 'distance', label: '거리순', icon: '📍' },
                { key: 'recent', label: '최신순', icon: '🕐' },
                { key: 'name', label: '이름순', icon: '🔤' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterOption,
                    query.sortBy === option.key && styles.filterOptionActive,
                  ]}
                  onPress={() => handleSortChange(option.key as any)}
                >
                  <Text style={styles.filterOptionIcon}>{option.icon}</Text>
                  <Text style={[
                    styles.filterOptionText,
                    query.sortBy === option.key && styles.filterOptionTextActive,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Radius filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>검색 반경</Text>
            <View style={styles.filterOptions}>
              {[1, 5, 10, 20, 50].map((radius) => (
                <TouchableOpacity
                  key={radius}
                  style={[
                    styles.filterOption,
                    query.radiusKm === radius && styles.filterOptionActive,
                  ]}
                  onPress={() => handleRadiusChange(radius)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    query.radiusKm === radius && styles.filterOptionTextActive,
                  ]}>
                    {radius}km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SacredSiteList
        query={query}
        onSitePress={handleSitePress}
        onSiteVisit={handleSiteVisit}
        header={renderHeader()}
        emptyMessage="주변에 성스러운 장소가 없습니다. 새로운 스팟을 만들어 첫 번째 성소를 발견해보세요!"
      />
      
      {renderFiltersModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.secondary,
  },
  header: {
    backgroundColor: DesignSystem.colors.background.primary,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.background.secondary,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  title: {
    ...DesignSystem.typography.title1,
    color: DesignSystem.colors.text.primary,
    fontWeight: '700',
  },
  filterButton: {
    backgroundColor: DesignSystem.colors.background.secondary,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: 8,
  },
  filterButtonText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
  },
  subtitle: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 22,
    marginBottom: DesignSystem.spacing.md,
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.xs,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.primary + '20',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DesignSystem.colors.primary,
  },
  activeFilterText: {
    ...DesignSystem.typography.caption2,
    color: DesignSystem.colors.primary,
    fontWeight: '600',
  },
  removeFilterText: {
    ...DesignSystem.typography.caption2,
    color: DesignSystem.colors.primary,
    marginLeft: DesignSystem.spacing.xs,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.background.secondary,
  },
  modalCloseButton: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
  },
  modalTitle: {
    ...DesignSystem.typography.title3,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
  },
  modalDoneButton: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  filterSection: {
    marginVertical: DesignSystem.spacing.lg,
  },
  filterSectionTitle: {
    ...DesignSystem.typography.headline,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
    marginBottom: DesignSystem.spacing.md,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.sm,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterOptionActive: {
    backgroundColor: DesignSystem.colors.primary + '20',
    borderColor: DesignSystem.colors.primary,
  },
  filterOptionIcon: {
    fontSize: 16,
    marginRight: DesignSystem.spacing.xs,
  },
  filterOptionText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.primary,
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: DesignSystem.colors.primary,
    fontWeight: '600',
  },
});