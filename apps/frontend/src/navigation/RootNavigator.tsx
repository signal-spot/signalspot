import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthStackNavigator } from './AuthStack';
import { MainTabNavigator } from './MainTabNavigator';

// Import additional screens (will be created later)
import SpotDetailScreen from '../screens/SpotDetailScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateSpotScreen from '../screens/CreateSpotScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  isAuthenticated: boolean;
}

export const RootNavigator: React.FC<RootNavigatorProps> = ({ isAuthenticated }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen 
          name="Auth" 
          component={AuthStackNavigator}
          options={{ 
            headerShown: false,
            animationTypeForReplace: 'pop',
          }}
        />
      ) : (
        <>
          <Stack.Screen 
            name="Main" 
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="SpotDetail" 
            component={SpotDetailScreen}
            options={{
              headerShown: true,
              title: '시그널 스팟',
              presentation: 'modal',
            }}
          />
          <Stack.Screen 
            name="ChatRoom" 
            component={ChatRoomScreen}
            options={{
              headerShown: true,
              title: '채팅',
              presentation: 'card',
            }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{
              headerShown: true,
              title: '프로필',
              presentation: 'modal',
            }}
          />
          <Stack.Screen 
            name="CreateSpot" 
            component={CreateSpotScreen}
            options={{
              headerShown: true,
              title: '스팟 만들기',
              presentation: 'modal',
            }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{
              headerShown: true,
              title: '설정',
              presentation: 'modal',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}; 