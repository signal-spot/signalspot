const axios = require('axios');

const API_BASE_URL = 'https://lettie.co.kr/signalspot/api';

async function testAPI() {
  try {
    // 1. 로그인
    console.log('🔐 로그인 시도...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'anonymous2024@example.com',
      password: 'Anonymous123!'
    });
    
    const accessToken = loginResponse.data.data.accessToken;
    console.log('✅ 로그인 성공');
    
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    
    // 2. 시그널스팟 생성 테스트
    console.log('\n📍 시그널스팟 생성 테스트...');
    const testData = {
      content: '테스트 메시지입니다',
      title: '테스트 제목',
      latitude: 37.5012,
      longitude: 127.0396,
      radiusInMeters: 300,
      durationHours: 48,
      tags: ['테스트', '익명']
    };
    
    console.log('요청 데이터:', JSON.stringify(testData, null, 2));
    
    try {
      const response = await axios.post(`${API_BASE_URL}/signal-spots`, testData, { headers });
      console.log('✅ 생성 성공!');
      console.log('응답:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ 생성 실패');
      console.log('에러 상태:', error.response?.status);
      console.log('에러 메시지:', error.response?.data);
      
      // 상세 에러 정보
      if (error.response?.data?.errors) {
        console.log('검증 에러:', JSON.stringify(error.response.data.errors, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ 실패:', error.message);
    if (error.response?.data) {
      console.log('에러 상세:', error.response.data);
    }
  }
}

testAPI();