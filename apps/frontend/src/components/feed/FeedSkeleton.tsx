import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { DesignSystem } from '../../utils/designSystem';

export const FeedSkeleton: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => startAnimation());
    };

    startAnimation();
  }, [fadeAnim]);

  const SkeletonBox: React.FC<{ style: any }> = ({ style }) => (
    <Animated.View
      style={[
        styles.skeleton,
        style,
        { opacity: fadeAnim }
      ]}
    />
  );

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.authorContainer}>
          <SkeletonBox style={styles.avatar} />
          <View style={styles.authorInfo}>
            <SkeletonBox style={styles.authorName} />
            <SkeletonBox style={styles.authorMeta} />
          </View>
        </View>
        <SkeletonBox style={styles.typeBadge} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <SkeletonBox style={styles.title} />
        <SkeletonBox style={styles.titleSecondLine} />
        <View style={styles.spacer} />
        <SkeletonBox style={styles.description} />
        <SkeletonBox style={styles.descriptionSecond} />
        <SkeletonBox style={styles.descriptionThird} />
        <View style={styles.spacer} />
        
        {/* Location */}
        <SkeletonBox style={styles.location} />
        <View style={styles.spacer} />
        
        {/* Tags */}
        <View style={styles.tagsContainer}>
          <SkeletonBox style={styles.tag} />
          <SkeletonBox style={styles.tag} />
          <SkeletonBox style={styles.tagSmall} />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.separator} />
        <View style={styles.actionsContent}>
          <SkeletonBox style={styles.stats} />
          <View style={styles.actionButtons}>
            <SkeletonBox style={styles.actionButton} />
            <SkeletonBox style={styles.actionButton} />
            <SkeletonBox style={styles.actionButton} />
          </View>
        </View>
      </View>
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
  skeleton: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: 4,
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: DesignSystem.spacing.md,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    height: 16,
    width: '60%',
    marginBottom: 4,
    borderRadius: 2,
  },
  authorMeta: {
    height: 12,
    width: '40%',
    borderRadius: 2,
  },
  typeBadge: {
    width: 60,
    height: 24,
    borderRadius: 12,
  },
  content: {
    marginBottom: DesignSystem.spacing.md,
  },
  title: {
    height: 20,
    width: '85%',
    marginBottom: 4,
    borderRadius: 2,
  },
  titleSecondLine: {
    height: 20,
    width: '60%',
    marginBottom: DesignSystem.spacing.sm,
    borderRadius: 2,
  },
  description: {
    height: 16,
    width: '100%',
    marginBottom: 4,
    borderRadius: 2,
  },
  descriptionSecond: {
    height: 16,
    width: '90%',
    marginBottom: 4,
    borderRadius: 2,
  },
  descriptionThird: {
    height: 16,
    width: '70%',
    marginBottom: DesignSystem.spacing.sm,
    borderRadius: 2,
  },
  location: {
    height: 14,
    width: '50%',
    borderRadius: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: DesignSystem.spacing.sm,
  },
  tag: {
    height: 24,
    width: 60,
    borderRadius: 12,
    marginRight: DesignSystem.spacing.xs,
  },
  tagSmall: {
    height: 24,
    width: 40,
    borderRadius: 12,
  },
  spacer: {
    height: DesignSystem.spacing.sm,
  },
  actions: {
    marginTop: DesignSystem.spacing.md,
  },
  separator: {
    height: 1,
    backgroundColor: DesignSystem.colors.background.secondary,
    marginBottom: DesignSystem.spacing.md,
  },
  actionsContent: {
    gap: DesignSystem.spacing.sm,
  },
  stats: {
    height: 14,
    width: '70%',
    borderRadius: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    height: 32,
    width: '30%',
    borderRadius: 8,
  },
});