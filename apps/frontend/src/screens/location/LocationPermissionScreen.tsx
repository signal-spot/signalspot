import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLocationContext } from '../../providers/LocationProvider';
import { LocationPermissionStatus } from '../../services/location.service';

interface LocationPermissionScreenProps {
  navigation: any;
  onPermissionGranted?: () => void;
  showSkipOption?: boolean;
}

const LocationPermissionScreen: React.FC<LocationPermissionScreenProps> = ({
  navigation,
  onPermissionGranted,
  showSkipOption = false,
}) => {
  const {
    permissionStatus,
    requestPermission,
    requestAllPermissions,
    preferences,
    updatePreferences,
  } = useLocationContext();

  const [isRequesting, setIsRequesting] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  useEffect(() => {
    if (permissionStatus === LocationPermissionStatus.GRANTED && onPermissionGranted) {
      onPermissionGranted();
    }
  }, [permissionStatus, onPermissionGranted]);

  const handleRequestBasicPermission = async () => {
    setIsRequesting(true);
    try {
      const status = await requestPermission();
      
      if (status === LocationPermissionStatus.GRANTED) {
        updatePreferences({ autoTrack: true });
        if (onPermissionGranted) {
          onPermissionGranted();
        } else {
          navigation.goBack();
        }
      } else if (status === LocationPermissionStatus.BLOCKED) {
        showSettingsAlert();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleRequestAllPermissions = async () => {
    setIsRequesting(true);
    try {
      await requestAllPermissions();
      updatePreferences({ 
        autoTrack: true,
        backgroundTracking: true,
      });
    } catch (error) {
      console.error('Error requesting all permissions:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const showSettingsAlert = () => {
    Alert.alert(
      'Permission Denied',
      'Location permission has been blocked. Please enable it in your device settings to use location-based features.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: openAppSettings },
      ]
    );
  };

  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const handleSkip = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Navigate to main app or next screen
      navigation.replace('MainTabs');
    }
  };

  const getPermissionStatusColor = () => {
    switch (permissionStatus) {
      case LocationPermissionStatus.GRANTED:
        return '#4CAF50';
      case LocationPermissionStatus.DENIED:
        return '#FF9800';
      case LocationPermissionStatus.BLOCKED:
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getPermissionStatusText = () => {
    switch (permissionStatus) {
      case LocationPermissionStatus.GRANTED:
        return 'Permission Granted';
      case LocationPermissionStatus.DENIED:
        return 'Permission Denied';
      case LocationPermissionStatus.BLOCKED:
        return 'Permission Blocked';
      case LocationPermissionStatus.LIMITED:
        return 'Limited Permission';
      default:
        return 'Permission Unknown';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Icon name="location-on" size={80} color="#2196F3" />
        <Text style={styles.title}>Enable Location Services</Text>
        <Text style={styles.subtitle}>
          SignalSpot uses your location to help you discover and create location-based content
        </Text>
      </View>

      <View style={styles.permissionStatus}>
        <View style={[styles.statusIndicator, { backgroundColor: getPermissionStatusColor() }]} />
        <Text style={styles.statusText}>{getPermissionStatusText()}</Text>
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>What you'll get:</Text>
        
        <View style={styles.feature}>
          <Icon name="place" size={24} color="#2196F3" />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Find Signal Spots</Text>
            <Text style={styles.featureDescription}>
              Discover location-based messages and content around you
            </Text>
          </View>
        </View>

        <View style={styles.feature}>
          <Icon name="flash-on" size={24} color="#FF9800" />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Signal Spark</Text>
            <Text style={styles.featureDescription}>
              Connect with nearby users who share your interests
            </Text>
          </View>
        </View>

        <View style={styles.feature}>
          <Icon name="map" size={24} color="#4CAF50" />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Interactive Map</Text>
            <Text style={styles.featureDescription}>
              See your current location and nearby points of interest
            </Text>
          </View>
        </View>

        <View style={styles.feature}>
          <Icon name="notifications" size={24} color="#9C27B0" />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Location Alerts</Text>
            <Text style={styles.featureDescription}>
              Get notified when something interesting happens nearby
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.privacySection}>
        <Text style={styles.privacyTitle}>Your Privacy Matters</Text>
        <Text style={styles.privacyText}>
          • You control when and how your location is shared{'\n'}
          • Location data is encrypted and secure{'\n'}
          • You can disable location tracking anytime{'\n'}
          • Only you decide who can see your location
        </Text>
      </View>

      {permissionStatus !== LocationPermissionStatus.GRANTED && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleRequestBasicPermission}
            disabled={isRequesting}
          >
            <Text style={styles.primaryButtonText}>
              {isRequesting ? 'Requesting...' : 'Enable Location'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.advancedToggle}
            onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            <Text style={styles.advancedToggleText}>
              Advanced Options {showAdvancedOptions ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {showAdvancedOptions && (
            <View style={styles.advancedOptions}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleRequestAllPermissions}
                disabled={isRequesting}
              >
                <Text style={styles.secondaryButtonText}>
                  Enable Background Location
                </Text>
              </TouchableOpacity>
              <Text style={styles.advancedDescription}>
                Allows location tracking when the app is in the background for enhanced features
              </Text>
            </View>
          )}

          {showSkipOption && (
            <TouchableOpacity
              style={[styles.button, styles.skipButton]}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>Skip for Now</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {permissionStatus === LocationPermissionStatus.GRANTED && (
        <View style={styles.successContainer}>
          <Icon name="check-circle" size={60} color="#4CAF50" />
          <Text style={styles.successText}>Location Access Enabled!</Text>
          <Text style={styles.successDescription}>
            You can now enjoy all location-based features
          </Text>
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('LocationSettings')}
          >
            <Text style={styles.primaryButtonText}>Customize Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.skipButton]}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>Continue to App</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  featureText: {
    flex: 1,
    marginLeft: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
  privacySection: {
    backgroundColor: '#E8F5E8',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  privacyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  privacyText: {
    fontSize: 14,
    color: '#388E3C',
    lineHeight: 22,
  },
  buttonsContainer: {
    gap: 15,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: 'transparent',
  },
  skipButtonText: {
    color: '#757575',
    fontSize: 16,
  },
  advancedToggle: {
    alignItems: 'center',
    padding: 10,
  },
  advancedToggleText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  advancedOptions: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  advancedDescription: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  successContainer: {
    alignItems: 'center',
    gap: 15,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  successDescription: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
});

export default LocationPermissionScreen;