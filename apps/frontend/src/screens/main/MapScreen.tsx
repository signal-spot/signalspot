import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Circle, Region } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { useLocation } from '../../hooks/useLocation';
import { useAuth } from '../../providers/AuthProvider';
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

interface SignalSpot {
  id: string;
  latitude: number;
  longitude: number;
  content: string;
  createdAt: string;
  isActive: boolean;
}

const MapScreen: React.FC = () => {
  const { location, getCurrentLocation, requestLocationPermission } = useLocation();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [spotContent, setSpotContent] = useState('');
  const [spots, setSpots] = useState<SignalSpot[]>([]);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 37.5665,
    longitude: 126.9780,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Focus effect to refresh location when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      handleGetCurrentLocation();
    }, [])
  );

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
    if (!spotContent.trim()) {
      Alert.alert('알림', '시그널 메시지를 입력해주세요.');
      return;
    }

    if (!location) {
      Alert.alert('위치 오류', '현재 위치를 가져올 수 없습니다.');
      return;
    }

    try {
      // TODO: Implement API call to create signal spot
      const newSpot: SignalSpot = {
        id: Date.now().toString(),
        latitude: location.latitude,
        longitude: location.longitude,
        content: spotContent,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      setSpots(prev => [...prev, newSpot]);
      setSpotContent('');
      setShowCreateModal(false);
      
      Alert.alert('성공', '시그널 스팟이 생성되었습니다!');
    } catch (error) {
      console.error('Error creating spot:', error);
      Alert.alert('오류', '시그널 스팟 생성에 실패했습니다.');
    }
  };

  const handleSpotPress = (spot: SignalSpot) => {
    Alert.alert(
      '시그널 스팟',
      spot.content,
      [
        { text: '닫기', style: 'cancel' },
        { text: '나일지도?', onPress: () => handleSpotInteraction(spot) }
      ]
    );
  };

  const handleSpotInteraction = (spot: SignalSpot) => {
    // TODO: Implement spot interaction logic
    Alert.alert('시그널 스팟', '상호작용 기능이 곧 구현됩니다!');
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
          {spots.map((spot) => (
            <Marker
              key={spot.id}
              coordinate={{
                latitude: spot.latitude,
                longitude: spot.longitude,
              }}
              title="시그널 스팟"
              description={spot.content}
              onPress={() => handleSpotPress(spot)}
            >
              <View style={styles.spotMarker}>
                <Text style={styles.spotMarkerText}>💌</Text>
              </View>
            </Marker>
          ))}
        </MapView>

        {/* My Location Button */}
        <MyLocationButton onPress={handleGetCurrentLocation}>
          <Text style={styles.myLocationIcon}>📍</Text>
        </MyLocationButton>

        {/* Create Spot Button */}
        <FloatingButton onPress={() => setShowCreateModal(true)}>
          <Text style={styles.createButtonText}>+</Text>
        </FloatingButton>
      </MapContainer>

      {/* Create Spot Modal */}
      {showCreateModal && (
        <CreateSpotModal>
          <ModalTitle>새로운 시그널 스팟 만들기</ModalTitle>
          <TextInput
            placeholder="어떤 시그널을 남기고 싶나요?"
            value={spotContent}
            onChangeText={setSpotContent}
            multiline
            maxLength={200}
          />
          <ButtonRow>
            <Button variant="secondary" onPress={() => setShowCreateModal(false)}>
              <ButtonText variant="secondary">취소</ButtonText>
            </Button>
            <Button variant="primary" onPress={handleCreateSpot}>
              <ButtonText variant="primary">만들기</ButtonText>
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