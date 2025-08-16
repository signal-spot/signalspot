const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function register() {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email: 'test@example.com',
      password: 'Test123!@#',
      username: 'testuser'
    });
    
    console.log('✅ 계정 생성 성공!');
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('⚠️  계정이 이미 존재합니다. 기존 계정을 사용합니다.');
      return null;
    }
    console.error('계정 생성 실패:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('테스트 계정 생성 중...');
    await register();
    console.log('\n이제 create-test-spots.js를 실행할 수 있습니다.');
  } catch (error) {
    console.error('오류 발생:', error);
    process.exit(1);
  }
}

main();