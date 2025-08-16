const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// 서울 주요 지역의 좌표
const locations = [
  { name: '서울시청', lat: 37.5665, lng: 126.978 },
  { name: '강남역', lat: 37.4979, lng: 127.0276 },
  { name: '홍대입구', lat: 37.5563, lng: 126.9219 },
  { name: '명동', lat: 37.5636, lng: 126.9869 },
  { name: '동대문', lat: 37.5714, lng: 127.0098 },
  { name: '신촌', lat: 37.5585, lng: 126.9388 },
  { name: '이태원', lat: 37.5345, lng: 126.9946 },
  { name: '성수동', lat: 37.5447, lng: 127.0557 },
  { name: '북촌한옥마을', lat: 37.5826, lng: 126.9831 },
  { name: '남산타워', lat: 37.5512, lng: 126.9882 },
];

const messages = [
  '오늘 날씨 정말 좋네요! ☀️',
  '이 근처 맛집 추천해주세요~',
  '같이 카페에서 공부하실 분?',
  '주말에 함께 등산 가실 분 구해요!',
  '이 지역 처음인데 구경하고 있어요',
  '퇴근 후 치맥 한잔 하실 분?',
  '반려견 산책 같이 하실 분 있나요?',
  '오늘 저녁 운동 파트너 구합니다',
  '주말 브런치 같이 드실 분~',
  '이 근처 좋은 서점 있나요?',
];

async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'Test123!@#'
    });
    
    return response.data.data.access_token;
  } catch (error) {
    console.error('로그인 실패:', error.response?.data || error.message);
    throw error;
  }
}

async function createSpot(token, spotData) {
  try {
    const response = await axios.post(
      `${API_URL}/signal-spots`,
      spotData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Signal Spot 생성 실패:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('로그인 중...');
    const token = await login();
    console.log('로그인 성공!');
    
    console.log('\nSignal Spot 생성 시작...\n');
    
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      const message = messages[i];
      
      // 랜덤하게 위치를 약간 조정 (반경 1km 내)
      const latOffset = (Math.random() - 0.5) * 0.01;
      const lngOffset = (Math.random() - 0.5) * 0.01;
      
      const spotData = {
        content: message,
        title: `${location.name} 근처`,
        latitude: location.lat + latOffset,
        longitude: location.lng + lngOffset,
        durationHours: Math.floor(Math.random() * 48) + 24, // 24-72시간
        radiusInMeters: Math.floor(Math.random() * 500) + 100, // 100-600m
        visibility: 'public',
        type: 'general',
        tags: ['social', 'meetup']
      };
      
      try {
        const result = await createSpot(token, spotData);
        console.log(`✅ ${i + 1}. "${spotData.title}" Signal Spot 생성 완료`);
        console.log(`   위치: ${spotData.latitude.toFixed(4)}, ${spotData.longitude.toFixed(4)}`);
        console.log(`   메시지: ${spotData.content}`);
      } catch (error) {
        console.log(`❌ ${i + 1}. "${spotData.title}" Signal Spot 생성 실패`);
      }
      
      // API 부하를 줄이기 위해 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n✨ Signal Spot 생성 완료!');
    
  } catch (error) {
    console.error('오류 발생:', error);
    process.exit(1);
  }
}

main();