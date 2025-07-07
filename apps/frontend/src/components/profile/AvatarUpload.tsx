import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import styled from 'styled-components/native';

const AvatarContainer = styled.View`
  align-items: center;
  margin-bottom: 20px;
`;

const AvatarWrapper = styled.TouchableOpacity`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 60px;
  overflow: hidden;
  border: 3px solid #ffffff;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const AvatarImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const AvatarPlaceholder = styled.View`
  width: 100%;
  height: 100%;
  background-color: #ff6b6b;
  justify-content: center;
  align-items: center;
`;

const AvatarPlaceholderText = styled.Text`
  font-size: 36px;
  color: #ffffff;
  font-weight: bold;
`;

const EditOverlay = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 8px;
  align-items: center;
`;

const EditOverlayText = styled.Text`
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
`;

const AvatarActions = styled.View`
  flex-direction: row;
  gap: 12px;
  margin-top: 12px;
`;

const ActionButton = styled.TouchableOpacity<{ variant: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border-radius: 16px;
  background-color: ${props => props.variant === 'primary' ? '#ff6b6b' : '#f0f0f0'};
`;

const ActionButtonText = styled.Text<{ variant: 'primary' | 'secondary' }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.variant === 'primary' ? '#ffffff' : '#333333'};
`;

const LoadingOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  border-radius: 60px;
`;

const LoadingText = styled.Text`
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  margin-top: 8px;
`;

interface AvatarUploadProps {
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  onUpload: (imageData: { uri: string; type: string; name: string }) => Promise<void>;
  onRemove?: () => Promise<void>;
  isLoading?: boolean;
  editable?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  avatarUrl,
  firstName,
  lastName,
  onUpload,
  onRemove,
  isLoading = false,
  editable = true,
}) => {
  const [uploading, setUploading] = useState(false);

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const showImagePicker = () => {
    if (!editable) return;

    const options = [
      '카메라로 촬영',
      '갤러리에서 선택',
      ...(avatarUrl ? ['현재 사진 삭제'] : []),
      '취소',
    ];

    const destructiveButtonIndex = avatarUrl ? 2 : -1;
    const cancelButtonIndex = options.length - 1;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            openCamera();
          } else if (buttonIndex === 1) {
            openImageLibrary();
          } else if (buttonIndex === destructiveButtonIndex && onRemove) {
            handleRemoveAvatar();
          }
        }
      );
    } else {
      // For Android, we'll show a simple alert
      Alert.alert(
        '프로필 사진 설정',
        '프로필 사진을 어떻게 설정하시겠습니까?',
        [
          { text: '카메라로 촬영', onPress: openCamera },
          { text: '갤러리에서 선택', onPress: openImageLibrary },
          ...(avatarUrl && onRemove ? [{ text: '현재 사진 삭제', onPress: handleRemoveAvatar, style: 'destructive' }] : []),
          { text: '취소', style: 'cancel' },
        ]
      );
    }
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
    };

    launchCamera(options, handleImageResponse);
  };

  const openImageLibrary = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
    };

    launchImageLibrary(options, handleImageResponse);
  };

  const handleImageResponse = async (response: ImagePickerResponse) => {
    if (response.didCancel || response.errorMessage) {
      return;
    }

    const asset = response.assets?.[0];
    if (!asset || !asset.uri) {
      Alert.alert('오류', '이미지를 선택할 수 없습니다.');
      return;
    }

    // Validate file size (5MB limit)
    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
      Alert.alert('오류', '이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    // Validate file type
    if (asset.type && !asset.type.startsWith('image/')) {
      Alert.alert('오류', '이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    try {
      setUploading(true);
      
      const imageData = {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `avatar_${Date.now()}.jpg`,
      };

      await onUpload(imageData);
      Alert.alert('성공', '프로필 사진이 업데이트되었습니다.');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('오류', '프로필 사진 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!onRemove) return;

    Alert.alert(
      '프로필 사진 삭제',
      '정말로 프로필 사진을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await onRemove();
              Alert.alert('성공', '프로필 사진이 삭제되었습니다.');
            } catch (error) {
              console.error('Error removing avatar:', error);
              Alert.alert('오류', '프로필 사진 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const isProcessing = isLoading || uploading;

  return (
    <AvatarContainer>
      <AvatarWrapper onPress={showImagePicker} disabled={!editable || isProcessing}>
        {avatarUrl ? (
          <AvatarImage source={{ uri: avatarUrl }} />
        ) : (
          <AvatarPlaceholder>
            <AvatarPlaceholderText>{getInitials()}</AvatarPlaceholderText>
          </AvatarPlaceholder>
        )}
        
        {editable && (
          <EditOverlay>
            <EditOverlayText>편집</EditOverlayText>
          </EditOverlay>
        )}

        {isProcessing && (
          <LoadingOverlay>
            <LoadingText>{uploading ? '업로드 중...' : '처리 중...'}</LoadingText>
          </LoadingOverlay>
        )}
      </AvatarWrapper>

      {editable && !isProcessing && (
        <AvatarActions>
          <ActionButton variant="primary" onPress={showImagePicker}>
            <ActionButtonText variant="primary">
              {avatarUrl ? '변경' : '추가'}
            </ActionButtonText>
          </ActionButton>
          
          {avatarUrl && onRemove && (
            <ActionButton variant="secondary" onPress={handleRemoveAvatar}>
              <ActionButtonText variant="secondary">삭제</ActionButtonText>
            </ActionButton>
          )}
        </AvatarActions>
      )}
    </AvatarContainer>
  );
};

export default AvatarUpload;