import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { MainTabParamList } from './types';
import { DesignSystem } from '../utils/designSystem';
import { Badge } from '../components/common';

// Import screens
import MapScreen from '../screens/main/MapScreen';
import SparksScreen from '../screens/main/SparksScreen';
import MySignalsScreen from '../screens/main/MySignalsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Tab icon component with badge support
interface TabIconProps {
  name: string;
  focused: boolean;
  color: string;
  size: number;
  badgeCount?: number;
}

const TabIcon: React.FC<TabIconProps> = ({ name, focused, color, size, badgeCount }) => {
  const getIconName = () => {
    switch (name) {
      case 'Map':
        return focused ? 'map' : 'map-outline';
      case 'Sparks':
        return focused ? 'flash' : 'flash-outline';
      case 'MySignals':
        return focused ? 'document-text' : 'document-text-outline';
      case 'Profile':
        return focused ? 'person' : 'person-outline';
      default:
        return 'apps-outline';
    }
  };

  return (
    <View style={{ position: 'relative' }}>
      <Icon name={getIconName()} size={size} color={color} />
      {badgeCount && badgeCount > 0 && (
        <View style={{
          position: 'absolute',
          top: -4,
          right: -8,
          minWidth: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: DesignSystem.colors.danger,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 4,
        }}>
          <Badge variant="danger" size="small">{badgeCount > 99 ? '99+' : badgeCount}</Badge>
        </View>
      )}
    </View>
  );
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  // Mock data for badge counts - in real app, this would come from context/redux
  const newSparks = 5;
  const newSignals = 3;

  return (
    <Tab.Navigator
      initialRouteName="Map"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: DesignSystem.colors.primary,
        tabBarInactiveTintColor: DesignSystem.colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: DesignSystem.colors.background.primary,
          borderTopColor: DesignSystem.colors.border.light,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 84 : 64,
          ...DesignSystem.shadow.sm,
        },
        tabBarLabelStyle: {
          ...DesignSystem.typography.caption1,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{
          title: '지도',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="Map" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Sparks" 
        component={SparksScreen}
        options={{
          title: '스파크',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="Sparks" focused={focused} color={color} size={size} badgeCount={newSparks} />
          ),
          tabBarBadge: newSparks > 0 ? newSparks : undefined,
          tabBarBadgeStyle: {
            backgroundColor: DesignSystem.colors.danger,
            ...DesignSystem.typography.caption2,
            minWidth: 16,
            height: 16,
            lineHeight: 16,
          },
        }}
      />
      <Tab.Screen 
        name="MySignals" 
        component={MySignalsScreen}
        options={{
          title: '내 시그널',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="MySignals" focused={focused} color={color} size={size} badgeCount={newSignals} />
          ),
          tabBarBadge: newSignals > 0 ? newSignals : undefined,
          tabBarBadgeStyle: {
            backgroundColor: DesignSystem.colors.danger,
            ...DesignSystem.typography.caption2,
            minWidth: 16,
            height: 16,
            lineHeight: 16,
          },
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: '프로필',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="Profile" focused={focused} color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}; 