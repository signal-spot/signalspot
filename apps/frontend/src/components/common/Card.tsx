import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { DesignSystem } from '../../utils/designSystem';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof DesignSystem.spacing;
  margin?: keyof typeof DesignSystem.spacing;
  shadow?: keyof typeof DesignSystem.shadow;
  borderRadius?: keyof typeof DesignSystem.borderRadius;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'md',
  margin,
  shadow = 'md',
  borderRadius = 'lg',
  onPress,
}) => {
  const cardStyles = [
    styles.base,
    {
      padding: DesignSystem.spacing[padding],
      margin: margin ? DesignSystem.spacing[margin] : undefined,
      borderRadius: DesignSystem.borderRadius[borderRadius],
      ...DesignSystem.shadow[shadow],
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.95}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: DesignSystem.colors.background.card,
    overflow: 'hidden',
  },
});