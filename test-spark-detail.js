const axios = require('axios');

const API_URL = 'https://b8f9f23a2649.ngrok-free.app/api';

async function testSparkDetail() {
  try {
    // 1. 로그인
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/phone/authenticate`, {
      phoneNumber: '+821012345678',
      verificationCode: '123456',
      firebaseToken: 'test-token-123'
    });

    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful');

    // 2. 스파크 목록 가져오기
    console.log('\n2. Getting spark list...');
    const sparksResponse = await axios.get(`${API_URL}/sparks`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });

    const sparks = sparksResponse.data.data;
    console.log(`✅ Found ${sparks.length} sparks`);

    if (sparks.length === 0) {
      console.log('No sparks found to test');
      return;
    }

    // 3. 첫 번째 스파크의 상세 정보 가져오기
    const sparkId = sparks[0].id;
    console.log(`\n3. Getting spark detail for ID: ${sparkId}`);
    
    const detailResponse = await axios.get(`${API_URL}/sparks/${sparkId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });

    const sparkDetail = detailResponse.data.data;
    console.log('✅ Spark detail response:');
    console.log(JSON.stringify(sparkDetail, null, 2));

    // otherUser 정보 확인
    if (sparkDetail.otherUser) {
      console.log('\n✅ Found otherUser info:');
      console.log('- nickname:', sparkDetail.otherUser.nickname);
      console.log('- bio:', sparkDetail.otherUser.bio);
      console.log('- occupation:', sparkDetail.otherUser.occupation);
      console.log('- location:', sparkDetail.otherUser.location);
      console.log('- interests:', sparkDetail.otherUser.interests);
      console.log('- skills:', sparkDetail.otherUser.skills);
      console.log('- languages:', sparkDetail.otherUser.languages);
    } else {
      console.log('\n❌ No otherUser info found in response');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testSparkDetail();