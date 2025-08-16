const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// 여러 테스트 계정 시도
const TEST_ACCOUNTS = [
  { email: 'test@example.com', password: 'Test1234!@#$' },
  { email: 'test@example.com', password: 'password123' },
  { email: 'test@test.com', password: 'Test1234!' },
  { email: 'user@example.com', password: 'password123' }
];

// 서울시청 근처 테스트 Signal Spots (간단한 버전)
const TEST_SIGNAL_SPOTS = [
  {
    title: '서울시청 테스트 스팟 1',
    content: '테스트 마커 1번입니다.',
    latitude: 37.5665,
    longitude: 126.9780,
    tags: ['테스트']
  },
  {
    title: '서울시청 테스트 스팟 2',
    content: '테스트 마커 2번입니다.',
    latitude: 37.5668,
    longitude: 126.9782,
    tags: ['테스트']
  },
  {
    title: '서울시청 테스트 스팟 3',
    content: '테스트 마커 3번입니다.',
    latitude: 37.5662,
    longitude: 126.9778,
    tags: ['테스트']
  }
];

async function tryLogin(account) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, account);
    // console.log('   전체 로그인 응답:', JSON.stringify(response.data, null, 2));
    
    // data 필드 안에 accessToken이 있는 경우 (이것이 실제 케이스)
    if (response.data.data && response.data.data.accessToken) {
      return response.data.data.accessToken;
    }
    // data 필드 안에 access_token이 있는 경우
    if (response.data.data && response.data.data.access_token) {
      return response.data.data.access_token;
    }
    // 직접 access_token이 있는 경우
    if (response.data.access_token) {
      return response.data.access_token;
    }
    // 직접 accessToken이 있는 경우
    if (response.data.accessToken) {
      return response.data.accessToken;
    }
    
    console.log('   토큰을 찾을 수 없습니다.');
    return null;
  } catch (error) {
    console.log('   로그인 실패:', error.response?.status);
    return null;
  }
}

async function createAccount() {
  const timestamp = Date.now();
  const newAccount = {
    email: `test${timestamp}@example.com`,
    password: 'Test1234!',
    username: `testuser${timestamp}`
  };
  
  try {
    console.log(`새 계정 생성 시도: ${newAccount.email}`);
    await axios.post(`${API_URL}/auth/register`, newAccount);
    console.log('✅ 새 계정 생성 성공!');
    
    // 로그인
    const token = await tryLogin({ email: newAccount.email, password: newAccount.password });
    return token;
  } catch (error) {
    console.error('❌ 계정 생성 실패:', error.response?.data?.message || error.message);
    return null;
  }
}

async function main() {
  let token = null;
  
  // 1. 기존 계정들로 로그인 시도
  console.log('1. 기존 계정으로 로그인 시도 중...');
  for (const account of TEST_ACCOUNTS) {
    console.log(`   시도: ${account.email}`);
    token = await tryLogin(account);
    if (token) {
      console.log(`✅ 로그인 성공: ${account.email}`);
      break;
    }
    // Rate limit 방지를 위한 딜레이
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 2. 모두 실패하면 새 계정 생성
  if (!token) {
    console.log('\n2. 모든 로그인 실패 - 새 계정 생성 중...');
    token = await createAccount();
  }
  
  if (!token) {
    console.error('❌ 인증 실패 - 스크립트를 종료합니다.');
    return;
  }
  
  // 3. Signal Spots 생성
  console.log('\n3. 테스트 Signal Spots 생성 중...');
  const headers = { Authorization: `Bearer ${token}` };
  
  for (const spot of TEST_SIGNAL_SPOTS) {
    try {
      await axios.post(
        `${API_URL}/signal-spots`,
        {
          ...spot,
          mediaUrls: []
        },
        { headers }
      );
      console.log(`✅ 생성 완료: "${spot.title}" (${spot.latitude}, ${spot.longitude})`);
    } catch (error) {
      console.error(`❌ 생성 실패: "${spot.title}"`);
      if (error.response?.data) {
        console.error('   오류 상세:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('   오류:', error.message);
      }
    }
    
    // API 부하 방지
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // 4. 생성된 것 확인
  console.log('\n4. 생성된 Signal Spots 확인 중...');
  try {
    const response = await axios.get(`${API_URL}/signal-spots/nearby`, {
      headers,
      params: {
        latitude: 37.5665,
        longitude: 126.9780,
        radiusKm: 1
      }
    });
    
    console.log(`\n✅ 서울시청 근처 1km 내 Signal Spots: ${response.data.data.length}개`);
    
    if (response.data.data.length > 0) {
      console.log('\n📍 Signal Spots 목록:');
      response.data.data.forEach((spot, index) => {
        console.log(`  ${index + 1}. ${spot.title || 'Untitled'} (${spot.latitude}, ${spot.longitude})`);
      });
    }
  } catch (error) {
    console.error('❌ 확인 실패:', error.response?.data?.message || error.message);
  }
  
  console.log('\n✨ 완료! Flutter 앱에서 지도를 새로고침해보세요.');
}

main().catch(console.error);