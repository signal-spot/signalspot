const axios = require('axios');

const API_URL = 'https://b8f9f23a2649.ngrok-free.app/api';

async function testCreateAndGetSpark() {
  try {
    // 1. 첫 번째 사용자 로그인
    console.log('1. Logging in as user 1...');
    const login1Response = await axios.post(`${API_URL}/auth/phone/authenticate`, {
      phoneNumber: '+821012345678',
      verificationCode: '123456',
      firebaseToken: 'test-token-123'
    });
    const token1 = login1Response.data.data.accessToken;
    const user1Id = login1Response.data.data.user.id;
    console.log('✅ User 1 logged in:', user1Id);

    // 2. 두 번째 사용자 로그인 (다른 번호)
    console.log('\n2. Logging in as user 2...');
    const login2Response = await axios.post(`${API_URL}/auth/phone/authenticate`, {
      phoneNumber: '+821098765432',
      verificationCode: '123456',
      firebaseToken: 'test-token-456'
    });
    const token2 = login2Response.data.data.accessToken;
    const user2Id = login2Response.data.data.user.id;
    console.log('✅ User 2 logged in:', user2Id);

    // 3. User 2의 프로필 업데이트
    console.log('\n3. Updating User 2 profile...');
    await axios.put(`${API_URL}/profile/me`, {
      username: 'TestUser2',
      bio: '안녕하세요, 테스트 사용자 2입니다',
      occupation: '소프트웨어 개발자',
      location: '서울',
      interests: ['프로그래밍', '음악', '여행'],
      skills: ['JavaScript', 'React', 'Node.js'],
      languages: ['한국어', '영어']
    }, {
      headers: {
        'Authorization': `Bearer ${token2}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });
    console.log('✅ User 2 profile updated');

    // 4. User 1이 User 2에게 스파크 보내기
    console.log('\n4. Sending spark from User 1 to User 2...');
    const sendSparkResponse = await axios.post(`${API_URL}/sparks`, {
      user2Id: user2Id,
      message: '안녕하세요! 스파크를 보냅니다.'
    }, {
      headers: {
        'Authorization': `Bearer ${token1}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });
    const sparkId = sendSparkResponse.data.data.id;
    console.log('✅ Spark sent with ID:', sparkId);

    // 5. User 1이 스파크 상세 정보 조회
    console.log('\n5. Getting spark detail as User 1...');
    const detailResponse = await axios.get(`${API_URL}/sparks/${sparkId}`, {
      headers: {
        'Authorization': `Bearer ${token1}`,
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
    if (error.response?.data?.message) {
      console.error('Error message:', error.response.data.message);
    }
  }
}

testCreateAndGetSpark();