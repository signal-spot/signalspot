import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import ShareModal from './ShareModal';
import { ShareContent } from '../../services/share.service';
import { DesignSystem } from '../../utils/designSystem';

interface ShareButtonProps {
  content: ShareContent;
  authorName?: string;
  authorAvatar?: string;
  stats?: {
    likes?: number;
    comments?: number;
    views?: number;
  };
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
  text?: string;
  onPress?: () => void;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  content,
  authorName,
  authorAvatar,
  stats,
  variant = 'ghost',
  size = 'medium',
  style,
  textStyle,
  icon = '📤',
  text = '공유',
  onPress,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingHorizontal = DesignSystem.spacing.sm;
        baseStyle.paddingVertical = DesignSystem.spacing.xs;
        baseStyle.minHeight = 32;
        break;
      case 'large':
        baseStyle.paddingHorizontal = DesignSystem.spacing.lg;
        baseStyle.paddingVertical = DesignSystem.spacing.md;
        baseStyle.minHeight = 48;
        break;
      default: // medium
        baseStyle.paddingHorizontal = DesignSystem.spacing.md;
        baseStyle.paddingVertical = DesignSystem.spacing.sm;
        baseStyle.minHeight = 40;
        break;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = DesignSystem.colors.primary;
        break;
      case 'secondary':
        baseStyle.backgroundColor = DesignSystem.colors.background.secondary;
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = DesignSystem.colors.primary;
        break;
      default: // ghost
        baseStyle.backgroundColor = 'transparent';
        break;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      marginLeft: icon ? DesignSystem.spacing.xs : 0,
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.fontSize = 14;
        break;
      case 'large':
        baseStyle.fontSize = 18;
        break;
      default: // medium
        baseStyle.fontSize = 16;
        break;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.color = 'white';
        break;
      case 'secondary':
        baseStyle.color = DesignSystem.colors.primary;
        break;
      default: // ghost
        baseStyle.color = DesignSystem.colors.text.secondary;
        break;
    }

    return baseStyle;
  };

  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 20;
      default: // medium
        return 16;
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[getButtonStyle(), style]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {icon && (
          <Text style={{ fontSize: getIconSize() }}>
            {icon}
          </Text>
        )}
        <Text style={[getTextStyle(), textStyle]}>
          {text}
        </Text>
      </TouchableOpacity>

      <ShareModal
        visible={modalVisible}
        onClose={handleCloseModal}
        content={content}
        authorName={authorName}
        authorAvatar={authorAvatar}
        stats={stats}
      />
    </>
  );
};

export default ShareButton;