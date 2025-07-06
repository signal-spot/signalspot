import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLocationContext } from '../../providers/LocationProvider';
import { LocationPermissionStatus } from '../../services/location.service';

interface LocationSettingsScreenProps {
  navigation: any;
}

const LocationSettingsScreen: React.FC<LocationSettingsScreenProps> = ({ navigation }) => {
  const {
    currentLocation,
    permissionStatus,
    isTracking,
    preferences,
    updatePreferences,
    startTracking,
    stopTracking,
    requestAllPermissions,
    lastUpdate,
    isLocationRecent,
  } = useLocationContext();

  const [showRadiusModal, setShowRadiusModal] = useState(false);
  const [tempRadius, setTempRadius] = useState(preferences.shareRadius.toString());
  const [tempNotificationRadius, setTempNotificationRadius] = useState(preferences.notificationRadius.toString());

  const handleToggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  const handleToggleShareLocation = (value: boolean) => {
    if (value && permissionStatus !== LocationPermissionStatus.GRANTED) {
      Alert.alert(
        'Permission Required',
        'Location permission is required to share your location.',
        [
          { text: 'Cancel' },
          { text: 'Grant Permission', onPress: requestAllPermissions },
        ]
      );
      return;
    }
    
    updatePreferences({ shareLocation: value });
  };

  const handleToggleBackgroundTracking = (value: boolean) => {
    if (value) {
      Alert.alert(
        'Background Location Access',
        'This will allow the app to track your location even when not in use. This may impact battery life.',
        [
          { text: 'Cancel' },
          { 
            text: 'Enable', 
            onPress: () => {
              updatePreferences({ backgroundTracking: value });
              requestAllPermissions();
            } 
          },
        ]
      );
    } else {
      updatePreferences({ backgroundTracking: value });
    }
  };

  const handleUpdateRadius = () => {
    const radius = parseFloat(tempRadius);
    const notificationRadius = parseFloat(tempNotificationRadius);
    
    if (isNaN(radius) || radius < 0.1 || radius > 50) {
      Alert.alert('Invalid Radius', 'Sharing radius must be between 0.1 and 50 kilometers.');
      return;
    }
    
    if (isNaN(notificationRadius) || notificationRadius < 0.1 || notificationRadius > 10) {
      Alert.alert('Invalid Radius', 'Notification radius must be between 0.1 and 10 kilometers.');
      return;
    }
    
    updatePreferences({ 
      shareRadius: radius,
      notificationRadius: notificationRadius,
    });
    setShowRadiusModal(false);
  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return 'Never';
    
    const now = Date.now();
    const diffMs = now - lastUpdate;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const getLocationAccuracyText = () => {
    if (!currentLocation?.accuracy) return 'Unknown';
    
    const accuracy = currentLocation.accuracy;
    if (accuracy <= 10) return `High (±${accuracy.toFixed(1)}m)`;
    if (accuracy <= 50) return `Medium (±${accuracy.toFixed(1)}m)`;
    return `Low (±${accuracy.toFixed(1)}m)`;
  };

  const getPermissionStatusText = () => {
    switch (permissionStatus) {
      case LocationPermissionStatus.GRANTED:
        return 'Granted';
      case LocationPermissionStatus.DENIED:
        return 'Denied';
      case LocationPermissionStatus.BLOCKED:
        return 'Blocked';
      case LocationPermissionStatus.LIMITED:
        return 'Limited';
      default:
        return 'Unknown';
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

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.title}>Location Settings</Text>
      </View>

      {/* Current Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Status</Text>
        
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Permission:</Text>
            <View style={styles.statusValue}>
              <View style={[styles.statusDot, { backgroundColor: getPermissionStatusColor() }]} />
              <Text style={styles.statusText}>{getPermissionStatusText()}</Text>
            </View>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Tracking:</Text>
            <Text style={styles.statusText}>{isTracking ? 'Active' : 'Inactive'}</Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Last Update:</Text>
            <Text style={styles.statusText}>{formatLastUpdate()}</Text>
          </View>
          
          {currentLocation && (
            <>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Accuracy:</Text>
                <Text style={styles.statusText}>{getLocationAccuracyText()}</Text>
              </View>
              
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Coordinates:</Text>
                <Text style={styles.statusText}>
                  {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Location Tracking */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location Tracking</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Auto-Track Location</Text>
            <Text style={styles.settingDescription}>
              Automatically track your location when the app is open
            </Text>
          </View>
          <Switch
            value={preferences.autoTrack}
            onValueChange={(value) => {
              updatePreferences({ autoTrack: value });
              if (value) {
                startTracking();
              } else {
                stopTracking();
              }
            }}
            trackColor={{ false: '#E0E0E0', true: '#C8E6C9' }}
            thumbColor={preferences.autoTrack ? '#4CAF50' : '#F5F5F5'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Background Tracking</Text>
            <Text style={styles.settingDescription}>
              Continue tracking when app is in background
            </Text>
          </View>
          <Switch
            value={preferences.backgroundTracking}
            onValueChange={handleToggleBackgroundTracking}
            trackColor={{ false: '#E0E0E0', true: '#C8E6C9' }}
            thumbColor={preferences.backgroundTracking ? '#4CAF50' : '#F5F5F5'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>High Accuracy</Text>
            <Text style={styles.settingDescription}>
              Use GPS for more accurate location (uses more battery)
            </Text>
          </View>
          <Switch
            value={preferences.enableHighAccuracy}
            onValueChange={(value) => updatePreferences({ enableHighAccuracy: value })}
            trackColor={{ false: '#E0E0E0', true: '#C8E6C9' }}
            thumbColor={preferences.enableHighAccuracy ? '#4CAF50' : '#F5F5F5'}
          />
        </View>
      </View>

      {/* Location Sharing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location Sharing</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Share Location</Text>
            <Text style={styles.settingDescription}>
              Allow other users to see your location
            </Text>
          </View>
          <Switch
            value={preferences.shareLocation}
            onValueChange={handleToggleShareLocation}
            trackColor={{ false: '#E0E0E0', true: '#C8E6C9' }}
            thumbColor={preferences.shareLocation ? '#4CAF50' : '#F5F5F5'}
          />
        </View>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setShowRadiusModal(true)}
          disabled={!preferences.shareLocation}
        >
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, !preferences.shareLocation && styles.disabledText]}>
              Sharing Radius
            </Text>
            <Text style={[styles.settingDescription, !preferences.shareLocation && styles.disabledText]}>
              Maximum distance for location sharing: {preferences.shareRadius}km
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color={preferences.shareLocation ? "#757575" : "#E0E0E0"} />
        </TouchableOpacity>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Nearby Notifications</Text>
            <Text style={styles.settingDescription}>
              Get notified about nearby users and content
            </Text>
          </View>
          <Switch
            value={preferences.nearbyNotifications}
            onValueChange={(value) => updatePreferences({ nearbyNotifications: value })}
            trackColor={{ false: '#E0E0E0', true: '#C8E6C9' }}
            thumbColor={preferences.nearbyNotifications ? '#4CAF50' : '#F5F5F5'}
          />
        </View>
      </View>

      {/* Manual Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manual Controls</Text>
        
        <TouchableOpacity
          style={[styles.button, isTracking ? styles.stopButton : styles.startButton]}
          onPress={handleToggleTracking}
        >
          <Icon 
            name={isTracking ? "stop" : "play-arrow"} 
            size={20} 
            color="#FFFFFF" 
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Radius Settings Modal */}
      <Modal
        visible={showRadiusModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRadiusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Location Radius Settings</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sharing Radius (km)</Text>
              <TextInput
                style={styles.input}
                value={tempRadius}
                onChangeText={setTempRadius}
                keyboardType="numeric"
                placeholder="Enter radius in kilometers"
              />
              <Text style={styles.inputHint}>Range: 0.1 - 50 km</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notification Radius (km)</Text>
              <TextInput
                style={styles.input}
                value={tempNotificationRadius}
                onChangeText={setTempNotificationRadius}
                keyboardType="numeric"
                placeholder="Enter notification radius"
              />
              <Text style={styles.inputHint}>Range: 0.1 - 10 km</Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowRadiusModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateRadius}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  statusCard: {
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  statusValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
  disabledText: {
    color: '#E0E0E0',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  inputHint: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  cancelButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LocationSettingsScreen;