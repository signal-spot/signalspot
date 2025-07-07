import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { DesignSystem } from '../../utils/designSystem';

export interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    isDisabled && styles[`${variant}Disabled`],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : DesignSystem.colors.primary}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={textStyles}>{children}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: DesignSystem.borderRadius.md,
    gap: DesignSystem.spacing.xs,
    ...DesignSystem.shadow.sm,
  },
  
  // Variants
  primary: {
    backgroundColor: DesignSystem.colors.primary,
  },
  secondary: {
    backgroundColor: DesignSystem.colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: DesignSystem.colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  danger: {
    backgroundColor: DesignSystem.colors.danger,
  },
  
  // Sizes
  small: {
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingVertical: DesignSystem.spacing.lg,
    minHeight: 56,
  },
  
  // States
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  primaryDisabled: {
    backgroundColor: DesignSystem.colors.border.medium,
  },
  secondaryDisabled: {
    backgroundColor: DesignSystem.colors.border.medium,
  },
  outlineDisabled: {
    borderColor: DesignSystem.colors.border.medium,
  },
  ghostDisabled: {},
  dangerDisabled: {
    backgroundColor: DesignSystem.colors.border.medium,
  },
  
  // Text styles
  text: {
    ...DesignSystem.typography.headline,
  },
  primaryText: {
    color: DesignSystem.colors.text.inverse,
  },
  secondaryText: {
    color: DesignSystem.colors.text.inverse,
  },
  outlineText: {
    color: DesignSystem.colors.primary,
  },
  ghostText: {
    color: DesignSystem.colors.primary,
  },
  dangerText: {
    color: DesignSystem.colors.text.inverse,
  },
  smallText: {
    ...DesignSystem.typography.subheadline,
  },
  mediumText: {
    ...DesignSystem.typography.headline,
  },
  largeText: {
    ...DesignSystem.typography.title3,
  },
  disabledText: {
    color: DesignSystem.colors.text.tertiary,
  },
});