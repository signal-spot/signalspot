import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SacredSite, SiteTier, sacredSiteService } from '../../services/sacred-site.service';
import { DesignSystem } from '../../utils/designSystem';

interface SacredSiteMarkerProps {
  site: SacredSite;
  onPress: (site: SacredSite) => void;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  selected?: boolean;
  animatedValue?: Animated.Value;
}

export const SacredSiteMarker: React.FC<SacredSiteMarkerProps> = ({
  site,
  onPress,
  size = 'medium',
  showLabel = true,
  selected = false,
  animatedValue,
}) => {
  const tierColor = sacredSiteService.getTierColor(site.tier);
  const tierIcon = sacredSiteService.getTierIcon(site.tier);
  const tierName = sacredSiteService.getTierDisplayName(site.tier);

  const getMarkerSize = () => {
    const sizes = {
      small: 24,
      medium: 32,
      large: 40,
    };
    return sizes[size];
  };

  const getMarkerStyle = () => {
    const markerSize = getMarkerSize();
    const baseStyle = {
      width: markerSize,
      height: markerSize,
      borderRadius: markerSize / 2,
      backgroundColor: tierColor,
    };

    if (selected) {
      return {
        ...baseStyle,
        borderWidth: 3,
        borderColor: DesignSystem.colors.primary,
        shadowColor: DesignSystem.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
      };
    }

    return baseStyle;
  };

  const getIconSize = () => {
    const iconSizes = {
      small: 12,
      medium: 16,
      large: 20,
    };
    return iconSizes[size];
  };

  const getGlowEffect = () => {
    if (site.tier === SiteTier.LEGENDARY) {
      return styles.legendaryGlow;
    }
    if (site.tier === SiteTier.MAJOR) {
      return styles.majorGlow;
    }
    return null;
  };

  const renderMarker = () => {
    const markerStyle = getMarkerStyle();
    const iconSize = getIconSize();
    const glowStyle = getGlowEffect();

    const marker = (
      <TouchableOpacity
        style={[styles.markerContainer, glowStyle]}
        onPress={() => onPress(site)}
        activeOpacity={0.8}
      >
        <View style={[styles.marker, markerStyle]}>
          <Text style={[styles.markerIcon, { fontSize: iconSize }]}>
            {tierIcon}
          </Text>
        </View>
        
        {/* Score indicator for larger markers */}
        {size !== 'small' && (
          <View style={[styles.scoreIndicator, { borderColor: tierColor }]}>
            <Text style={styles.scoreText}>
              {Math.round(site.metrics.totalScore)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );

    // Add animation if provided
    if (animatedValue) {
      return (
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              transform: [
                {
                  scale: animatedValue.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.8, 1.2, 1],
                  }),
                },
              ],
              opacity: animatedValue,
            },
          ]}
        >
          {marker}
        </Animated.View>
      );
    }

    return marker;
  };

  const renderLabel = () => {
    if (!showLabel || size === 'small') return null;

    return (
      <View style={[styles.label, selected && styles.selectedLabel]}>
        <Text style={[styles.labelText, selected && styles.selectedLabelText]} numberOfLines={1}>
          {site.name}
        </Text>
        <Text style={[styles.labelSubtext, selected && styles.selectedLabelSubtext]}>
          {tierName} • {site.metrics.visitCount}회 방문
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderMarker()}
      {renderLabel()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  animatedContainer: {
    alignItems: 'center',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerIcon: {
    fontWeight: 'bold',
  },
  scoreIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: DesignSystem.colors.background.primary,
    borderWidth: 2,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  scoreText: {
    ...DesignSystem.typography.caption2,
    color: DesignSystem.colors.text.primary,
    fontWeight: '700',
    fontSize: 10,
  },
  label: {
    marginTop: DesignSystem.spacing.xs,
    backgroundColor: DesignSystem.colors.background.primary,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: DesignSystem.colors.background.secondary,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedLabel: {
    borderColor: DesignSystem.colors.primary,
    backgroundColor: DesignSystem.colors.primary + '10',
  },
  labelText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedLabelText: {
    color: DesignSystem.colors.primary,
  },
  labelSubtext: {
    ...DesignSystem.typography.caption2,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginTop: 2,
  },
  selectedLabelSubtext: {
    color: DesignSystem.colors.primary,
  },
  legendaryGlow: {
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 12,
  },
  majorGlow: {
    shadowColor: '#C0C0C0',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
});