import React, { forwardRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { DesignSystem } from '../../utils/designSystem';

interface ShareableCardProps {
  type: 'spot' | 'spark' | 'profile';
  title: string;
  description: string;
  imageUri?: string;
  authorName?: string;
  authorAvatar?: string;
  location?: {
    name: string;
    coordinates?: [number, number];
  };
  stats?: {
    likes?: number;
    comments?: number;
    views?: number;
  };
  timestamp?: Date;
  brandingVisible?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

const ShareableCard = forwardRef<View, ShareableCardProps>(({
  type,
  title,
  description,
  imageUri,
  authorName,
  authorAvatar,
  location,
  stats,
  timestamp,
  brandingVisible = true,
}, ref) => {
  const cardWidth = screenWidth * 0.9;
  const cardHeight = cardWidth * 1.2; // 5:6 aspect ratio for optimal social sharing

  const getTypeIcon = () => {
    switch (type) {
      case 'spot':
        return '📍';
      case 'spark':
        return '✨';
      case 'profile':
        return '👋';
      default:
        return '🌟';
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'spot':
        return 'Signal Spot';
      case 'spark':
        return 'Signal Spark';
      case 'profile':
        return 'Profile';
      default:
        return 'SignalSpot';
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View ref={ref} style={[styles.container, { width: cardWidth, height: cardHeight }]}>
      {/* Background Image or Gradient */}
      {imageUri ? (
        <ImageBackground source={{ uri: imageUri }} style={styles.backgroundImage}>
          <View style={styles.overlay} />
        </ImageBackground>
      ) : (
        <View style={[styles.gradientBackground, styles.getGradientForType(type)]} />
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <Text style={styles.typeIcon}>{getTypeIcon()}</Text>
          <Text style={styles.typeLabel}>{getTypeLabel()}</Text>
        </View>
        {timestamp && (
          <Text style={styles.timestamp}>{formatTimestamp(timestamp)}</Text>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        
        <Text style={styles.description} numberOfLines={4}>
          {description}
        </Text>

        {location && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {location.name}
            </Text>
          </View>
        )}

        {stats && (
          <View style={styles.statsContainer}>
            {stats.likes !== undefined && (
              <View style={styles.stat}>
                <Text style={styles.statIcon}>❤️</Text>
                <Text style={styles.statText}>{stats.likes}</Text>
              </View>
            )}
            {stats.comments !== undefined && (
              <View style={styles.stat}>
                <Text style={styles.statIcon}>💬</Text>
                <Text style={styles.statText}>{stats.comments}</Text>
              </View>
            )}
            {stats.views !== undefined && (
              <View style={styles.stat}>
                <Text style={styles.statIcon}>👀</Text>
                <Text style={styles.statText}>{stats.views}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Author Info */}
      {authorName && (
        <View style={styles.authorContainer}>
          {authorAvatar && (
            <Image source={{ uri: authorAvatar }} style={styles.authorAvatar} />
          )}
          <Text style={styles.authorName}>{authorName}</Text>
        </View>
      )}

      {/* Branding */}
      {brandingVisible && (
        <View style={styles.branding}>
          <View style={styles.brandingLogo}>
            <Text style={styles.brandingIcon}>🌟</Text>
            <Text style={styles.brandingText}>SignalSpot</Text>
          </View>
          <Text style={styles.brandingTagline}>특별한 순간을 발견하세요</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: DesignSystem.colors.background.primary,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },

  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  getGradientForType: (type: string) => {
    switch (type) {
      case 'spot':
        return { backgroundColor: '#667eea' }; // Blue gradient
      case 'spark':
        return { backgroundColor: '#f093fb' }; // Pink gradient
      case 'profile':
        return { backgroundColor: '#4facfe' }; // Light blue gradient
      default:
        return { backgroundColor: '#667eea' };
    }
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DesignSystem.spacing.md,
    paddingBottom: DesignSystem.spacing.sm,
  },

  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: 20,
  },

  typeIcon: {
    fontSize: 16,
    marginRight: DesignSystem.spacing.xs,
  },

  typeLabel: {
    ...DesignSystem.typography.caption,
    fontWeight: '600',
    color: DesignSystem.colors.text.primary,
  },

  timestamp: {
    ...DesignSystem.typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  content: {
    flex: 1,
    padding: DesignSystem.spacing.md,
    paddingTop: 0,
  },

  title: {
    ...DesignSystem.typography.title2,
    fontWeight: '700',
    color: 'white',
    marginBottom: DesignSystem.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  description: {
    ...DesignSystem.typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: DesignSystem.spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  locationIcon: {
    fontSize: 14,
    marginRight: DesignSystem.spacing.xs,
  },

  locationText: {
    ...DesignSystem.typography.caption,
    color: 'white',
    fontWeight: '500',
  },

  statsContainer: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
  },

  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statIcon: {
    fontSize: 14,
    marginRight: DesignSystem.spacing.xs,
  },

  statText: {
    ...DesignSystem.typography.caption,
    color: 'white',
    fontWeight: '600',
  },

  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignSystem.spacing.md,
    paddingTop: 0,
  },

  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: DesignSystem.spacing.sm,
    borderWidth: 2,
    borderColor: 'white',
  },

  authorName: {
    ...DesignSystem.typography.body,
    color: 'white',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  branding: {
    position: 'absolute',
    bottom: DesignSystem.spacing.md,
    right: DesignSystem.spacing.md,
    alignItems: 'flex-end',
  },

  brandingLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: 12,
    marginBottom: DesignSystem.spacing.xs,
  },

  brandingIcon: {
    fontSize: 16,
    marginRight: DesignSystem.spacing.xs,
  },

  brandingText: {
    ...DesignSystem.typography.caption,
    fontWeight: '700',
    color: DesignSystem.colors.text.primary,
  },

  brandingTagline: {
    ...DesignSystem.typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

ShareableCard.displayName = 'ShareableCard';

export default ShareableCard;