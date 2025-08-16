const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Test accounts
const user1 = {
  email: 'sparktest1@test.com',
  username: 'sparktest1',
  password: 'Test123!@#'
};

const user2 = {
  email: 'sparktest2@test.com', 
  username: 'sparktest2',
  password: 'Test123!@#'
};

// Same location for both users
const testLocation = {
  latitude: 37.5665,
  longitude: 126.9780,
  accuracy: 10,
  isCurrentLocation: true
};

async function registerUser(userData) {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    console.log(`✅ Registered user: ${userData.username}`);
    return response.data;
  } catch (error) {
    if (error.response?.data?.message?.includes('already') || error.response?.status === 409) {
      console.log(`ℹ️ User ${userData.username} already exists`);
      return null;
    }
    console.error(`❌ Failed to register ${userData.username}:`, error.response?.data || error.message);
    throw error;
  }
}

async function loginUser(userData) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: userData.email,
      password: userData.password
    });
    console.log(`✅ Logged in: ${userData.username}`);
    return response.data.access_token || response.data.accessToken || response.data.token;
  } catch (error) {
    console.error(`❌ Failed to login ${userData.username}:`, error.response?.data || error.message);
    throw error;
  }
}

async function verifyUser(token) {
  try {
    await axios.post(`${API_URL}/auth/verify-email`, { token: 'dummy-verification-token' }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ User verified');
  } catch (error) {
    if (error.response?.data?.message?.includes('already verified')) {
      console.log('ℹ️ User already verified');
    } else {
      console.log('⚠️ Verification skipped:', error.response?.data?.message || error.message);
    }
  }
}

async function createLocation(token, locationData, username) {
  try {
    const response = await axios.post(`${API_URL}/location`, locationData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Created location for ${username} at (${locationData.latitude}, ${locationData.longitude})`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to create location for ${username}:`, error.response?.data || error.message);
    throw error;
  }
}

async function getUserSparks(token, username) {
  try {
    const response = await axios.get(`${API_URL}/sparks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`📍 Sparks for ${username}:`, response.data.data.length, 'sparks found');
    if (response.data.data.length > 0) {
      response.data.data.forEach(spark => {
        console.log(`  - Spark with ${spark.otherUserNickname}, type: ${spark.type}, status: ${spark.status}`);
      });
    }
    return response.data.data;
  } catch (error) {
    console.error(`❌ Failed to get sparks for ${username}:`, error.response?.data || error.message);
    throw error;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testSparkDetection() {
  console.log('🚀 Starting Spark Detection Test\n');
  console.log('=' .repeat(50));
  
  let token1, token2;
  
  try {
    // Step 1: Register users
    console.log('\n📝 Step 1: Register users');
    await registerUser(user1);
    await registerUser(user2);
    
    // Step 2: Login users
    console.log('\n🔐 Step 2: Login users');
    token1 = await loginUser(user1);
    token2 = await loginUser(user2);
    
    // Step 3: Verify users
    console.log('\n✔️ Step 3: Verify users');
    await verifyUser(token1);
    await verifyUser(token2);
    
    // Step 4: Create location for user1
    console.log('\n📍 Step 4: Create location for user1');
    await createLocation(token1, testLocation, user1.username);
    
    // Step 5: Wait a moment
    console.log('\n⏳ Waiting 2 seconds...');
    await sleep(2000);
    
    // Step 6: Create location for user2 at the same coordinates
    console.log('\n📍 Step 5: Create location for user2 at the same location');
    await createLocation(token2, testLocation, user2.username);
    
    // Step 7: Wait for Spark detection to process
    console.log('\n⏳ Waiting 3 seconds for Spark detection to process...');
    await sleep(3000);
    
    // Step 8: Check for Sparks
    console.log('\n🔍 Step 6: Check for Sparks');
    const sparks1 = await getUserSparks(token1, user1.username);
    const sparks2 = await getUserSparks(token2, user2.username);
    
    console.log('\n' + '=' .repeat(50));
    console.log('📊 Test Results:');
    console.log('=' .repeat(50));
    
    if (sparks1.length > 0 || sparks2.length > 0) {
      console.log('✅ SUCCESS: Spark detection is working!');
      console.log(`  - User1 has ${sparks1.length} spark(s)`);
      console.log(`  - User2 has ${sparks2.length} spark(s)`);
    } else {
      console.log('❌ FAILED: No sparks detected between users at the same location');
      console.log('  - Both users were at the same coordinates');
      console.log('  - Expected at least one spark to be created');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('Test completed');
}

// Run the test
testSparkDetection().catch(console.error);