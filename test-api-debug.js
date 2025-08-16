const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testAPI() {
  try {
    // 1. 로그인
    console.log('1. 로그인 시도...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'test123'
    });
    
    const { accessToken } = loginResponse.data;
    console.log('로그인 성공, 토큰 획득');
    
    // 2. nearby API 호출
    console.log('\n2. Nearby Signal Spots API 호출...');
    const nearbyResponse = await axios.get(`${API_URL}/signal-spots/nearby`, {
      params: {
        latitude: 37.5665,
        longitude: 126.9780,
        radiusKm: 5
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('Nearby API 응답:', JSON.stringify(nearbyResponse.data, null, 2));
    
    // 3. 모든 signal spots 조회
    console.log('\n3. 모든 Signal Spots 조회...');
    const allSpotsResponse = await axios.get(`${API_URL}/signal-spots`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('전체 Signal Spots:', JSON.stringify(allSpotsResponse.data, null, 2));
    
    // 4. 데이터베이스 직접 쿼리 (디버그용)
    console.log('\n4. 데이터베이스 확인을 위한 내 signal spots 조회...');
    const mySpotsResponse = await axios.get(`${API_URL}/signal-spots/my-spots`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('내 Signal Spots:', JSON.stringify(mySpotsResponse.data, null, 2));
    
  } catch (error) {
    console.error('API 테스트 실패:', error.response?.data || error.message);
    if (error.response) {
      console.error('상태 코드:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    }
  }
}

testAPI();