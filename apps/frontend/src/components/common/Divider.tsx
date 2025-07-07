import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { DesignSystem } from '../../utils/designSystem';

export interface DividerProps {
  style?: ViewStyle;
  color?: string;
  thickness?: number;
  spacing?: keyof typeof DesignSystem.spacing;
  orientation?: 'horizontal' | 'vertical';
}

export const Divider: React.FC<DividerProps> = ({
  style,
  color = DesignSystem.colors.border.light,
  thickness = 1,
  spacing = 'md',
  orientation = 'horizontal',
}) => {
  const dividerStyles = [
    styles.base,
    orientation === 'horizontal' ? styles.horizontal : styles.vertical,
    {
      backgroundColor: color,
      [orientation === 'horizontal' ? 'height' : 'width']: thickness,
      [orientation === 'horizontal' ? 'marginVertical' : 'marginHorizontal']: DesignSystem.spacing[spacing],
    },
    style,
  ];

  return <View style={dividerStyles} />;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: DesignSystem.colors.border.light,
  },
  horizontal: {
    width: '100%',
    height: 1,
  },
  vertical: {
    width: 1,
    height: '100%',
  },
});