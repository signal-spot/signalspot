const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// 추가 위치 5개
const quickLocations = [
  { lat: 37.5579, lng: 127.0068, title: "왕십리역", content: "왕십리역 환승 중에 봤어요" },
  { lat: 37.5443, lng: 126.9685, title: "이태원", content: "이태원 거리에서 스쳐 지나갔어요" },
  { lat: 37.5311, lng: 126.9974, title: "강남역", content: "강남역 11번 출구에서 만났던 것 같아요" },
  { lat: 37.5219, lng: 126.9245, title: "여의도", content: "한강공원에서 자전거 타시던 분?" },
  { lat: 37.5172, lng: 127.0473, title: "잠실역", content: "롯데타워에서 엘리베이터 함께 탔어요" },
];

async function createQuickSpots() {
  try {
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'postgis@example.com',
      password: 'Password123!'
    });
    
    const accessToken = loginResponse.data.data.accessToken;
    console.log('✅ Login successful\n');
    
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    
    console.log('📍 Creating 5 more Signal Spots...\n');
    
    let successCount = 0;
    
    for (const location of quickLocations) {
      try {
        const spotData = {
          content: location.content,
          title: location.title,
          latitude: location.lat,
          longitude: location.lng,
          radiusInMeters: 150,
          durationHours: 48,
          tags: ['우연', '만남', '스파크']
        };
        
        console.log(`Creating: ${location.title}...`);
        
        const response = await axios.post(
          `${API_BASE_URL}/signal-spots`,
          spotData,
          { headers }
        );
        
        if (response.data.success) {
          successCount++;
          console.log(`✅ Created: ${location.title}`);
        }
        
        // 각 요청 사이에 1초 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`❌ Failed: ${location.title} - ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log(`\n✅ Successfully created ${successCount} more Signal Spots!`);
    
    // 전체 Signal Spot 수 확인
    const nearbyResponse = await axios.get(`${API_BASE_URL}/signal-spots/nearby`, {
      headers,
      params: {
        latitude: 37.5665,
        longitude: 126.9780,
        radiusKm: 20,
        limit: 50
      }
    });
    
    console.log(`\n📊 Total Signal Spots in Seoul area: ${nearbyResponse.data.data.length}`);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data?.message || error.message);
  }
}

createQuickSpots();