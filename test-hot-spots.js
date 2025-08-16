const axios = require('axios');

const API_URL = 'http://localhost:3000';
let authToken = '';

async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'Test1234!'
    });
    authToken = response.data.data.accessToken;
    console.log('✅ Login successful');
    return response.data.data.user;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function checkAllSpots() {
  try {
    // 1. 모든 스팟 조회 (제한 없이)
    const allSpotsResponse = await axios.get(`${API_URL}/signal-spots`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { limit: 100 }
    });
    
    console.log('\n📍 전체 스팟 현황:');
    console.log(`- 총 스팟 수: ${allSpotsResponse.data.count}`);
    
    if (allSpotsResponse.data.data && allSpotsResponse.data.data.length > 0) {
      const now = new Date();
      const spots = allSpotsResponse.data.data;
      
      // 스팟 상태 분석
      const activeSpots = spots.filter(s => s.isActive);
      const last24hSpots = spots.filter(s => {
        const createdAt = new Date(s.createdAt);
        return (now - createdAt) <= 24 * 60 * 60 * 1000;
      });
      const notExpiredSpots = spots.filter(s => {
        const expiresAt = new Date(s.expiresAt);
        return expiresAt > now;
      });
      
      console.log(`- 활성 스팟: ${activeSpots.length}`);
      console.log(`- 24시간 내 생성: ${last24hSpots.length}`);
      console.log(`- 만료되지 않은 스팟: ${notExpiredSpots.length}`);
      console.log(`- status가 ACTIVE인 스팟: ${spots.filter(s => s.status === 'ACTIVE').length}`);
      
      // 첫 번째 스팟 상세 정보
      const firstSpot = spots[0];
      console.log('\n첫 번째 스팟 정보:');
      console.log(`- ID: ${firstSpot.id}`);
      console.log(`- isActive: ${firstSpot.isActive}`);
      console.log(`- status: ${firstSpot.status}`);
      console.log(`- createdAt: ${firstSpot.createdAt}`);
      console.log(`- expiresAt: ${firstSpot.expiresAt}`);
      console.log(`- likeCount: ${firstSpot.likeCount}`);
      console.log(`- replyCount: ${firstSpot.replyCount}`);
      console.log(`- shareCount: ${firstSpot.shareCount}`);
    }
  } catch (error) {
    console.error('❌ 전체 스팟 조회 실패:', error.response?.data || error.message);
  }
}

async function checkTrendingSpots() {
  try {
    // 2. 트렌딩 스팟 조회
    const trendingResponse = await axios.get(`${API_URL}/signal-spots/trending`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { limit: 20 }
    });
    
    console.log('\n🔥 트렌딩 스팟:');
    console.log(`- 트렌딩 스팟 수: ${trendingResponse.data.count}`);
    
    if (trendingResponse.data.data && trendingResponse.data.data.length > 0) {
      trendingResponse.data.data.slice(0, 3).forEach((spot, index) => {
        console.log(`\n  ${index + 1}. ${spot.content || spot.description}`);
        console.log(`     - 좋아요: ${spot.likeCount}, 댓글: ${spot.replyCount}, 공유: ${spot.shareCount}`);
      });
    }
  } catch (error) {
    console.error('❌ 트렌딩 스팟 조회 실패:', error.response?.data || error.message);
  }
}

async function checkPopularSpots() {
  try {
    // 3. 인기 스팟 조회
    const popularResponse = await axios.get(`${API_URL}/signal-spots/popular`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { limit: 20, timeframe: 'week' }
    });
    
    console.log('\n⭐ 인기 스팟:');
    console.log(`- 인기 스팟 수: ${popularResponse.data.count}`);
    
    if (popularResponse.data.data && popularResponse.data.data.length > 0) {
      popularResponse.data.data.slice(0, 3).forEach((spot, index) => {
        console.log(`\n  ${index + 1}. ${spot.content || spot.description}`);
        console.log(`     - 좋아요: ${spot.likeCount}, 댓글: ${spot.replyCount}, 공유: ${spot.shareCount}`);
      });
    }
  } catch (error) {
    console.error('❌ 인기 스팟 조회 실패:', error.response?.data || error.message);
  }
}

async function createTestSpot() {
  try {
    const newSpot = await axios.post(`${API_URL}/signal-spots`, {
      content: `테스트 핫 스팟 - ${new Date().toLocaleString()}`,
      description: '트렌딩 테스트를 위한 스팟입니다',
      latitude: 37.5665,
      longitude: 126.9780,
      category: 'mood',
      visibility: 'public',
      tags: ['test', 'trending'],
      expiresIn: 72 // 72시간
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('\n✅ 테스트 스팟 생성 성공:', newSpot.data.data.id);
    
    // 생성한 스팟에 좋아요 추가
    await axios.post(`${API_URL}/signal-spots/${newSpot.data.data.id}/like`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ 좋아요 추가 완료');
    
    return newSpot.data.data.id;
  } catch (error) {
    console.error('❌ 테스트 스팟 생성 실패:', error.response?.data || error.message);
  }
}

async function main() {
  try {
    console.log('🚀 핫 시그널 스팟 조회 테스트 시작\n');
    
    await login();
    await checkAllSpots();
    await checkTrendingSpots();
    await checkPopularSpots();
    
    // 테스트 스팟 생성
    console.log('\n📝 테스트 스팟 생성 중...');
    const spotId = await createTestSpot();
    
    if (spotId) {
      console.log('\n⏳ 5초 후 다시 트렌딩 확인...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      await checkTrendingSpots();
    }
    
  } catch (error) {
    console.error('테스트 실패:', error);
  }
}

main();