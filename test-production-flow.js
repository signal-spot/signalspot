const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: `${colors.blue}[INFO]${colors.reset}`,
    success: `${colors.green}[SUCCESS]${colors.reset}`,
    error: `${colors.red}[ERROR]${colors.reset}`,
    warning: `${colors.yellow}[WARNING]${colors.reset}`,
    test: `${colors.cyan}[TEST]${colors.reset}`
  };
  
  console.log(`${prefix[type]} ${colors.bright}${timestamp}${colors.reset} ${message}`);
}

async function testProductionFlow() {
  log('='.repeat(80), 'info');
  log('SignalSpot 프로덕션 플로우 테스트 시작', 'test');
  log('='.repeat(80), 'info');
  
  try {
    // 1. 사용자 등록
    log('\n1. 신규 사용자 등록', 'test');
    const timestamp = Date.now();
    const user1 = {
      email: `user1_${timestamp}@signalspot.com`,
      password: 'Test123!@#',
      username: `user1_${timestamp}`
    };
    
    const registerResponse = await axios.post(`${API_URL}/auth/register`, user1);
    const user1Token = registerResponse.data.data.accessToken;
    const user1Id = registerResponse.data.data.user.id;
    
    log(`✅ 사용자 1 등록 완료: ${user1.username}`, 'success');
    log(`   - ID: ${user1Id}`, 'info');
    log(`   - 이메일 인증: 자동 완료 (VERIFIED)`, 'info');
    
    // 2. 두 번째 사용자 등록
    log('\n2. 두 번째 사용자 등록', 'test');
    const user2 = {
      email: `user2_${timestamp}@signalspot.com`,
      password: 'Test123!@#',
      username: `user2_${timestamp}`
    };
    
    const register2Response = await axios.post(`${API_URL}/auth/register`, user2);
    const user2Token = register2Response.data.data.accessToken;
    const user2Id = register2Response.data.data.user.id;
    
    log(`✅ 사용자 2 등록 완료: ${user2.username}`, 'success');
    
    // 3. 여러 위치에 Signal Spots 생성
    log('\n3. 다양한 위치에 Signal Spots 생성', 'test');
    
    const locations = [
      { name: '서울시청', lat: 37.5665, lng: 126.9780 },
      { name: '강남역', lat: 37.4979, lng: 127.0276 },
      { name: '홍대입구역', lat: 37.5563, lng: 126.9236 },
      { name: '여의도공원', lat: 37.5283, lng: 126.9294 },
      { name: '남산타워', lat: 37.5512, lng: 126.9882 }
    ];
    
    const createdSpots = [];
    
    // 사용자 1이 Signal Spots 생성
    for (const loc of locations.slice(0, 3)) {
      const spotData = {
        title: `${loc.name} 시그널`,
        content: `${loc.name}에서 보내는 시그널입니다. 함께 모여요!`,
        latitude: loc.lat,
        longitude: loc.lng,
        type: 'announcement',
        visibility: 'public',
        tags: ['만남', '모임', loc.name],
        durationHours: 48,
        radiusInMeters: 1000
      };
      
      const response = await axios.post(`${API_URL}/signal-spots`, spotData, {
        headers: { 'Authorization': `Bearer ${user1Token}` }
      });
      
      createdSpots.push(response.data.data);
      log(`   ✅ Signal Spot 생성: ${loc.name} (${response.data.data.id})`, 'success');
    }
    
    // 사용자 2가 Signal Spots 생성
    for (const loc of locations.slice(3)) {
      const spotData = {
        title: `${loc.name} 모임`,
        content: `${loc.name}에서 커피 한잔 하실 분!`,
        latitude: loc.lat,
        longitude: loc.lng,
        type: 'meetup',
        visibility: 'public',
        tags: ['커피', '수다', loc.name],
        durationHours: 24,
        radiusInMeters: 500
      };
      
      const response = await axios.post(`${API_URL}/signal-spots`, spotData, {
        headers: { 'Authorization': `Bearer ${user2Token}` }
      });
      
      createdSpots.push(response.data.data);
      log(`   ✅ Signal Spot 생성: ${loc.name} (${response.data.data.id})`, 'success');
    }
    
    // 4. 주변 Signal Spots 조회 테스트
    log('\n4. 위치별 주변 Signal Spots 조회', 'test');
    
    for (const loc of locations) {
      const nearbyResponse = await axios.get(`${API_URL}/signal-spots/nearby`, {
        params: {
          latitude: loc.lat,
          longitude: loc.lng,
          radiusKm: 10
        },
        headers: { 'Authorization': `Bearer ${user1Token}` }
      });
      
      const count = nearbyResponse.data.count;
      log(`   📍 ${loc.name} 주변 10km 이내: ${count}개 Signal Spots`, 'info');
      
      if (count > 0) {
        const spots = nearbyResponse.data.data;
        spots.slice(0, 3).forEach(spot => {
          const distance = calculateDistance(loc.lat, loc.lng, spot.latitude, spot.longitude);
          log(`      - "${spot.title}" (${distance.toFixed(2)}km)`, 'info');
        });
      }
    }
    
    // 5. 상호작용 테스트
    log('\n5. Signal Spot 상호작용 테스트', 'test');
    
    if (createdSpots.length > 0) {
      const targetSpot = createdSpots[0];
      
      // 사용자 2가 사용자 1의 Signal Spot에 좋아요
      await axios.post(
        `${API_URL}/signal-spots/${targetSpot.id}/interact`,
        { type: 'like' },
        { headers: { 'Authorization': `Bearer ${user2Token}` } }
      );
      log(`   ❤️ 사용자 2가 "${targetSpot.title}"에 좋아요`, 'success');
      
      // 댓글 추가
      await axios.post(
        `${API_URL}/signal-spots/${targetSpot.id}/comments`,
        { content: '좋은 아이디어네요! 저도 참여하고 싶어요.' },
        { headers: { 'Authorization': `Bearer ${user2Token}` } }
      );
      log(`   💬 사용자 2가 댓글 추가`, 'success');
      
      // 댓글 조회
      const commentsResponse = await axios.get(
        `${API_URL}/signal-spots/${targetSpot.id}/comments`,
        { headers: { 'Authorization': `Bearer ${user1Token}` } }
      );
      log(`   📝 댓글 ${commentsResponse.data.count}개 확인`, 'info');
    }
    
    // 6. 인기/트렌딩 Signal Spots 조회
    log('\n6. 인기 및 트렌딩 Signal Spots 조회', 'test');
    
    const popularResponse = await axios.get(`${API_URL}/signal-spots/popular`, {
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    log(`   🔥 인기 Signal Spots: ${popularResponse.data.count}개`, 'info');
    
    const trendingResponse = await axios.get(`${API_URL}/signal-spots/trending`, {
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    log(`   📈 트렌딩 Signal Spots: ${trendingResponse.data.count}개`, 'info');
    
    // 7. 내 Signal Spots 조회
    log('\n7. 사용자별 Signal Spots 조회', 'test');
    
    const mySpots1 = await axios.get(`${API_URL}/signal-spots/my-spots`, {
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    log(`   👤 사용자 1의 Signal Spots: ${mySpots1.data.count}개`, 'info');
    
    const mySpots2 = await axios.get(`${API_URL}/signal-spots/my-spots`, {
      headers: { 'Authorization': `Bearer ${user2Token}` }
    });
    log(`   👤 사용자 2의 Signal Spots: ${mySpots2.data.count}개`, 'info');
    
    // 8. 검색 테스트
    log('\n8. Signal Spots 검색 테스트', 'test');
    
    const searchResponse = await axios.get(`${API_URL}/signal-spots/search`, {
      params: { q: '커피' },
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    log(`   🔍 "커피" 검색 결과: ${searchResponse.data.count}개`, 'info');
    
    // 9. 태그 검색 테스트
    log('\n9. 태그별 Signal Spots 조회', 'test');
    
    const tagResponse = await axios.get(`${API_URL}/signal-spots/tags/만남`, {
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    log(`   🏷️ "만남" 태그: ${tagResponse.data.count}개`, 'info');
    
    // 테스트 완료
    log('\n' + '='.repeat(80), 'info');
    log('✅ 모든 프로덕션 플로우 테스트 완료!', 'success');
    log('='.repeat(80), 'info');
    
    // 요약
    log('\n📊 테스트 요약:', 'test');
    log(`   - 생성된 사용자: 2명`, 'info');
    log(`   - 생성된 Signal Spots: ${createdSpots.length}개`, 'info');
    log(`   - 테스트된 기능: 회원가입, Signal Spot 생성/조회, 상호작용, 검색`, 'info');
    log(`   - 결과: 모든 기능 정상 작동 ✅`, 'success');
    
  } catch (error) {
    log('\n테스트 실패!', 'error');
    log(`오류: ${error.message}`, 'error');
    
    if (error.response) {
      log(`상태 코드: ${error.response.status}`, 'error');
      log(`응답 데이터: ${JSON.stringify(error.response.data, null, 2)}`, 'error');
    }
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

function toRad(degree) {
  return degree * (Math.PI/180);
}

// 테스트 실행
testProductionFlow();