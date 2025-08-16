const axios = require('axios');

// 테스트 설정
const BASE_URL = 'http://localhost:3000/api/v1';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword123';

async function testCommentLikes() {
  try {
    console.log('🚀 Starting Comment Likes Test...\n');

    // 1. 로그인하여 JWT 토큰 획득
    console.log('📧 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    const token = loginResponse.data.data.access_token;
    const userId = loginResponse.data.data.user.id;
    console.log(`✅ Logged in successfully. User ID: ${userId}\n`);

    // axios 기본 헤더 설정
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // 2. 신호 스팟 목록 가져오기
    console.log('📍 Getting signal spots...');
    const spotsResponse = await axios.get(`${BASE_URL}/signal-spots/nearby`, {
      params: {
        latitude: 37.5665,
        longitude: 126.9780,
        radius: 10000,
        limit: 5
      }
    });

    const spots = spotsResponse.data.data;
    console.log(`✅ Found ${spots.length} signal spots\n`);

    if (spots.length === 0) {
      throw new Error('No signal spots found for testing');
    }

    const testSpot = spots[0];
    console.log(`🎯 Using spot: ${testSpot.title} (${testSpot.id})\n`);

    // 3. 댓글 작성
    console.log('💭 Creating a test comment...');
    const commentResponse = await axios.post(`${BASE_URL}/signal-spots/${testSpot.id}/comments`, {
      content: 'This is a test comment for like functionality testing!'
    });

    const comment = commentResponse.data.data;
    console.log(`✅ Comment created: ${comment.id}\n`);

    // 4. 댓글 목록 조회 (좋아요 상태 확인)
    console.log('📋 Getting comments (initial state)...');
    const commentsResponse1 = await axios.get(`${BASE_URL}/signal-spots/${testSpot.id}/comments`);
    const initialComment = commentsResponse1.data.data.find(c => c.id === comment.id);
    
    console.log(`Initial state:`);
    console.log(`  - Comment ID: ${initialComment.id}`);
    console.log(`  - Like Count: ${initialComment.likes}`);
    console.log(`  - Is Liked: ${initialComment.isLiked}`);
    console.log(`  - Liked By: ${JSON.stringify(initialComment.likedBy || [])}\n`);

    // 5. 좋아요 추가
    console.log('👍 Adding like...');
    const likeResponse1 = await axios.post(`${BASE_URL}/signal-spots/${testSpot.id}/comments/${comment.id}/like`);
    
    console.log(`Like response:`);
    console.log(`  - Success: ${likeResponse1.data.success}`);
    console.log(`  - Is Liked: ${likeResponse1.data.data.isLiked}`);
    console.log(`  - Like Count: ${likeResponse1.data.data.likeCount}`);
    console.log(`  - Liked By: ${JSON.stringify(likeResponse1.data.data.likedBy || [])}`);
    console.log(`  - Message: ${likeResponse1.data.message}\n`);

    // 6. 댓글 목록 다시 조회 (좋아요 후 상태 확인)
    console.log('📋 Getting comments (after like)...');
    const commentsResponse2 = await axios.get(`${BASE_URL}/signal-spots/${testSpot.id}/comments`);
    const likedComment = commentsResponse2.data.data.find(c => c.id === comment.id);
    
    console.log(`After like:`);
    console.log(`  - Comment ID: ${likedComment.id}`);
    console.log(`  - Like Count: ${likedComment.likes}`);
    console.log(`  - Is Liked: ${likedComment.isLiked}`);
    console.log(`  - Liked By: ${JSON.stringify(likedComment.likedBy || [])}\n`);

    // 7. 좋아요 취소
    console.log('👎 Removing like...');
    const likeResponse2 = await axios.post(`${BASE_URL}/signal-spots/${testSpot.id}/comments/${comment.id}/like`);
    
    console.log(`Unlike response:`);
    console.log(`  - Success: ${likeResponse2.data.success}`);
    console.log(`  - Is Liked: ${likeResponse2.data.data.isLiked}`);
    console.log(`  - Like Count: ${likeResponse2.data.data.likeCount}`);
    console.log(`  - Liked By: ${JSON.stringify(likeResponse2.data.data.likedBy || [])}`);
    console.log(`  - Message: ${likeResponse2.data.message}\n`);

    // 8. 댓글 목록 최종 조회 (좋아요 취소 후 상태 확인)
    console.log('📋 Getting comments (after unlike)...');
    const commentsResponse3 = await axios.get(`${BASE_URL}/signal-spots/${testSpot.id}/comments`);
    const unlikedComment = commentsResponse3.data.data.find(c => c.id === comment.id);
    
    console.log(`After unlike:`);
    console.log(`  - Comment ID: ${unlikedComment.id}`);
    console.log(`  - Like Count: ${unlikedComment.likes}`);
    console.log(`  - Is Liked: ${unlikedComment.isLiked}`);
    console.log(`  - Liked By: ${JSON.stringify(unlikedComment.likedBy || [])}\n`);

    // 9. 테스트 결과 검증
    console.log('🔍 Validating test results...');
    
    const tests = [
      {
        name: 'Initial state should have 0 likes',
        condition: initialComment.likes === 0 && !initialComment.isLiked,
        passed: initialComment.likes === 0 && !initialComment.isLiked
      },
      {
        name: 'After like should have 1 like',
        condition: likedComment.likes === 1 && likedComment.isLiked,
        passed: likedComment.likes === 1 && likedComment.isLiked
      },
      {
        name: 'After unlike should have 0 likes',
        condition: unlikedComment.likes === 0 && !unlikedComment.isLiked,
        passed: unlikedComment.likes === 0 && !unlikedComment.isLiked
      },
      {
        name: 'User ID should be in likedBy array when liked',
        condition: likedComment.likedBy && likedComment.likedBy.includes(userId),
        passed: likedComment.likedBy && likedComment.likedBy.includes(userId)
      },
      {
        name: 'User ID should not be in likedBy array when unliked',
        condition: !unlikedComment.likedBy || !unlikedComment.likedBy.includes(userId),
        passed: !unlikedComment.likedBy || !unlikedComment.likedBy.includes(userId)
      }
    ];

    let allTestsPassed = true;
    tests.forEach(test => {
      console.log(`${test.passed ? '✅' : '❌'} ${test.name}`);
      if (!test.passed) allTestsPassed = false;
    });

    console.log(`\n${allTestsPassed ? '🎉 All tests PASSED!' : '❌ Some tests FAILED!'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error(`Status: ${error.response.status}`);
    }
  }
}

// 테스트 실행
testCommentLikes();