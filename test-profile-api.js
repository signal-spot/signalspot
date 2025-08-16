#!/usr/bin/env node

/**
 * Profile API 테스트 스크립트
 * 다른 사용자 프로필 조회 기능 테스트
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
let authToken = '';
let currentUserId = '';
let targetUserId = '';

// 테스트 계정 정보
const testUser1 = {
  email: 'user1@test.com',
  password: 'Test1234!',
  username: 'testuser1'
};

const testUser2 = {
  email: 'user2@test.com', 
  password: 'Test1234!',
  username: 'testuser2'
};

// 헬퍼 함수
async function registerUser(userData) {
  try {
    const response = await axios.post(`${API_BASE}/auth/register`, userData);
    console.log(`✅ User registered: ${userData.username}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(`ℹ️ User already exists: ${userData.username}`);
      return null;
    }
    throw error;
  }
}

async function loginUser(email, password) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
    console.log(`✅ User logged in: ${email}`);
    return response.data.data;
  } catch (error) {
    console.error(`❌ Login failed: ${error.response?.data?.message}`);
    throw error;
  }
}

async function getMyProfile(token) {
  try {
    const response = await axios.get(`${API_BASE}/profile/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ My profile fetched successfully');
    return response.data.data;
  } catch (error) {
    console.error(`❌ Failed to get my profile: ${error.response?.data?.message}`);
    throw error;
  }
}

async function getOtherUserProfile(token, userId) {
  try {
    const response = await axios.get(`${API_BASE}/profile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Profile fetched for user: ${userId}`);
    return response.data.data;
  } catch (error) {
    console.error(`❌ Failed to get user profile: ${error.response?.data?.message}`);
    throw error;
  }
}

async function updateProfileVisibility(token, visibility) {
  try {
    const response = await axios.put(
      `${API_BASE}/profile/visibility/${visibility}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`✅ Profile visibility updated to: ${visibility}`);
    return response.data.data;
  } catch (error) {
    console.error(`❌ Failed to update visibility: ${error.response?.data?.message}`);
    throw error;
  }
}

async function searchProfiles(token, query) {
  try {
    const response = await axios.get(`${API_BASE}/profile/search`, {
      params: { q: query },
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Profile search completed for: ${query}`);
    return response.data.data;
  } catch (error) {
    console.error(`❌ Failed to search profiles: ${error.response?.data?.message}`);
    throw error;
  }
}

async function blockUser(token, userIdToBlock) {
  try {
    const response = await axios.post(
      `${API_BASE}/users/block/${userIdToBlock}`,
      { reason: 'Test blocking' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`✅ User blocked: ${userIdToBlock}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to block user: ${error.response?.data?.message}`);
    throw error;
  }
}

async function unblockUser(token, userIdToUnblock) {
  try {
    const response = await axios.delete(
      `${API_BASE}/users/block/${userIdToUnblock}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`✅ User unblocked: ${userIdToUnblock}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to unblock user: ${error.response?.data?.message}`);
    throw error;
  }
}

// 메인 테스트 함수
async function runTests() {
  console.log('🚀 Starting Profile API Tests...\n');

  try {
    // 1. 사용자 등록
    console.log('1️⃣ Registering test users...');
    await registerUser(testUser1);
    await registerUser(testUser2);

    // 2. User1 로그인
    console.log('\n2️⃣ Logging in as User1...');
    const loginData1 = await loginUser(testUser1.email, testUser1.password);
    authToken = loginData1.accessToken;
    currentUserId = loginData1.user.id;
    console.log(`   User1 ID: ${currentUserId}`);

    // 3. User2 로그인하여 ID 가져오기
    console.log('\n3️⃣ Getting User2 ID...');
    const loginData2 = await loginUser(testUser2.email, testUser2.password);
    targetUserId = loginData2.user.id;
    console.log(`   User2 ID: ${targetUserId}`);

    // 4. 내 프로필 조회
    console.log('\n4️⃣ Testing my profile endpoint...');
    const myProfile = await getMyProfile(authToken);
    console.log(`   Username: ${myProfile.username}`);
    console.log(`   Email: ${myProfile.email}`);
    console.log(`   Visibility: ${myProfile.profileVisibility}`);

    // 5. 다른 사용자 프로필 조회 (PUBLIC)
    console.log('\n5️⃣ Testing other user profile (PUBLIC)...');
    const otherProfile = await getOtherUserProfile(authToken, targetUserId);
    console.log(`   Username: ${otherProfile.username}`);
    console.log(`   Bio: ${otherProfile.bio || 'No bio'}`);
    console.log(`   Email visible: ${otherProfile.email ? 'Yes' : 'No (Hidden)'}`);

    // 6. User2 프로필을 PRIVATE로 변경
    console.log('\n6️⃣ Changing User2 profile to PRIVATE...');
    const token2 = loginData2.accessToken;
    await updateProfileVisibility(token2, 'PRIVATE');

    // 7. PRIVATE 프로필 접근 시도 (실패해야 함)
    console.log('\n7️⃣ Testing private profile access (should fail)...');
    try {
      await getOtherUserProfile(authToken, targetUserId);
      console.log('   ❌ ERROR: Should not be able to access private profile!');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('   ✅ Correctly blocked from viewing private profile');
      }
    }

    // 8. 프로필 검색
    console.log('\n8️⃣ Testing profile search...');
    const searchResults = await searchProfiles(authToken, 'test');
    console.log(`   Found ${searchResults.length} profiles`);
    searchResults.forEach(profile => {
      console.log(`   - ${profile.username} (${profile.profileVisibility})`);
    });

    // 9. 사용자 차단 테스트
    console.log('\n9️⃣ Testing user blocking...');
    await blockUser(authToken, targetUserId);
    
    // 10. 차단된 사용자 프로필 접근 시도 (실패해야 함)
    console.log('\n🔟 Testing blocked user profile access (should fail)...');
    try {
      await getOtherUserProfile(authToken, targetUserId);
      console.log('   ❌ ERROR: Should not be able to access blocked user profile!');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('   ✅ Correctly blocked from viewing blocked user profile');
      }
    }

    // 11. 차단 해제
    console.log('\n1️⃣1️⃣ Unblocking user...');
    await unblockUser(authToken, targetUserId);

    // 12. User2를 PUBLIC으로 다시 변경
    await updateProfileVisibility(token2, 'PUBLIC');

    // 13. 차단 해제 후 프로필 접근 (성공해야 함)
    console.log('\n1️⃣2️⃣ Testing profile access after unblock...');
    const profileAfterUnblock = await getOtherUserProfile(authToken, targetUserId);
    console.log(`   ✅ Can access profile again: ${profileAfterUnblock.username}`);

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// 테스트 실행
runTests().catch(console.error);