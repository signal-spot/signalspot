import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import styled from 'styled-components/native';
import { UserProfile, UpdateProfileRequest } from '../../services/profile.service';
import AvatarUpload from './AvatarUpload';

const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.View`
  background-color: #ffffff;
  margin: 20px;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  max-height: 80%;
`;

const ModalHeader = styled.View`
  padding: 20px 20px 0;
  border-bottom-width: 1px;
  border-bottom-color: #f0f0f0;
`;

const ModalTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 10px;
`;

const ModalBody = styled.ScrollView`
  padding: 20px;
`;

const InputGroup = styled.View`
  margin-bottom: 20px;
`;

const InputLabel = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.TextInput`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  color: #333;
  background-color: #ffffff;
`;

const TextArea = styled(Input)`
  height: 80px;
  text-align-vertical: top;
`;

const CharacterCount = styled.Text`
  font-size: 12px;
  color: #666;
  text-align: right;
  margin-top: 4px;
`;

const InterestsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 8px;
`;

const InterestTag = styled.TouchableOpacity<{ selected: boolean }>`
  background-color: ${props => props.selected ? '#ff6b6b' : '#f0f0f0'};
  padding: 8px 12px;
  border-radius: 16px;
  margin: 4px 4px 4px 0;
`;

const InterestTagText = styled.Text<{ selected: boolean }>`
  font-size: 14px;
  color: ${props => props.selected ? '#ffffff' : '#666'};
  font-weight: ${props => props.selected ? '600' : '400'};
`;

const SocialLinksContainer = styled.View`
  gap: 12px;
`;

const SocialLinkInput = styled.View`
  flex-direction: row;
  align-items: center;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 16px;
`;

const SocialLinkIcon = styled.Text`
  font-size: 16px;
  margin-right: 12px;
  width: 20px;
`;

const SocialLinkTextInput = styled.TextInput`
  flex: 1;
  font-size: 16px;
  color: #333;
`;

const ModalFooter = styled.View`
  flex-direction: row;
  padding: 20px;
  gap: 12px;
  border-top-width: 1px;
  border-top-color: #f0f0f0;
`;

const Button = styled.TouchableOpacity<{ variant: 'primary' | 'secondary'; disabled?: boolean }>`
  flex: 1;
  padding: 16px;
  border-radius: 8px;
  background-color: ${props => 
    props.disabled ? '#cccccc' :
    props.variant === 'primary' ? '#ff6b6b' : '#f0f0f0'
  };
  align-items: center;
`;

const ButtonText = styled.Text<{ variant: 'primary' | 'secondary'; disabled?: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => 
    props.disabled ? '#888888' :
    props.variant === 'primary' ? '#ffffff' : '#333333'
  };
`;

interface ProfileEditModalProps {
  visible: boolean;
  profile: UserProfile | null;
  onClose: () => void;
  onSave: (data: UpdateProfileRequest) => Promise<void>;
  onUploadAvatar?: (imageData: { uri: string; type: string; name: string }) => Promise<void>;
  onRemoveAvatar?: () => Promise<void>;
  isLoading?: boolean;
}

const SUGGESTED_INTERESTS = [
  '음악', '영화', '독서', '여행', '요리', '운동', '게임', '사진',
  '미술', '춤', '패션', '테크', '스포츠', '자연', '카페', '맛집'
];

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  visible,
  profile,
  onClose,
  onSave,
  onUploadAvatar,
  onRemoveAvatar,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    firstName: '',
    lastName: '',
    bio: '',
    interests: [],
    socialLinks: {
      instagram: '',
      twitter: '',
      linkedin: '',
      website: '',
    },
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.bio || '',
        interests: profile.interests || [],
        socialLinks: profile.socialLinks || {
          instagram: '',
          twitter: '',
          linkedin: '',
          website: '',
        },
      });
      setSelectedInterests(profile.interests || []);
    }
  }, [profile]);

  const handleInputChange = (field: keyof UpdateProfileRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  const toggleInterest = (interest: string) => {
    const newInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest];
    
    setSelectedInterests(newInterests);
    handleInputChange('interests', newInterests);
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.firstName?.trim()) {
        Alert.alert('오류', '이름을 입력해주세요.');
        return;
      }

      // Clean up social links (remove empty ones)
      const cleanSocialLinks = Object.entries(formData.socialLinks || {})
        .reduce((acc, [key, value]) => {
          if (value?.trim()) {
            acc[key] = value.trim();
          }
          return acc;
        }, {} as any);

      const dataToSave = {
        ...formData,
        firstName: formData.firstName?.trim(),
        lastName: formData.lastName?.trim(),
        bio: formData.bio?.trim(),
        socialLinks: Object.keys(cleanSocialLinks).length > 0 ? cleanSocialLinks : undefined,
      };

      await onSave(dataToSave);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Error saving profile:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ModalContainer>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>프로필 편집</ModalTitle>
            </ModalHeader>

            <ModalBody showsVerticalScrollIndicator={false}>
              {/* Avatar Upload Section */}
              {onUploadAvatar && (
                <AvatarUpload
                  avatarUrl={profile?.avatarUrl}
                  firstName={profile?.firstName}
                  lastName={profile?.lastName}
                  onUpload={onUploadAvatar}
                  onRemove={onRemoveAvatar}
                  isLoading={isLoading}
                  editable={true}
                />
              )}

              <InputGroup>
                <InputLabel>이름 *</InputLabel>
                <Input
                  value={formData.firstName}
                  onChangeText={(text) => handleInputChange('firstName', text)}
                  placeholder="이름을 입력하세요"
                  maxLength={50}
                />
              </InputGroup>

              <InputGroup>
                <InputLabel>성</InputLabel>
                <Input
                  value={formData.lastName}
                  onChangeText={(text) => handleInputChange('lastName', text)}
                  placeholder="성을 입력하세요"
                  maxLength={50}
                />
              </InputGroup>

              <InputGroup>
                <InputLabel>자기소개</InputLabel>
                <TextArea
                  value={formData.bio}
                  onChangeText={(text) => handleInputChange('bio', text)}
                  placeholder="자신을 소개해보세요"
                  multiline
                  maxLength={500}
                />
                <CharacterCount>{formData.bio?.length || 0}/500</CharacterCount>
              </InputGroup>

              <InputGroup>
                <InputLabel>관심사</InputLabel>
                <InterestsContainer>
                  {SUGGESTED_INTERESTS.map((interest) => (
                    <InterestTag
                      key={interest}
                      selected={selectedInterests.includes(interest)}
                      onPress={() => toggleInterest(interest)}
                    >
                      <InterestTagText selected={selectedInterests.includes(interest)}>
                        {interest}
                      </InterestTagText>
                    </InterestTag>
                  ))}
                </InterestsContainer>
              </InputGroup>

              <InputGroup>
                <InputLabel>소셜 링크</InputLabel>
                <SocialLinksContainer>
                  <SocialLinkInput>
                    <SocialLinkIcon>📷</SocialLinkIcon>
                    <SocialLinkTextInput
                      value={formData.socialLinks?.instagram || ''}
                      onChangeText={(text) => handleSocialLinkChange('instagram', text)}
                      placeholder="Instagram 프로필 URL"
                      autoCapitalize="none"
                      keyboardType="url"
                    />
                  </SocialLinkInput>

                  <SocialLinkInput>
                    <SocialLinkIcon>🐦</SocialLinkIcon>
                    <SocialLinkTextInput
                      value={formData.socialLinks?.twitter || ''}
                      onChangeText={(text) => handleSocialLinkChange('twitter', text)}
                      placeholder="Twitter 프로필 URL"
                      autoCapitalize="none"
                      keyboardType="url"
                    />
                  </SocialLinkInput>

                  <SocialLinkInput>
                    <SocialLinkIcon>💼</SocialLinkIcon>
                    <SocialLinkTextInput
                      value={formData.socialLinks?.linkedin || ''}
                      onChangeText={(text) => handleSocialLinkChange('linkedin', text)}
                      placeholder="LinkedIn 프로필 URL"
                      autoCapitalize="none"
                      keyboardType="url"
                    />
                  </SocialLinkInput>

                  <SocialLinkInput>
                    <SocialLinkIcon>🌐</SocialLinkIcon>
                    <SocialLinkTextInput
                      value={formData.socialLinks?.website || ''}
                      onChangeText={(text) => handleSocialLinkChange('website', text)}
                      placeholder="개인 웹사이트 URL"
                      autoCapitalize="none"
                      keyboardType="url"
                    />
                  </SocialLinkInput>
                </SocialLinksContainer>
              </InputGroup>
            </ModalBody>

            <ModalFooter>
              <Button variant="secondary" onPress={onClose} disabled={isLoading}>
                <ButtonText variant="secondary" disabled={isLoading}>취소</ButtonText>
              </Button>
              <Button variant="primary" onPress={handleSave} disabled={isLoading}>
                <ButtonText variant="primary" disabled={isLoading}>
                  {isLoading ? '저장 중...' : '저장'}
                </ButtonText>
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalContainer>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ProfileEditModal;