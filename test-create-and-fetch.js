const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testAPI() {
  try {
    // 1. 회원가입
    console.log('1. 새 계정 생성...');
    const registerData = {
      email: `test${Date.now()}@example.com`,
      password: 'Test123!@#',
      username: `testuser${Date.now()}`
    };
    
    let registerResponse;
    try {
      registerResponse = await axios.post(`${API_URL}/auth/register`, registerData);
      console.log('회원가입 성공');
    } catch (error) {
      console.log('회원가입 실패:', error.response?.data);
      // 기존 테스트 계정으로 시도
      registerData.email = 'test@example.com';
      registerData.password = 'Test123!@#';
    }
    
    // 2. 로그인
    console.log('\n2. 로그인...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: registerData.email,
      password: registerData.password
    });
    
    const { accessToken } = loginResponse.data;
    console.log('로그인 성공, 토큰 획득');
    
    // 3. Signal Spot 생성
    console.log('\n3. 테스트 Signal Spot 생성...');
    const spotData = {
      title: '테스트 시그널 스팟',
      description: '이것은 테스트 시그널 스팟입니다',
      latitude: 37.5665,
      longitude: 126.9780,
      signalType: 'CONNECTION',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    const createResponse = await axios.post(`${API_URL}/signal-spots`, spotData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('Signal Spot 생성 성공:', createResponse.data);
    
    // 4. Nearby API 호출
    console.log('\n4. Nearby Signal Spots 조회...');
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
    
    console.log('Nearby 응답 (데이터 개수):', nearbyResponse.data?.length || 0);
    console.log('Nearby 응답 상세:', JSON.stringify(nearbyResponse.data, null, 2));
    
    // 5. 전체 조회
    console.log('\n5. 모든 Signal Spots 조회...');
    const allResponse = await axios.get(`${API_URL}/signal-spots`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('전체 Signal Spots (개수):', allResponse.data?.length || 0);
    if (allResponse.data?.length > 0) {
      console.log('첫 번째 Signal Spot:', JSON.stringify(allResponse.data[0], null, 2));
    }
    
  } catch (error) {
    console.error('API 테스트 실패:', error.response?.data || error.message);
    if (error.response) {
      console.error('상태 코드:', error.response.status);
      console.error('응답 헤더:', error.response.headers);
    }
  }
}

testAPI();