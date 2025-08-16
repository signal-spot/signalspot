const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjBlYTg5Yi00MWFkLTRkMDYtYjYzMi01MTA0Y2JhNWVjNzEiLCJlbWFpbCI6InRlc3QzQGV4YW1wbGUuY29tIiwidXNlcm5hbWUiOiJ0ZXN0dXNlcjMiLCJpYXQiOjE3NTQ4NDU3OTMsImV4cCI6MTc1NDg0NjY5M30.9rtG6FVD6vQ7zyYggfhL7Ur113ty7TjgQsmNs-Ea4PU';

// 서울 주요 지점들
const SEOUL_LOCATIONS = {
  '서울시청': { latitude: 37.5665, longitude: 126.9780 },
  '강남역': { latitude: 37.4979, longitude: 127.0276 },
  '홍대입구': { latitude: 37.5563, longitude: 126.9236 },
  '명동': { latitude: 37.5636, longitude: 126.9869 },
  '동대문': { latitude: 37.5714, longitude: 127.0096 }
};

async function testNearbySpots() {
  console.log('🔍 서울 주변 Signal Spots 조회 테스트\n');
  console.log('=' .repeat(50));
  
  for (const [name, location] of Object.entries(SEOUL_LOCATIONS)) {
    console.log(`\n📍 ${name} 주변 검색`);
    console.log(`   위치: (${location.latitude}, ${location.longitude})`);
    
    try {
      // 5km 반경 검색
      const response5km = await axios.get(`${API_URL}/signal-spots/nearby`, {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          radiusKm: 5,
          limit: 10
        },
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      });
      
      console.log(`   ✅ 5km 반경: ${response5km.data.data?.length || 0}개 발견`);
      
      // 50km 반경 검색
      const response50km = await axios.get(`${API_URL}/signal-spots/nearby`, {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          radiusKm: 50,
          limit: 100
        },
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      });
      
      console.log(`   ✅ 50km 반경: ${response50km.data.data?.length || 0}개 발견`);
      
      // 상세 정보 출력
      if (response50km.data.data && response50km.data.data.length > 0) {
        console.log('   📋 발견된 Signal Spots:');
        response50km.data.data.slice(0, 5).forEach((spot, idx) => {
          const distance = calculateDistance(
            location.latitude, 
            location.longitude,
            spot.latitude,
            spot.longitude
          );
          console.log(`      ${idx + 1}. ${spot.title || '제목 없음'}`);
          console.log(`         위치: (${spot.latitude}, ${spot.longitude})`);
          console.log(`         거리: ${distance.toFixed(2)}km`);
          console.log(`         내용: ${spot.content.substring(0, 30)}...`);
        });
        
        if (response50km.data.data.length > 5) {
          console.log(`      ... 외 ${response50km.data.data.length - 5}개 더`);
        }
      }
      
    } catch (error) {
      console.error(`   ❌ 오류: ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ 테스트 완료\n');
}

async function createTestSpot() {
  console.log('📝 테스트 Signal Spot 생성\n');
  
  const testSpot = {
    content: `테스트 Signal Spot - ${new Date().toLocaleString('ko-KR')}`,
    title: `서울시청 테스트 ${Date.now()}`,
    latitude: 37.5665 + (Math.random() - 0.5) * 0.001, // 약간의 랜덤 위치
    longitude: 126.9780 + (Math.random() - 0.5) * 0.001,
    tags: ['테스트', '서울시청', '디버깅'],
    mediaUrls: []
  };
  
  try {
    const response = await axios.post(`${API_URL}/signal-spots`, testSpot, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Signal Spot 생성 성공!');
    console.log(`   ID: ${response.data.data.id}`);
    console.log(`   제목: ${response.data.data.title}`);
    console.log(`   위치: (${response.data.data.latitude}, ${response.data.data.longitude})`);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ 생성 실패:', error.response?.data?.message || error.message);
    return null;
  }
}

// 거리 계산 함수 (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 지구 반경 (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI/180);
}

// 메인 실행
async function main() {
  console.log('🚀 Signal Spot API 테스트 시작\n');
  
  // 1. 현재 Signal Spots 조회
  await testNearbySpots();
  
  // 2. 새 Signal Spot 생성
  const newSpot = await createTestSpot();
  
  if (newSpot) {
    // 3. 잠시 대기 후 다시 조회
    console.log('\n⏳ 1초 대기 후 다시 조회...\n');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testNearbySpots();
  }
}

main().catch(console.error);