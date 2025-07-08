import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { FeedItem, feedService } from '../../services/feed.service';
import { DesignSystem } from '../../utils/designSystem';

interface FeedCardProps {
  item: FeedItem;
  onPress: (item: FeedItem) => void;
  onLike?: (item: FeedItem) => void;
  onComment?: (item: FeedItem) => void;
  onShare?: (item: FeedItem) => void;
  onAuthorPress?: (authorId: string) => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({
  item,
  onPress,
  onLike,
  onComment,
  onShare,
  onAuthorPress,
}) => {
  const getTypeIcon = (type: 'spot' | 'spark'): string => {
    return type === 'spot' ? '📍' : '✨';
  };

  const getTypeColor = (type: 'spot' | 'spark'): string => {
    return type === 'spot' ? '#FF6B6B' : '#4ECDC4';
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.authorContainer}
        onPress={() => onAuthorPress?.(item.author.id)}
      >
        <View style={styles.avatarContainer}>
          {item.author.avatar ? (
            <Image source={{ uri: item.author.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {item.author.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{item.author.username}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.timeText}>
              {feedService.getTimeAgo(item.timestamp)}
            </Text>
            {item.distance && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.distanceText}>
                  {feedService.formatDistance(item.distance)}
                </Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
        <Text style={styles.typeIcon}>{getTypeIcon(item.type)}</Text>
        <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
      </View>
    </View>
  );

  const renderContent = () => (
    <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.7}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        {item.content && (
          <Text style={styles.description} numberOfLines={3}>
            {item.content}
          </Text>
        )}
        
        {item.location.address && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location.address}
            </Text>
          </View>
        )}
        
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {item.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{item.tags.length - 3}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderActions = () => (
    <View style={styles.actions}>
      <View style={styles.stats}>
        <Text style={styles.statsText}>
          {feedService.formatEngagementStats(item.stats)}
        </Text>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            item.interactionData?.hasLiked && styles.actionButtonActive,
          ]}
          onPress={() => onLike?.(item)}
        >
          <Text style={[
            styles.actionButtonText,
            item.interactionData?.hasLiked && styles.actionButtonTextActive,
          ]}>
            {item.interactionData?.hasLiked ? '❤️' : '🤍'} 좋아요
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onComment?.(item)}
        >
          <Text style={styles.actionButtonText}>💬 댓글</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onShare?.(item)}
        >
          <Text style={styles.actionButtonText}>📤 공유</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      {renderHeader()}
      {renderContent()}
      {renderActions()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: 16,
    marginHorizontal: DesignSystem.spacing.md,
    marginVertical: DesignSystem.spacing.xs,
    paddingVertical: DesignSystem.spacing.lg,
    paddingHorizontal: DesignSystem.spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignSystem.spacing.md,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: DesignSystem.spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    backgroundColor: DesignSystem.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...DesignSystem.typography.headline,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    ...DesignSystem.typography.headline,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.secondary,
  },
  separator: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.secondary,
    marginHorizontal: DesignSystem.spacing.xs,
  },
  distanceText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.primary,
    fontWeight: '600',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: 16,
  },
  typeIcon: {
    fontSize: 14,
    marginRight: DesignSystem.spacing.xs,
  },
  typeText: {
    ...DesignSystem.typography.caption2,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  content: {
    marginBottom: DesignSystem.spacing.md,
  },
  title: {
    ...DesignSystem.typography.title3,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
    lineHeight: 24,
  },
  description: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.primary,
    lineHeight: 22,
    marginBottom: DesignSystem.spacing.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.sm,
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
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginLeft: DesignSystem.spacing.xs,
  },
  actions: {
    borderTopWidth: 1,
    borderTopColor: DesignSystem.colors.background.secondary,
    paddingTop: DesignSystem.spacing.md,
  },
  stats: {
    marginBottom: DesignSystem.spacing.sm,
  },
  statsText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.md,
    marginHorizontal: DesignSystem.spacing.xs,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
  },
  actionButtonActive: {
    backgroundColor: '#FFE6E6',
  },
  actionButtonText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
  },
  actionButtonTextActive: {
    color: '#D32F2F',
  },
});