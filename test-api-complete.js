const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testAPI() {
  try {
    // 1. 회원가입
    console.log('===== 1. 회원가입 =====');
    const timestamp = Date.now();
    const registerData = {
      email: `test${timestamp}@example.com`,
      password: 'Test123!@#',
      username: `testuser${timestamp}`
    };
    
    const registerResponse = await axios.post(`${API_URL}/auth/register`, registerData);
    console.log('회원가입 성공');
    console.log('응답 구조:', Object.keys(registerResponse.data));
    
    // accessToken 직접 가져오기
    const accessToken = registerResponse.data.data.accessToken;
    console.log('토큰 획득:', accessToken ? '성공' : '실패');
    
    if (!accessToken) {
      console.error('토큰이 없습니다. 응답:', registerResponse.data);
      return;
    }
    
    // 2. 프로필 확인 (인증 테스트)
    console.log('\n===== 2. 프로필 확인 =====');
    const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    console.log('프로필:', profileResponse.data);
    
    // 3. Signal Spot 생성
    console.log('\n===== 3. Signal Spot 생성 =====');
    const spotData = {
      title: '테스트 시그널 스팟',
      content: '이것은 테스트 시그널 스팟입니다. 테스트 콘텐츠',
      latitude: 37.5665,
      longitude: 126.9780,
      type: 'announcement',  // SpotType enum 값 (소문자)
      visibility: 'public',  // SpotVisibility enum 값 (소문자)
      tags: ['test', 'demo'],
      durationHours: 24,
      radiusInMeters: 500
    };
    
    console.log('생성할 데이터:', spotData);
    
    const createResponse = await axios.post(`${API_URL}/signal-spots`, spotData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Signal Spot 생성 성공');
    console.log('생성된 Spot:', JSON.stringify(createResponse.data, null, 2));
    
    // 4. Nearby API 호출
    console.log('\n===== 4. Nearby Signal Spots 조회 =====');
    const nearbyResponse = await axios.get(`${API_URL}/signal-spots/nearby`, {
      params: {
        latitude: 37.5665,
        longitude: 126.9780,
        radiusKm: 10  // 반경 10km로 확대
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('Nearby 응답 구조:', Object.keys(nearbyResponse.data));
    console.log('데이터 개수:', nearbyResponse.data.count || nearbyResponse.data.data?.length || 0);
    
    if (nearbyResponse.data.data && nearbyResponse.data.data.length > 0) {
      console.log('첫 번째 Signal Spot:', JSON.stringify(nearbyResponse.data.data[0], null, 2));
    } else {
      console.log('데이터가 없습니다. 전체 응답:', JSON.stringify(nearbyResponse.data, null, 2));
    }
    
    // 5. 모든 Signal Spots 조회 (my-spots)
    console.log('\n===== 5. 내 Signal Spots 조회 =====');
    const mySpotsResponse = await axios.get(`${API_URL}/signal-spots/my-spots`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('내 Signal Spots 개수:', mySpotsResponse.data.count || mySpotsResponse.data.data?.length || 0);
    if (mySpotsResponse.data.data && mySpotsResponse.data.data.length > 0) {
      console.log('내 첫 번째 Signal Spot:', JSON.stringify(mySpotsResponse.data.data[0], null, 2));
    }
    
    // 6. 데이터베이스 직접 확인을 위한 로깅
    console.log('\n===== 6. 요약 =====');
    console.log('생성한 Signal Spot ID:', createResponse.data.data?.id);
    console.log('Nearby에서 찾은 개수:', nearbyResponse.data.count || 0);
    console.log('내 Spots에서 찾은 개수:', mySpotsResponse.data.count || 0);
    
  } catch (error) {
    console.error('\n===== 오류 발생 =====');
    console.error('오류 메시지:', error.message);
    if (error.response) {
      console.error('상태 코드:', error.response.status);
      console.error('응답 데이터:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('요청 오류:', error.request);
    } else {
      console.error('설정 오류:', error.message);
    }
  }
}

testAPI();