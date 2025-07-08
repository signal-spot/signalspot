import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LinearGradient,
} from 'react-native';
import { SacredSite, SiteTier, sacredSiteService } from '../../services/sacred-site.service';
import { DesignSystem } from '../../utils/designSystem';

interface SacredSiteCardProps {
  site: SacredSite;
  onPress: (site: SacredSite) => void;
  onVisit?: (site: SacredSite) => void;
  rank?: number;
  showDistance?: boolean;
  variant?: 'default' | 'compact' | 'leaderboard';
}

export const SacredSiteCard: React.FC<SacredSiteCardProps> = ({
  site,
  onPress,
  onVisit,
  rank,
  showDistance = true,
  variant = 'default',
}) => {
  const tierColor = sacredSiteService.getTierColor(site.tier);
  const tierIcon = sacredSiteService.getTierIcon(site.tier);
  const tierName = sacredSiteService.getTierDisplayName(site.tier);
  const statusName = sacredSiteService.getStatusDisplayName(site.status);
  const statusColor = sacredSiteService.getStatusColor(site.status);

  const getTierGradient = () => {
    switch (site.tier) {
      case SiteTier.LEGENDARY:
        return ['#FFD700', '#FFA500'];
      case SiteTier.MAJOR:
        return ['#C0C0C0', '#A8A8A8'];
      case SiteTier.MINOR:
        return ['#CD7F32', '#B8860B'];
      default:
        return ['#90EE90', '#7CCD7C'];
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        {rank && (
          <View style={[styles.rankBadge, { backgroundColor: tierColor }]}>
            <Text style={styles.rankText}>#{rank}</Text>
          </View>
        )}
        
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {site.name}
          </Text>
          {site.description && variant !== 'compact' && (
            <Text style={styles.description} numberOfLines={2}>
              {site.description}
            </Text>
          )}
        </View>

        <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
          <Text style={styles.tierIcon}>{tierIcon}</Text>
          <Text style={styles.tierText}>{tierName}</Text>
        </View>
      </View>

      {site.address && variant !== 'compact' && (
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {site.address}
          </Text>
          {showDistance && site.distance && (
            <Text style={styles.distanceText}>
              {sacredSiteService.formatDistance(site.distance)}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const renderMetrics = () => {
    if (variant === 'compact') {
      return (
        <View style={styles.compactMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{site.metrics.totalScore}</Text>
            <Text style={styles.metricLabel}>점수</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{site.metrics.visitCount}</Text>
            <Text style={styles.metricLabel}>방문</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{site.metrics.spotCount}</Text>
            <Text style={styles.metricLabel}>스팟</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.metrics}>
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{Math.round(site.metrics.totalScore)}</Text>
            <Text style={styles.metricLabel}>총점</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{site.metrics.visitCount}</Text>
            <Text style={styles.metricLabel}>방문 수</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{site.metrics.uniqueVisitorCount}</Text>
            <Text style={styles.metricLabel}>방문자</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{site.metrics.spotCount}</Text>
            <Text style={styles.metricLabel}>스팟 수</Text>
          </View>
        </View>

        {variant === 'leaderboard' && (
          <View style={styles.additionalMetrics}>
            <View style={styles.additionalMetricItem}>
              <Text style={styles.additionalMetricLabel}>성장률</Text>
              <Text style={[
                styles.additionalMetricValue,
                { color: site.metrics.growthRate >= 0 ? '#4CAF50' : '#F44336' }
              ]}>
                {site.metrics.growthRate >= 0 ? '+' : ''}{site.metrics.growthRate.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.additionalMetricItem}>
              <Text style={styles.additionalMetricLabel}>참여도</Text>
              <Text style={styles.additionalMetricValue}>
                {site.metrics.averageEngagementRate.toFixed(1)}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderStatus = () => (
    <View style={styles.statusRow}>
      <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>
          {statusName}
        </Text>
      </View>

      <Text style={styles.lastActivity}>
        마지막 활동: {sacredSiteService.getTimeAgo(site.discovery.lastActivityAt)}
      </Text>
    </View>
  );

  const renderActions = () => {
    if (variant === 'compact') return null;

    return (
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => onPress(site)}
        >
          <Text style={styles.primaryButtonText}>자세히 보기</Text>
        </TouchableOpacity>

        {onVisit && (
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => onVisit(site)}
          >
            <Text style={styles.secondaryButtonText}>방문하기</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const cardStyle = variant === 'leaderboard' && site.tier === SiteTier.LEGENDARY
    ? [styles.card, styles.legendaryCard]
    : styles.card;

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={() => onPress(site)}
      activeOpacity={0.7}
    >
      {site.tier === SiteTier.LEGENDARY && variant === 'leaderboard' && (
        <LinearGradient
          colors={getTierGradient()}
          style={styles.legendaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      
      <View style={styles.content}>
        {renderHeader()}
        {renderMetrics()}
        {renderStatus()}
        {renderActions()}
      </View>

      {site.tags && site.tags.length > 0 && variant !== 'compact' && (
        <View style={styles.tagsContainer}>
          {site.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
          {site.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{site.tags.length - 3}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: 16,
    marginHorizontal: DesignSystem.spacing.md,
    marginVertical: DesignSystem.spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  legendaryCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  legendaryGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  content: {
    padding: DesignSystem.spacing.lg,
  },
  header: {
    marginBottom: DesignSystem.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: DesignSystem.spacing.sm,
  },
  rankBadge: {
    borderRadius: 12,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    marginRight: DesignSystem.spacing.sm,
  },
  rankText: {
    ...DesignSystem.typography.caption1,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  titleContainer: {
    flex: 1,
    marginRight: DesignSystem.spacing.sm,
  },
  title: {
    ...DesignSystem.typography.title3,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
    marginBottom: DesignSystem.spacing.xs,
  },
  description: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 20,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: 16,
  },
  tierIcon: {
    fontSize: 14,
    marginRight: DesignSystem.spacing.xs,
  },
  tierText: {
    ...DesignSystem.typography.caption1,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 14,
    marginRight: DesignSystem.spacing.xs,
  },
  locationText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.secondary,
    flex: 1,
  },
  distanceText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.primary,
    fontWeight: '600',
    marginLeft: DesignSystem.spacing.sm,
  },
  metrics: {
    marginBottom: DesignSystem.spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    ...DesignSystem.typography.title3,
    color: DesignSystem.colors.text.primary,
    fontWeight: '700',
  },
  metricLabel: {
    ...DesignSystem.typography.caption2,
    color: DesignSystem.colors.text.secondary,
    marginTop: 2,
  },
  compactMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: DesignSystem.spacing.sm,
  },
  metricItem: {
    alignItems: 'center',
  },
  additionalMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: DesignSystem.spacing.sm,
    paddingTop: DesignSystem.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: DesignSystem.colors.background.secondary,
  },
  additionalMetricItem: {
    alignItems: 'center',
  },
  additionalMetricLabel: {
    ...DesignSystem.typography.caption2,
    color: DesignSystem.colors.text.secondary,
  },
  additionalMetricValue: {
    ...DesignSystem.typography.caption1,
    fontWeight: '600',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: DesignSystem.spacing.xs,
  },
  statusText: {
    ...DesignSystem.typography.caption1,
    fontWeight: '600',
  },
  lastActivity: {
    ...DesignSystem.typography.caption2,
    color: DesignSystem.colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: DesignSystem.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: DesignSystem.colors.primary,
  },
  secondaryButton: {
    backgroundColor: DesignSystem.colors.background.secondary,
  },
  primaryButtonText: {
    ...DesignSystem.typography.caption1,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondaryButtonText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.lg,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: DesignSystem.colors.background.secondary,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: 12,
    marginRight: DesignSystem.spacing.xs,
    marginBottom: DesignSystem.spacing.xs,
  },
  tagText: {
    ...DesignSystem.typography.caption2,
    color: DesignSystem.colors.text.secondary,
    fontWeight: '500',
  },
  moreTagsText: {
    ...DesignSystem.typography.caption2,
    color: DesignSystem.colors.text.secondary,
    fontWeight: '500',
    alignSelf: 'center',
    marginLeft: DesignSystem.spacing.xs,
  },
});