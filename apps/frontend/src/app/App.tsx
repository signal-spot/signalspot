import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { AuthProvider, useAuth } from '../providers/AuthProvider';
import { QueryProvider } from '../providers/QueryProvider';
import { LocationProvider } from '../providers/LocationProvider';
import { RootNavigator } from '../navigation/RootNavigator';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication status
  if (isLoading) {
    // For now, return null. Later we'll add a proper loading screen
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <RootNavigator isAuthenticated={isAuthenticated} />
    </NavigationContainer>
  );
};

export const App: React.FC = () => {
  return (
    <QueryProvider>
      <AuthProvider>
        <LocationProvider>
          <AppContent />
        </LocationProvider>
      </AuthProvider>
    </QueryProvider>
  );
};
