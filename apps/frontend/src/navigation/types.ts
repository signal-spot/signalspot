import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Main App Stack Navigation Types
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  SpotDetail: { spotId: string };
  ChatRoom: { roomId: string; participantId: string };
  Profile: { userId: string };
  CreateSpot: undefined;
  Settings: undefined;
};

// Authentication Stack Types
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Main Tab Navigation Types
export type MainTabParamList = {
  Map: undefined;
  Sparks: undefined;
  MySignals: undefined;
  Profile: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = 
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = 
  BottomTabScreenProps<MainTabParamList, T>;

// Utility type for navigation objects
export type NavigationProps = RootStackScreenProps<keyof RootStackParamList>['navigation'];

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface
    interface RootParamList extends RootStackParamList {}
  }
} 