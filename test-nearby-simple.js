const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testNearbySimple() {
  try {
    console.log('🧪 Testing Nearby API Simple');
    
    // Authentication
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'postgis@example.com',
      password: 'Password123!'
    });
    
    const headers = {
      'Authorization': `Bearer ${loginResponse.data.data.accessToken}`,
      'Content-Type': 'application/json'
    };
    
    // Test nearby API
    console.log('\n🔍 Testing nearby API...');
    const nearbyResponse = await axios.get(`${API_BASE_URL}/signal-spots/nearby`, {
      headers,
      params: {
        latitude: 37.5665,
        longitude: 126.9780,
        radiusKm: 10
      }
    });
    
    console.log('✅ Nearby API Success!');
    console.log('Response structure:', {
      success: nearbyResponse.data.success,
      count: nearbyResponse.data.count,
      dataLength: nearbyResponse.data.data?.length || 0,
      message: nearbyResponse.data.message
    });
    
    if (nearbyResponse.data.data && nearbyResponse.data.data.length > 0) {
      console.log('\n📍 Found Signal Spots:');
      nearbyResponse.data.data.forEach((spot, index) => {
        console.log(`   ${index + 1}. [${spot.location?.latitude || 'N/A'}, ${spot.location?.longitude || 'N/A'}] - "${spot.title}" - ${spot.message?.substring(0, 50) || 'No content'}${(spot.message?.length || 0) > 50 ? '...' : ''}`);
      });
      
      console.log('\n✅ Flutter 지도 마커가 표시될 수 있습니다!');
      console.log('   💡 nearbySignalSpotsProvider가 이 데이터를 사용합니다');
      console.log('   🗺️ _buildMarkers()가 마커를 생성합니다');
    } else {
      console.log('\n⚠️  근처에 Signal Spot이 없습니다');
      console.log('   💡 새로운 Signal Spot을 생성하면 표시됩니다');
    }
    
  } catch (error) {
    console.log('\n❌ Nearby API Test FAILED:', error.response?.status);
    if (error.response?.data) {
      console.log('   Error details:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('   Error:', error.message);
    }
  }
}

testNearbySimple();