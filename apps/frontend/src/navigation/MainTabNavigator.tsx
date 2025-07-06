import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';

// Import screens (will be created later)
import FeedScreen from '../screens/main/FeedScreen';
import MapScreen from '../screens/main/MapScreen';
import SparksScreen from '../screens/main/SparksScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

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
            // Will add proper icon later
            <></>
          ),
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{
          title: '지도',
          tabBarIcon: ({ color, size }) => (
            // Will add proper icon later
            <></>
          ),
        }}
      />
      <Tab.Screen 
        name="Sparks" 
        component={SparksScreen}
        options={{
          title: '스파크',
          tabBarIcon: ({ color, size }) => (
            // Will add proper icon later
            <></>
          ),
        }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{
          title: '메시지',
          tabBarIcon: ({ color, size }) => (
            // Will add proper icon later
            <></>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: '프로필',
          tabBarIcon: ({ color, size }) => (
            // Will add proper icon later
            <></>
          ),
        }}
      />
    </Tab.Navigator>
  );
}; 