import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { MainTabParamList } from './types';

// Import screens
import FeedScreen from '../screens/main/FeedScreen';
import MapScreen from '../screens/main/MapScreen';
import SparksScreen from '../screens/main/SparksScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Icon component using emojis
const TabIcon: React.FC<{ name: string; color: string; size: number }> = ({ name, color, size }) => {
  const getIcon = () => {
    switch (name) {
      case 'Feed':
        return '🌟';
      case 'Map':
        return '🗺️';
      case 'Sparks':
        return '✨';
      case 'Messages':
        return '💬';
      case 'Profile':
        return '👤';
      default:
        return '📱';
    }
  };

  return (
    <Text style={{ fontSize: size, opacity: color === '#FF6B6B' ? 1 : 0.6 }}>
      {getIcon()}
    </Text>
  );
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Feed"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#E5E5E5',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen}
        options={{
          title: '오늘의 인연',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="Feed" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{
          title: '지도',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="Map" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Sparks" 
        component={SparksScreen}
        options={{
          title: '스파크',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="Sparks" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{
          title: '메시지',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="Messages" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: '프로필',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="Profile" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}; 