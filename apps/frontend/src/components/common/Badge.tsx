import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { DesignSystem } from '../../utils/designSystem';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'small' | 'medium';
  dot?: boolean;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  dot = false,
  style,
}) => {
  if (dot) {
    return (
      <View
        style={[
          styles.dot,
          styles[`${variant}Dot`],
          size === 'small' && styles.smallDot,
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        styles[variant],
        styles[size],
        style,
      ]}
    >
      <Text style={[styles.text, styles[`${size}Text`], styles[`${variant}Text`]]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.full,
    alignSelf: 'flex-start',
  },
  
  // Sizes
  small: {
    paddingHorizontal: DesignSystem.spacing.xs,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
  },
  
  // Variants
  primary: {
    backgroundColor: DesignSystem.colors.primary,
  },
  secondary: {
    backgroundColor: DesignSystem.colors.secondary,
  },
  success: {
    backgroundColor: DesignSystem.colors.success,
  },
  warning: {
    backgroundColor: DesignSystem.colors.warning,
  },
  danger: {
    backgroundColor: DesignSystem.colors.danger,
  },
  info: {
    backgroundColor: DesignSystem.colors.info,
  },
  
  // Text
  text: {
    fontWeight: '600',
  },
  smallText: {
    ...DesignSystem.typography.caption2,
  },
  mediumText: {
    ...DesignSystem.typography.caption1,
  },
  primaryText: {
    color: DesignSystem.colors.text.inverse,
  },
  secondaryText: {
    color: DesignSystem.colors.text.inverse,
  },
  successText: {
    color: DesignSystem.colors.text.inverse,
  },
  warningText: {
    color: DesignSystem.colors.text.inverse,
  },
  dangerText: {
    color: DesignSystem.colors.text.inverse,
  },
  infoText: {
    color: DesignSystem.colors.text.inverse,
  },
  
  // Dot
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  smallDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  primaryDot: {
    backgroundColor: DesignSystem.colors.primary,
  },
  secondaryDot: {
    backgroundColor: DesignSystem.colors.secondary,
  },
  successDot: {
    backgroundColor: DesignSystem.colors.success,
  },
  warningDot: {
    backgroundColor: DesignSystem.colors.warning,
  },
  dangerDot: {
    backgroundColor: DesignSystem.colors.danger,
  },
  infoDot: {
    backgroundColor: DesignSystem.colors.info,
  },
});