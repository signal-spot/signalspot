import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

interface SettingsScreenProps {
  navigation: SettingsScreenNavigationProp;
}

interface SettingItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({ title, subtitle, onPress, rightElement }) => (
  <TouchableOpacity 
    className="py-4 px-4 bg-white border-b border-gray-200"
    onPress={onPress}
    disabled={!onPress}
  >
    <View className="flex-row justify-between items-center">
      <View className="flex-1 mr-4">
        <Text className="text-base text-gray-900">{title}</Text>
        {subtitle && (
          <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
        )}
      </View>
      {rightElement}
    </View>
  </TouchableOpacity>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [pushNotifications, setPushNotifications] = React.useState(true);
  const [locationSharing, setLocationSharing] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logging out...');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView>
        <View className="mb-6">
          <Text className="text-sm text-gray-500 uppercase px-4 py-2">알림 설정</Text>
          <SettingItem
            title="푸시 알림"
            subtitle="새로운 메시지와 스팟 알림을 받습니다"
            rightElement={
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
              />
            }
          />
          <SettingItem
            title="알림 설정"
            subtitle="알림 유형별 세부 설정"
            onPress={() => console.log('Navigate to notification settings')}
            rightElement={<Text className="text-gray-400">›</Text>}
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm text-gray-500 uppercase px-4 py-2">개인정보</Text>
          <SettingItem
            title="위치 공유"
            subtitle="다른 사용자에게 내 위치를 공유합니다"
            rightElement={
              <Switch
                value={locationSharing}
                onValueChange={setLocationSharing}
              />
            }
          />
          <SettingItem
            title="차단 목록"
            subtitle="차단한 사용자 관리"
            onPress={() => console.log('Navigate to blocked users')}
            rightElement={<Text className="text-gray-400">›</Text>}
          />
          <SettingItem
            title="개인정보 처리방침"
            onPress={() => console.log('Open privacy policy')}
            rightElement={<Text className="text-gray-400">›</Text>}
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm text-gray-500 uppercase px-4 py-2">디스플레이</Text>
          <SettingItem
            title="다크 모드"
            subtitle="어두운 테마 사용"
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
              />
            }
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm text-gray-500 uppercase px-4 py-2">계정</Text>
          <SettingItem
            title="계정 정보"
            subtitle="이메일, 비밀번호 변경"
            onPress={() => console.log('Navigate to account info')}
            rightElement={<Text className="text-gray-400">›</Text>}
          />
          <SettingItem
            title="로그아웃"
            onPress={handleLogout}
          />
          <SettingItem
            title="계정 삭제"
            onPress={() => console.log('Delete account')}
            rightElement={<Text className="text-red-500">삭제</Text>}
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm text-gray-500 uppercase px-4 py-2">정보</Text>
          <SettingItem
            title="버전"
            rightElement={<Text className="text-gray-500">1.0.0</Text>}
          />
          <SettingItem
            title="이용약관"
            onPress={() => console.log('Open terms of service')}
            rightElement={<Text className="text-gray-400">›</Text>}
          />
          <SettingItem
            title="오픈소스 라이선스"
            onPress={() => console.log('Open licenses')}
            rightElement={<Text className="text-gray-400">›</Text>}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;