import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Switch,
} from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: '',
    bio: '',
    interests: '',
  });
  const [settings, setSettings] = useState({
    notifications: true,
    locationSharing: true,
    privateProfile: false,
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        nickname: user.nickname || '',
        bio: user.bio || '',
        interests: user.interests || '',
      });
    }
  }, [user]);

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      // TODO: Implement API call to update profile
      Alert.alert('성공', '프로필이 업데이트되었습니다.');
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('오류', '프로필 업데이트에 실패했습니다.');
    }
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

  const handleSettingToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  if (!user) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>사용자 정보를 불러오는 중...</Text>
        </View>
      </Container>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Container>
      <HeaderContainer>
        <ProfileImage>
          <ProfileImageText>
            {getInitials(user.nickname || user.email || 'U')}
          </ProfileImageText>
        </ProfileImage>
        <UserName>{user.nickname || '사용자'}</UserName>
        <UserEmail>{user.email}</UserEmail>
        <EditProfileButton onPress={handleEditProfile}>
          <EditProfileButtonText>프로필 편집</EditProfileButtonText>
        </EditProfileButton>
      </HeaderContainer>

      <Section>
        <SectionTitle>프로필 정보</SectionTitle>
        <SettingRow>
          <SettingLabel>닉네임</SettingLabel>
          <SettingValue>{user.nickname || '설정 안함'}</SettingValue>
        </SettingRow>
        <SettingRow>
          <SettingLabel>자기소개</SettingLabel>
          <SettingValue>{user.bio || '설정 안함'}</SettingValue>
        </SettingRow>
        <SettingRow>
          <SettingLabel>관심사</SettingLabel>
          <SettingValue>{user.interests || '설정 안함'}</SettingValue>
        </SettingRow>
        <SettingRow>
          <SettingLabel>가입일</SettingLabel>
          <SettingValue>
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '알 수 없음'}
          </SettingValue>
        </SettingRow>
      </Section>

      <Section>
        <SectionTitle>설정</SectionTitle>
        <SettingRow>
          <SettingLabel>푸시 알림</SettingLabel>
          <Switch
            value={settings.notifications}
            onValueChange={() => handleSettingToggle('notifications')}
            trackColor={{ false: '#767577', true: '#ff6b6b' }}
            thumbColor={settings.notifications ? '#ffffff' : '#f4f3f4'}
          />
        </SettingRow>
        <SettingRow>
          <SettingLabel>위치 공유</SettingLabel>
          <Switch
            value={settings.locationSharing}
            onValueChange={() => handleSettingToggle('locationSharing')}
            trackColor={{ false: '#767577', true: '#ff6b6b' }}
            thumbColor={settings.locationSharing ? '#ffffff' : '#f4f3f4'}
          />
        </SettingRow>
        <SettingRow>
          <SettingLabel>비공개 프로필</SettingLabel>
          <Switch
            value={settings.privateProfile}
            onValueChange={() => handleSettingToggle('privateProfile')}
            trackColor={{ false: '#767577', true: '#ff6b6b' }}
            thumbColor={settings.privateProfile ? '#ffffff' : '#f4f3f4'}
          />
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

      {/* Edit Profile Modal */}
      {showEditModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>프로필 편집</ModalTitle>
            
            <InputContainer>
              <InputLabel>닉네임</InputLabel>
              <Input
                value={editForm.nickname}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, nickname: text }))}
                placeholder="닉네임을 입력하세요"
                maxLength={20}
              />
            </InputContainer>

            <InputContainer>
              <InputLabel>자기소개</InputLabel>
              <Input
                value={editForm.bio}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, bio: text }))}
                placeholder="자기소개를 입력하세요"
                multiline
                numberOfLines={3}
                maxLength={100}
              />
            </InputContainer>

            <InputContainer>
              <InputLabel>관심사</InputLabel>
              <Input
                value={editForm.interests}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, interests: text }))}
                placeholder="관심사를 입력하세요 (쉼표로 구분)"
                maxLength={50}
              />
            </InputContainer>

            <ModalButtonRow>
              <ModalButton variant="secondary" onPress={() => setShowEditModal(false)}>
                <ModalButtonText variant="secondary">취소</ModalButtonText>
              </ModalButton>
              <ModalButton variant="primary" onPress={handleSaveProfile}>
                <ModalButtonText variant="primary">저장</ModalButtonText>
              </ModalButton>
            </ModalButtonRow>
          </ModalContent>
        </Modal>
      )}
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