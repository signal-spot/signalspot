import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { useProfile } from '../../providers/ProfileProvider';
import ProfileEditModal from '../../components/profile/ProfileEditModal';
import ProfileCompletionCard from '../../components/profile/ProfileCompletionCard';
import styled from 'styled-components/native';

// Styled components
const Container = styled.ScrollView`
  flex: 1;
  background-color: #f5f5f5;
`;

const HeaderContainer = styled.View`
  background-color: #ffffff;
  padding: 60px 20px 20px;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #e0e0e0;
`;

const ProfileImage = styled.View`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  background-color: #ff6b6b;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
`;

const ProfileImageText = styled.Text`
  font-size: 36px;
  color: #ffffff;
  font-weight: bold;
`;

const UserName = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const UserEmail = styled.Text`
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
`;

const EditProfileButton = styled.TouchableOpacity`
  background-color: #ff6b6b;
  padding: 10px 20px;
  border-radius: 20px;
`;

const EditProfileButtonText = styled.Text`
  color: #ffffff;
  font-size: 14px;
  font-weight: bold;
`;

const Section = styled.View`
  background-color: #ffffff;
  margin: 10px 0;
  padding: 20px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
`;

const SettingRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom-width: 1px;
  border-bottom-color: #f0f0f0;
`;

const SettingLabel = styled.Text`
  font-size: 16px;
  color: #333;
  flex: 1;
`;

const SettingValue = styled.Text`
  font-size: 16px;
  color: #666;
  margin-right: 10px;
`;

const LogoutButton = styled.TouchableOpacity`
  background-color: #ff4444;
  margin: 20px;
  padding: 15px;
  border-radius: 8px;
  align-items: center;
`;

const LogoutButtonText = styled.Text`
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
`;

const Modal = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.View`
  background-color: #ffffff;
  margin: 20px;
  padding: 20px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
`;

const ModalTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
`;

const InputContainer = styled.View`
  margin-bottom: 15px;
`;

const InputLabel = styled.Text`
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
`;

const Input = styled.TextInput`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
`;

const ModalButtonRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  gap: 10px;
  margin-top: 20px;
`;

const ModalButton = styled.TouchableOpacity<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 15px;
  border-radius: 8px;
  background-color: ${props => props.variant === 'primary' ? '#ff6b6b' : '#f0f0f0'};
  align-items: center;
`;

const ModalButtonText = styled.Text<{ variant?: 'primary' | 'secondary' }>`
  font-size: 16px;
  font-weight: bold;
  color: ${props => props.variant === 'primary' ? '#ffffff' : '#333333'};
`;

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    profile,
    analytics,
    isLoading,
    isUpdating,
    profileCompletionPercentage,
    refreshProfile,
    updateProfile,
    updateProfileSettings,
    updateProfileVisibility,
    getProfileAnalytics,
    error,
    clearError,
  } = useProfile();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [settings, setSettings] = useState({
    isPublicProfile: false,
    allowMessagesFromStrangers: false,
    showOnlineStatus: true,
    showProfileViewers: true,
  });

  useEffect(() => {
    if (profile) {
      setSettings({
        isPublicProfile: profile.isPublicProfile || false,
        allowMessagesFromStrangers: profile.allowMessagesFromStrangers || false,
        showOnlineStatus: profile.showOnlineStatus !== false,
        showProfileViewers: profile.showProfileViewers !== false,
      });
    }
  }, [profile]);

  useEffect(() => {
    if (error) {
      Alert.alert('오류', error, [{ text: '확인', onPress: clearError }]);
    }
  }, [error, clearError]);

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = async (data: any) => {
    await updateProfile(data);
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말로 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '로그아웃', onPress: logout, style: 'destructive' }
      ]
    );
  };

  const handleSettingToggle = async (setting: keyof typeof settings) => {
    const newValue = !settings[setting];
    
    // Update local state immediately for better UX
    setSettings(prev => ({
      ...prev,
      [setting]: newValue,
    }));

    try {
      await updateProfileSettings({
        [setting]: newValue,
      });
    } catch (error) {
      // Revert on error
      setSettings(prev => ({
        ...prev,
        [setting]: !newValue,
      }));
    }
  };

  const handleVisibilityChange = async (visibility: 'public' | 'friends' | 'private') => {
    try {
      await updateProfileVisibility(visibility);
    } catch (error) {
      // Error handling is done in the provider
    }
  };

  const handleViewAnalytics = async () => {
    if (!analytics) {
      await getProfileAnalytics();
    }
    setShowAnalytics(true);
  };

  const onRefresh = async () => {
    await refreshProfile();
  };

  if (!user || !profile) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {isLoading ? '프로필을 불러오는 중...' : '사용자 정보를 불러오는 중...'}
          </Text>
        </View>
      </Container>
    );
  }

  const getInitials = (firstName?: string, lastName?: string, fallback = 'U') => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return fallback;
  };

  const getFullName = () => {
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    } else if (profile.firstName) {
      return profile.firstName;
    } else if (user?.username) {
      return user.username;
    }
    return '사용자';
  };

  const getMissingFields = () => {
    const missing = [];
    if (!profile.bio) missing.push('bio');
    if (!profile.interests || profile.interests.length === 0) missing.push('interests');
    if (!profile.avatarUrl) missing.push('avatarUrl');
    if (!profile.location) missing.push('location');
    if (!profile.socialLinks || Object.keys(profile.socialLinks).length === 0) missing.push('socialLinks');
    return missing;
  };

  return (
    <Container
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
    >
      <HeaderContainer>
        <ProfileImage>
          <ProfileImageText>
            {getInitials(profile.firstName, profile.lastName)}
          </ProfileImageText>
        </ProfileImage>
        <UserName>{getFullName()}</UserName>
        <UserEmail>{user.email}</UserEmail>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <EditProfileButton onPress={handleEditProfile}>
            <EditProfileButtonText>프로필 편집</EditProfileButtonText>
          </EditProfileButton>
          <EditProfileButton onPress={handleViewAnalytics}>
            <EditProfileButtonText>통계 보기</EditProfileButtonText>
          </EditProfileButton>
        </View>
      </HeaderContainer>

      {/* Profile Completion Card */}
      <ProfileCompletionCard
        percentage={profileCompletionPercentage}
        onEditProfile={handleEditProfile}
        missingFields={getMissingFields()}
      />

      <Section>
        <SectionTitle>프로필 정보</SectionTitle>
        <SettingRow>
          <SettingLabel>이름</SettingLabel>
          <SettingValue>{getFullName()}</SettingValue>
        </SettingRow>
        <SettingRow>
          <SettingLabel>자기소개</SettingLabel>
          <SettingValue>{profile.bio || '설정 안함'}</SettingValue>
        </SettingRow>
        <SettingRow>
          <SettingLabel>관심사</SettingLabel>
          <SettingValue>
            {profile.interests?.length ? profile.interests.join(', ') : '설정 안함'}
          </SettingValue>
        </SettingRow>
        <SettingRow>
          <SettingLabel>위치</SettingLabel>
          <SettingValue>{profile.location || '설정 안함'}</SettingValue>
        </SettingRow>
        <SettingRow>
          <SettingLabel>프로필 조회수</SettingLabel>
          <SettingValue>{profile.profileViews || 0}회</SettingValue>
        </SettingRow>
        <SettingRow>
          <SettingLabel>가입일</SettingLabel>
          <SettingValue>
            {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '알 수 없음'}
          </SettingValue>
        </SettingRow>
      </Section>

      <Section>
        <SectionTitle>프라이버시 설정</SectionTitle>
        <SettingRow>
          <SettingLabel>공개 프로필</SettingLabel>
          <Switch
            value={settings.isPublicProfile}
            onValueChange={() => handleSettingToggle('isPublicProfile')}
            trackColor={{ false: '#767577', true: '#ff6b6b' }}
            thumbColor={settings.isPublicProfile ? '#ffffff' : '#f4f3f4'}
            disabled={isUpdating}
          />
        </SettingRow>
        <SettingRow>
          <SettingLabel>낯선 사람의 메시지 허용</SettingLabel>
          <Switch
            value={settings.allowMessagesFromStrangers}
            onValueChange={() => handleSettingToggle('allowMessagesFromStrangers')}
            trackColor={{ false: '#767577', true: '#ff6b6b' }}
            thumbColor={settings.allowMessagesFromStrangers ? '#ffffff' : '#f4f3f4'}
            disabled={isUpdating}
          />
        </SettingRow>
        <SettingRow>
          <SettingLabel>온라인 상태 표시</SettingLabel>
          <Switch
            value={settings.showOnlineStatus}
            onValueChange={() => handleSettingToggle('showOnlineStatus')}
            trackColor={{ false: '#767577', true: '#ff6b6b' }}
            thumbColor={settings.showOnlineStatus ? '#ffffff' : '#f4f3f4'}
            disabled={isUpdating}
          />
        </SettingRow>
        <SettingRow>
          <SettingLabel>프로필 방문자 표시</SettingLabel>
          <Switch
            value={settings.showProfileViewers}
            onValueChange={() => handleSettingToggle('showProfileViewers')}
            trackColor={{ false: '#767577', true: '#ff6b6b' }}
            thumbColor={settings.showProfileViewers ? '#ffffff' : '#f4f3f4'}
            disabled={isUpdating}
          />
        </SettingRow>
      </Section>

      <Section>
        <SectionTitle>프로필 공개 범위</SectionTitle>
        <SettingRow>
          <TouchableOpacity onPress={() => handleVisibilityChange('public')}>
            <SettingLabel>🌍 전체 공개</SettingLabel>
          </TouchableOpacity>
        </SettingRow>
        <SettingRow>
          <TouchableOpacity onPress={() => handleVisibilityChange('friends')}>
            <SettingLabel>👥 친구만</SettingLabel>
          </TouchableOpacity>
        </SettingRow>
        <SettingRow>
          <TouchableOpacity onPress={() => handleVisibilityChange('private')}>
            <SettingLabel>🔒 비공개</SettingLabel>
          </TouchableOpacity>
        </SettingRow>
      </Section>

      <Section>
        <SectionTitle>계정</SectionTitle>
        <SettingRow>
          <SettingLabel>비밀번호 변경</SettingLabel>
          <Text style={styles.arrowText}>›</Text>
        </SettingRow>
        <SettingRow>
          <SettingLabel>개인정보 처리방침</SettingLabel>
          <Text style={styles.arrowText}>›</Text>
        </SettingRow>
        <SettingRow>
          <SettingLabel>서비스 이용약관</SettingLabel>
          <Text style={styles.arrowText}>›</Text>
        </SettingRow>
        <SettingRow>
          <SettingLabel>문의하기</SettingLabel>
          <Text style={styles.arrowText}>›</Text>
        </SettingRow>
      </Section>

      <LogoutButton onPress={handleLogout}>
        <LogoutButtonText>로그아웃</LogoutButtonText>
      </LogoutButton>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        visible={showEditModal}
        profile={profile}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveProfile}
        onUploadAvatar={uploadAvatar}
        onRemoveAvatar={removeAvatar}
        isLoading={isUpdating}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  arrowText: {
    fontSize: 20,
    color: '#ccc',
  },
});

export default ProfileScreen;