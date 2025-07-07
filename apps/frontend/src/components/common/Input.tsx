import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { DesignSystem } from '../../utils/designSystem';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  size = 'medium',
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          styles[size],
          isFocused && styles.focused,
          hasError && styles.error,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        
        <TextInput
          style={[
            styles.input,
            styles[`${size}Text`],
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            inputStyle,
          ]}
          placeholderTextColor={DesignSystem.colors.text.placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...textInputProps}
        />
        
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      
      {(error || helperText) && (
        <Text style={[styles.helperText, hasError && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: DesignSystem.spacing.md,
  },
  label: {
    ...DesignSystem.typography.subheadline,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
    marginBottom: DesignSystem.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.light,
    borderRadius: DesignSystem.borderRadius.md,
    overflow: 'hidden',
  },
  small: {
    height: 36,
  },
  medium: {
    height: 48,
  },
  large: {
    height: 56,
  },
  input: {
    flex: 1,
    color: DesignSystem.colors.text.primary,
    paddingHorizontal: DesignSystem.spacing.md,
  },
  smallText: {
    ...DesignSystem.typography.subheadline,
  },
  mediumText: {
    ...DesignSystem.typography.body,
  },
  largeText: {
    ...DesignSystem.typography.callout,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  iconLeft: {
    paddingLeft: DesignSystem.spacing.md,
  },
  iconRight: {
    paddingRight: DesignSystem.spacing.md,
  },
  focused: {
    borderColor: DesignSystem.colors.border.focus,
  },
  error: {
    borderColor: DesignSystem.colors.danger,
  },
  helperText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.secondary,
    marginTop: DesignSystem.spacing.xs,
    marginLeft: DesignSystem.spacing.xs,
  },
  errorText: {
    color: DesignSystem.colors.danger,
  },
});