import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Circle, Region, Callout } from 'react-native-maps';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useLocation } from '../../hooks/useLocation';
import { useAuth } from '../../providers/AuthProvider';
import { signalSpotService, SignalSpot, CreateSpotRequest } from '../../services/signalSpot.service';
import { useLoadingState } from '../../services/api.service';
import { CreateSpotModal } from '../../components/spot/CreateSpotModal';
import styled from 'styled-components/native';

const { width, height } = Dimensions.get('window');

// Styled components
const Container = styled.View`
  flex: 1;
  background-color: #f5f5f5;
`;

const MapContainer = styled.View`
  flex: 1;
  position: relative;
`;

const FloatingButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 100px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: #ff6b6b;
  justify-content: center;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 5;
`;

const MyLocationButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 170px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: #ffffff;
  justify-content: center;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 5;
`;

const HeaderContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 50px 20px 15px;
  z-index: 10;
`;

const HeaderTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  text-align: center;
`;

const HeaderSubtitle = styled.Text`
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-top: 5px;
`;

const CreateSpotModal = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 20px;
  shadow-color: #000;
  shadow-offset: 0px -2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 5;
`;

const ModalTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
`;

const TextInput = styled.TextInput`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  margin-bottom: 15px;
  min-height: 80px;
  text-align-vertical: top;
`;

const ButtonRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  gap: 10px;
`;

const Button = styled.TouchableOpacity<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 15px;
  border-radius: 8px;
  background-color: ${props => props.variant === 'primary' ? '#ff6b6b' : '#f0f0f0'};
  align-items: center;
`;

const ButtonText = styled.Text<{ variant?: 'primary' | 'secondary' }>`
  font-size: 16px;
  font-weight: bold;
  color: ${props => props.variant === 'primary' ? '#ffffff' : '#333333'};
`;

const SpotTypeSelector = styled.View`
  flex-direction: row;
  justify-content: space-around;
  margin-bottom: 15px;
`;

const SpotTypeButton = styled.TouchableOpacity<{ selected: boolean }>`
  padding: 8px 12px;
  border-radius: 15px;
  background-color: ${props => props.selected ? '#ff6b6b' : '#f0f0f0'};
`;

const SpotTypeText = styled.Text<{ selected: boolean }>`
  font-size: 12px;
  color: ${props => props.selected ? '#ffffff' : '#666666'};
  font-weight: ${props => props.selected ? 'bold' : 'normal'};
`;

const LoadingOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const LoadingText = styled.Text`
  color: white;
  margin-top: 10px;
  font-size: 16px;
`;

const SpotCounter = styled.View`
  position: absolute;
  top: 120px;
  right: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 15px;
`;

const SpotCounterText = styled.Text`
  font-size: 12px;
  color: #333;
  font-weight: bold;
`;

const MapScreen: React.FC = () => {
  const { location, getCurrentLocation, requestLocationPermission } = useLocation();
  const { user } = useAuth();
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);
  
  // Loading states
  const isLoadingNearby = useLoadingState('nearbySpots');
  const isLoadingCreate = useLoadingState('createSpot');
  
  // State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [spots, setSpots] = useState<SignalSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<SignalSpot | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 37.5665,
    longitude: 126.9780,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isMapReady, setIsMapReady] = useState(false);
  const [visibleRegion, setVisibleRegion] = useState<Region | null>(null);

  // Memoized visible spots for performance
  const visibleSpots = useMemo(() => {
    if (!visibleRegion) return spots;
    
    // Filter spots within visible region
    return spots.filter(spot => {
      const latDiff = Math.abs(spot.latitude - visibleRegion.latitude);
      const lngDiff = Math.abs(spot.longitude - visibleRegion.longitude);
      return latDiff <= visibleRegion.latitudeDelta / 2 && 
             lngDiff <= visibleRegion.longitudeDelta / 2;
    });
  }, [spots, visibleRegion]);

  // Memoized clustered markers for performance
  const clusteredMarkers = useMemo(() => {
    if (visibleSpots.length < 20) return visibleSpots;
    
    // Simple clustering based on zoom level
    const clusterRadius = visibleRegion ? 
      Math.min(visibleRegion.latitudeDelta, visibleRegion.longitudeDelta) * 0.05 : 0.01;
    
    const clusters: { spots: SignalSpot[], center: { latitude: number, longitude: number } }[] = [];
    const processedSpots = new Set<string>();
    
    visibleSpots.forEach(spot => {
      if (processedSpots.has(spot.id)) return;
      
      const nearbySpots = visibleSpots.filter(s => {
        if (processedSpots.has(s.id)) return false;
        const distance = Math.sqrt(
          Math.pow(s.latitude - spot.latitude, 2) + 
          Math.pow(s.longitude - spot.longitude, 2)
        );
        return distance < clusterRadius;
      });
      
      if (nearbySpots.length > 3) {
        // Create cluster
        nearbySpots.forEach(s => processedSpots.add(s.id));
        const avgLat = nearbySpots.reduce((sum, s) => sum + s.latitude, 0) / nearbySpots.length;
        const avgLng = nearbySpots.reduce((sum, s) => sum + s.longitude, 0) / nearbySpots.length;
        clusters.push({
          spots: nearbySpots,
          center: { latitude: avgLat, longitude: avgLng }
        });
      } else {
        processedSpots.add(spot.id);
      }
    });
    
    // Return individual spots that weren't clustered
    const individualSpots = visibleSpots.filter(s => !processedSpots.has(s.id));
    return [...individualSpots, ...clusters];
  }, [visibleSpots, visibleRegion]);

  // Load nearby spots with debouncing for region changes
  const loadNearbySpots = useCallback(async (region?: Region) => {
    const targetRegion = region || visibleRegion || mapRegion;
    if (!targetRegion) return;

    try {
      // Calculate radius based on visible region
      const radiusKm = Math.max(
        targetRegion.latitudeDelta * 111, // 1 degree latitude ≈ 111km
        targetRegion.longitudeDelta * 111 * Math.cos(targetRegion.latitude * Math.PI / 180)
      );

      const response = await signalSpotService.getNearbySpots({
        latitude: targetRegion.latitude,
        longitude: targetRegion.longitude,
        radiusKm: Math.min(radiusKm, 10), // Max 10km radius
        limit: 100,
        includeExpired: false,
      });

      if (response.success) {
        setSpots(response.data);
      }
    } catch (error) {
      console.error('Error loading nearby spots:', error);
    }
  }, [visibleRegion, mapRegion]);

  // Focus effect to refresh location and spots when screen is focused
  useFocusEffect(
    useCallback(() => {
      handleGetCurrentLocation();
      // Subscribe to real-time updates when focused
      const unsubscribe = signalSpotService.subscribeToAreaUpdates(
        {
          latitude: location?.latitude || mapRegion.latitude,
          longitude: location?.longitude || mapRegion.longitude,
          radiusKm: 2,
        },
        (updatedSpots) => {
          setSpots(updatedSpots);
        }
      );
      
      return () => {
        unsubscribe.then(unsub => unsub());
      };
    }, [location, mapRegion])
  );

  // Load spots when map is ready
  useEffect(() => {
    if (isMapReady && visibleRegion) {
      loadNearbySpots(visibleRegion);
    }
  }, [isMapReady, loadNearbySpots]);

  // Debounced region change handler
  const handleRegionChange = useCallback((region: Region) => {
    setVisibleRegion(region);
    // Only reload if moved significantly
    if (mapRegion) {
      const latDiff = Math.abs(region.latitude - mapRegion.latitude);
      const lngDiff = Math.abs(region.longitude - mapRegion.longitude);
      if (latDiff > region.latitudeDelta * 0.3 || lngDiff > region.longitudeDelta * 0.3) {
        loadNearbySpots(region);
      }
    }
    setMapRegion(region);
  }, [mapRegion, loadNearbySpots]);

  const handleGetCurrentLocation = async () => {
    try {
      const currentLocation = await getCurrentLocation();
      if (currentLocation) {
        setMapRegion({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('위치 오류', '현재 위치를 가져올 수 없습니다.');
    }
  };

  const handleCreateSpot = async (spotData: CreateSpotRequest) => {
    try {
      const response = await signalSpotService.createSpot(spotData);

      if (response.success) {
        setSpots(prev => [response.data, ...prev]);
        Alert.alert('성공', '시그널 스팟이 생성되었습니다!');
        
        // Animate to new spot
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: response.data.latitude,
            longitude: response.data.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 500);
        }
      }
    } catch (error: any) {
      console.error('Error creating spot:', error);
      Alert.alert('오류', error.message || '시그널 스팟 생성에 실패했습니다.');
    }
  };

  const handleSpotPress = (spot: SignalSpot) => {
    setSelectedSpot(spot);
    // Navigate to detail screen directly
    navigation.navigate('SpotDetail', { spotId: spot.id });
  };

  const renderSpotMarker = (item: SignalSpot | { spots: SignalSpot[], center: { latitude: number, longitude: number } }) => {
    if ('spots' in item) {
      // Render cluster
      return (
        <Marker
          key={`cluster-${item.spots[0].id}`}
          coordinate={item.center}
          onPress={() => {
            // Zoom in on cluster
            if (mapRef.current) {
              mapRef.current.animateToRegion({
                ...item.center,
                latitudeDelta: mapRegion.latitudeDelta * 0.5,
                longitudeDelta: mapRegion.longitudeDelta * 0.5,
              }, 300);
            }
          }}
        >
          <View style={styles.clusterMarker}>
            <Text style={styles.clusterText}>{item.spots.length}</Text>
          </View>
        </Marker>
      );
    }
    
    // Render individual spot
    const spot = item;
    const isSelected = selectedSpot?.id === spot.id;
    const typeIcon = signalSpotService.getSpotTypeIcon(spot.type);
    const typeColor = signalSpotService.getSpotTypeColor(spot.type);
    
    return (
      <Marker
        key={spot.id}
        coordinate={{
          latitude: spot.latitude,
          longitude: spot.longitude,
        }}
        onPress={() => handleSpotPress(spot)}
        tracksViewChanges={false} // Performance optimization
      >
        <View style={[
          styles.spotMarker,
          { 
            backgroundColor: typeColor,
            borderColor: isSelected ? '#ffffff' : typeColor,
            borderWidth: isSelected ? 3 : 2,
            transform: [{ scale: isSelected ? 1.2 : 1 }],
          }
        ]}>
          <Text style={styles.spotMarkerText}>{typeIcon}</Text>
        </View>
        <Callout tooltip>
          <View style={styles.calloutContainer}>
            <Text style={styles.calloutTitle}>{spot.title}</Text>
            <Text style={styles.calloutContent} numberOfLines={2}>{spot.content}</Text>
            <View style={styles.calloutMeta}>
              <Text style={styles.calloutMetaText}>{spot.creatorUsername}</Text>
              <Text style={styles.calloutMetaText}>❤ {spot.likeCount}</Text>
            </View>
          </View>
        </Callout>
      </Marker>
    );
  };

  if (!location) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>위치 정보를 가져오는 중...</Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestLocationPermission}
          >
            <Text style={styles.permissionButtonText}>위치 권한 요청</Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderContainer>
        <HeaderTitle>시그널 스팟</HeaderTitle>
        <HeaderSubtitle>근처의 시그널을 확인하고 새로운 연결을 만들어보세요</HeaderSubtitle>
      </HeaderContainer>

      <MapContainer>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={mapRegion}
          onMapReady={() => setIsMapReady(true)}
          onRegionChangeComplete={handleRegionChange}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsPointsOfInterest={false}
          showsCompass={false}
          showsScale={false}
          showsBuildings={false}
          showsTraffic={false}
          showsIndoors={false}
          onPress={() => setSelectedSpot(null)}
          moveOnMarkerPress={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          {/* User's current location circle */}
          <Circle
            center={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            radius={100}
            fillColor="rgba(255, 107, 107, 0.2)"
            strokeColor="rgba(255, 107, 107, 0.8)"
            strokeWidth={2}
          />

          {/* Signal spots with clustering */}
          {clusteredMarkers.map(renderSpotMarker)}
        </MapView>

        {/* Spot Counter */}
        <SpotCounter>
          <SpotCounterText>
            {visibleSpots.length}개 표시 / 전체 {spots.length}개
          </SpotCounterText>
        </SpotCounter>

        {/* My Location Button */}
        <MyLocationButton onPress={handleGetCurrentLocation}>
          <Text style={styles.myLocationIcon}>📍</Text>
        </MyLocationButton>

        {/* Create Spot Button */}
        <FloatingButton onPress={() => setShowCreateModal(true)}>
          <Text style={styles.createButtonText}>+</Text>
        </FloatingButton>

        {/* Loading overlay */}
        {(isLoadingNearby || isLoadingCreate) && (
          <LoadingOverlay>
            <ActivityIndicator size="large" color="#ffffff" />
            <LoadingText>
              {isLoadingCreate ? '시그널 스팟 생성 중...' : '근처 스팟 로드 중...'}
            </LoadingText>
          </LoadingOverlay>
        )}
      </MapContainer>

      {/* Create Spot Modal */}
      <CreateSpotModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateSpot={handleCreateSpot}
        currentLocation={location}
        isLoading={isLoadingCreate}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spotMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ff6b6b',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  spotMarkerText: {
    fontSize: 20,
  },
  createButtonText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  myLocationIcon: {
    fontSize: 24,
  },
  clusterMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#FFFFFF',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clusterText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  calloutContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    minWidth: 200,
    maxWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  calloutContent: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  calloutMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calloutMetaText: {
    fontSize: 12,
    color: '#999',
  },
});

export default MapScreen;