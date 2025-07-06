import React, { useState, useEffect, useCallback } from 'react';
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
import MapView, { Marker, Circle, Region } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { useLocation } from '../../hooks/useLocation';
import { useAuth } from '../../providers/AuthProvider';
import { signalSpotService, SignalSpot, CreateSpotRequest } from '../../services/signalSpot.service';
import { useLoadingState } from '../../services/api.service';
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
  
  // Loading states
  const isLoadingNearby = useLoadingState('nearbySpots');
  const isLoadingCreate = useLoadingState('createSpot');
  
  // State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [spotTitle, setSpotTitle] = useState('');
  const [spotContent, setSpotContent] = useState('');
  const [spotType, setSpotType] = useState<'social' | 'help' | 'event' | 'info' | 'alert'>('social');
  const [spots, setSpots] = useState<SignalSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<SignalSpot | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 37.5665,
    longitude: 126.9780,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const spotTypes = [
    { key: 'social', label: '💬', name: 'Social' },
    { key: 'help', label: '🆘', name: 'Help' },
    { key: 'event', label: '🎉', name: 'Event' },
    { key: 'info', label: 'ℹ️', name: 'Info' },
    { key: 'alert', label: '⚠️', name: 'Alert' },
  ] as const;

  // Load nearby spots
  const loadNearbySpots = useCallback(async () => {
    if (!location) return;

    try {
      const response = await signalSpotService.getNearbySpots({
        latitude: location.latitude,
        longitude: location.longitude,
        radiusKm: 2,
        limit: 50,
        includeExpired: false,
      });

      if (response.success) {
        setSpots(response.data);
      }
    } catch (error) {
      console.error('Error loading nearby spots:', error);
      Alert.alert('오류', '근처 시그널 스팟을 불러오는데 실패했습니다.');
    }
  }, [location]);

  // Focus effect to refresh location and spots when screen is focused
  useFocusEffect(
    useCallback(() => {
      handleGetCurrentLocation();
    }, [])
  );

  // Load spots when location changes
  useEffect(() => {
    if (location) {
      loadNearbySpots();
    }
  }, [location, loadNearbySpots]);

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

  const handleCreateSpot = async () => {
    if (!spotTitle.trim()) {
      Alert.alert('알림', '시그널 제목을 입력해주세요.');
      return;
    }

    if (!spotContent.trim()) {
      Alert.alert('알림', '시그널 메시지를 입력해주세요.');
      return;
    }

    if (!location) {
      Alert.alert('위치 오류', '현재 위치를 가져올 수 없습니다.');
      return;
    }

    try {
      const spotData: CreateSpotRequest = {
        latitude: location.latitude,
        longitude: location.longitude,
        title: spotTitle,
        content: spotContent,
        type: spotType,
        visibility: 'public',
        radius: 100,
        maxDuration: 24,
      };

      const validationErrors = signalSpotService.validateSpotData(spotData);
      if (validationErrors.length > 0) {
        Alert.alert('입력 오류', validationErrors.join('\n'));
        return;
      }

      const response = await signalSpotService.createSpot(spotData);

      if (response.success) {
        setSpots(prev => [...prev, response.data]);
        setSpotTitle('');
        setSpotContent('');
        setSpotType('social');
        setShowCreateModal(false);
        
        Alert.alert('성공', '시그널 스팟이 생성되었습니다!');
      }
    } catch (error: any) {
      console.error('Error creating spot:', error);
      Alert.alert('오류', error.message || '시그널 스팟 생성에 실패했습니다.');
    }
  };

  const handleSpotPress = (spot: SignalSpot) => {
    setSelectedSpot(spot);
    
    const distance = signalSpotService.getSpotDistance(spot, location?.latitude || 0, location?.longitude || 0);
    const formattedDistance = signalSpotService.formatSpotDistance(distance);
    
    Alert.alert(
      `${signalSpotService.getSpotTypeIcon(spot.type)} ${spot.title}`,
      `${spot.content}\n\n거리: ${formattedDistance}\n생성자: ${spot.creatorUsername}\n좋아요: ${spot.likeCount} | 댓글: ${spot.replyCount}`,
      [
        { text: '닫기', style: 'cancel' },
        { text: '상세보기', onPress: () => handleViewSpotDetails(spot) },
        { text: '❤️ 좋아요', onPress: () => handleSpotInteraction(spot, 'like') }
      ]
    );
  };

  const handleViewSpotDetails = async (spot: SignalSpot) => {
    try {
      const response = await signalSpotService.getSpotById(spot.id);
      if (response.success) {
        // TODO: Navigate to spot details screen
        Alert.alert('상세 정보', `스팟 ID: ${spot.id}\n활성 상태: ${response.data.isActive ? '활성' : '비활성'}`);
      }
    } catch (error: any) {
      Alert.alert('오류', '상세 정보를 불러올 수 없습니다.');
    }
  };

  const handleSpotInteraction = async (spot: SignalSpot, type: 'like' | 'dislike' | 'share' | 'report') => {
    try {
      const response = await signalSpotService.interactWithSpot(spot.id, { type });
      
      if (response.success) {
        // Update the spot in the list
        setSpots(prev => 
          prev.map(s => s.id === spot.id ? response.data : s)
        );
        
        switch (type) {
          case 'like':
            Alert.alert('성공', '좋아요를 눌렀습니다!');
            break;
          case 'share':
            Alert.alert('성공', '시그널 스팟을 공유했습니다!');
            break;
          case 'report':
            Alert.alert('성공', '신고가 접수되었습니다.');
            break;
        }
      }
    } catch (error: any) {
      console.error('Error interacting with spot:', error);
      Alert.alert('오류', error.message || '상호작용에 실패했습니다.');
    }
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
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsPointsOfInterest={false}
          showsCompass={false}
          showsScale={false}
          showsBuildings={false}
          showsTraffic={false}
          showsIndoors={false}
          onPress={() => setSelectedSpot(null)}
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

          {/* Signal spots */}
          {spots.map((spot) => {
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
                title={`${typeIcon} ${spot.title}`}
                description={spot.content}
                onPress={() => handleSpotPress(spot)}
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
              </Marker>
            );
          })}
        </MapView>

        {/* Spot Counter */}
        <SpotCounter>
          <SpotCounterText>{spots.length}개 스팟</SpotCounterText>
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
      {showCreateModal && (
        <CreateSpotModal>
          <ModalTitle>새로운 시그널 스팟 만들기</ModalTitle>
          
          <SpotTypeSelector>
            {spotTypes.map((type) => (
              <SpotTypeButton
                key={type.key}
                selected={spotType === type.key}
                onPress={() => setSpotType(type.key as typeof spotType)}
              >
                <SpotTypeText selected={spotType === type.key}>
                  {type.label}
                </SpotTypeText>
              </SpotTypeButton>
            ))}
          </SpotTypeSelector>

          <TextInput
            placeholder="시그널 제목"
            value={spotTitle}
            onChangeText={setSpotTitle}
            maxLength={100}
            style={{ marginBottom: 10 }}
          />
          
          <TextInput
            placeholder="어떤 시그널을 남기고 싶나요?"
            value={spotContent}
            onChangeText={setSpotContent}
            multiline
            maxLength={500}
          />
          
          <ButtonRow>
            <Button 
              variant="secondary" 
              onPress={() => {
                setShowCreateModal(false);
                setSpotTitle('');
                setSpotContent('');
                setSpotType('social');
              }}
            >
              <ButtonText variant="secondary">취소</ButtonText>
            </Button>
            <Button 
              variant="primary" 
              onPress={handleCreateSpot}
              disabled={isLoadingCreate}
            >
              <ButtonText variant="primary">
                {isLoadingCreate ? '생성 중...' : '만들기'}
              </ButtonText>
            </Button>
          </ButtonRow>
        </CreateSpotModal>
      )}
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
});

export default MapScreen;