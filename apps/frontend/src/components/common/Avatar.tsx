import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { DesignSystem } from '../../utils/designSystem';

export interface AvatarProps {
  source?: { uri: string } | number;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  style?: ViewStyle;
  onPress?: () => void;
  showBorder?: boolean;
  borderColor?: string;
  backgroundColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'medium',
  style,
  onPress,
  showBorder = false,
  borderColor = DesignSystem.colors.primary,
  backgroundColor = DesignSystem.colors.primary,
}) => {
  const getInitials = (name: string) => {
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
  };

  const avatarStyles = [
    styles.container,
    styles[size],
    showBorder && { borderWidth: 2, borderColor },
    !source && { backgroundColor },
    style,
  ];

  const content = source ? (
    <Image source={source} style={styles.image} />
  ) : (
    <Text style={[styles.initials, styles[`${size}Text`]]}>
      {name ? getInitials(name) : '?'}
    </Text>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={avatarStyles} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={avatarStyles}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  small: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  medium: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  large: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  xlarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  initials: {
    color: DesignSystem.colors.text.inverse,
    fontWeight: '600',
  },
  smallText: {
    ...DesignSystem.typography.caption1,
  },
  mediumText: {
    ...DesignSystem.typography.subheadline,
  },
  largeText: {
    ...DesignSystem.typography.title3,
  },
  xlargeText: {
    ...DesignSystem.typography.title1,
  },
});