const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Test accounts
const user1 = {
  email: 'queuetest1@test.com',
  username: 'queuetest1',
  password: 'Password123@'
};

const user2 = {
  email: 'queuetest2@test.com', 
  username: 'queuetest2',
  password: 'Password123@'
};

// Same location for both users (Seoul City Hall)
const testLocation = {
  latitude: 37.5665,
  longitude: 126.9780,
  accuracy: 10,
  isCurrentLocation: true
};

async function testQueueBasedSparkDetection() {
  console.log('🚀 Starting Queue-Based Spark Detection Test\n');
  console.log('=' .repeat(50));
  
  let token1, token2;
  
  try {
    // Step 1: Register users
    console.log('\n📝 Step 1: Register/Login users');
    
    // Try to register or login user1
    try {
      await axios.post(`${API_URL}/auth/register`, user1);
      console.log(`✅ Registered ${user1.username}`);
    } catch (e) {
      if (e.response?.status === 409) {
        console.log(`ℹ️ ${user1.username} already exists, logging in...`);
      }
    }
    
    const login1 = await axios.post(`${API_URL}/auth/login`, {
      email: user1.email,
      password: user1.password
    });
    token1 = login1.data.data.accessToken;
    console.log(`✅ Logged in ${user1.username}`);
    
    // Try to register or login user2
    try {
      await axios.post(`${API_URL}/auth/register`, user2);
      console.log(`✅ Registered ${user2.username}`);
    } catch (e) {
      if (e.response?.status === 409) {
        console.log(`ℹ️ ${user2.username} already exists, logging in...`);
      }
    }
    
    const login2 = await axios.post(`${API_URL}/auth/login`, {
      email: user2.email,
      password: user2.password
    });
    token2 = login2.data.data.accessToken;
    console.log(`✅ Logged in ${user2.username}`);
    
    // Step 2: Create locations simultaneously to test queue processing
    console.log('\n📍 Step 2: Create locations simultaneously (testing queue)');
    
    // Send multiple location updates simultaneously to test queue
    const locationPromises = [];
    
    // Send 3 location updates for user1
    for (let i = 0; i < 3; i++) {
      locationPromises.push(
        axios.post(`${API_URL}/location`, {
          ...testLocation,
          accuracy: 10 + i // Slightly different accuracy to make each unique
        }, {
          headers: { Authorization: `Bearer ${token1}` }
        }).then(() => console.log(`✅ Location ${i+1} for ${user1.username} queued`))
          .catch(e => console.error(`❌ Failed location ${i+1} for ${user1.username}:`, e.response?.data?.message))
      );
    }
    
    // Send 3 location updates for user2
    for (let i = 0; i < 3; i++) {
      locationPromises.push(
        axios.post(`${API_URL}/location`, {
          ...testLocation,
          accuracy: 10 + i // Slightly different accuracy to make each unique
        }, {
          headers: { Authorization: `Bearer ${token2}` }
        }).then(() => console.log(`✅ Location ${i+1} for ${user2.username} queued`))
          .catch(e => console.error(`❌ Failed location ${i+1} for ${user2.username}:`, e.response?.data?.message))
      );
    }
    
    // Wait for all location updates to be sent
    await Promise.all(locationPromises);
    
    console.log('\n⏳ Waiting 5 seconds for queue to process locations...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 3: Check for Sparks
    console.log('\n🔍 Step 3: Check for Sparks');
    
    const sparks1 = await axios.get(`${API_URL}/sparks`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    
    const sparks2 = await axios.get(`${API_URL}/sparks`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    
    const user1Sparks = sparks1.data.data || [];
    const user2Sparks = sparks2.data.data || [];
    
    console.log('\n' + '=' .repeat(50));
    console.log('📊 Test Results:');
    console.log('=' .repeat(50));
    
    console.log(`\n${user1.username}:`);
    console.log(`  - Total sparks: ${user1Sparks.length}`);
    if (user1Sparks.length > 0) {
      user1Sparks.forEach((s, i) => {
        console.log(`  - Spark ${i+1}: With ${s.otherUserNickname}, type: ${s.type}, status: ${s.status}`);
        if (s.metadata?.processedViaQueue) {
          console.log('    ✓ Processed via queue');
        }
      });
    }
    
    console.log(`\n${user2.username}:`);
    console.log(`  - Total sparks: ${user2Sparks.length}`);
    if (user2Sparks.length > 0) {
      user2Sparks.forEach((s, i) => {
        console.log(`  - Spark ${i+1}: With ${s.otherUserNickname}, type: ${s.type}, status: ${s.status}`);
        if (s.metadata?.processedViaQueue) {
          console.log('    ✓ Processed via queue');
        }
      });
    }
    
    // Check for duplicates
    const sparkTimes = [...user1Sparks, ...user2Sparks].map(s => new Date(s.createdAt).getTime());
    const uniqueTimes = new Set(sparkTimes);
    
    console.log('\n📈 Queue Processing Analysis:');
    console.log(`  - Total location updates sent: 6 (3 per user)`);
    console.log(`  - Total sparks created: ${user1Sparks.length + user2Sparks.length}`);
    console.log(`  - Unique spark creation times: ${uniqueTimes.size}`);
    
    if (user1Sparks.length === 1 && user2Sparks.length === 1) {
      console.log('\n✅ SUCCESS: Queue-based processing prevented duplicates!');
      console.log('  - Only 1 spark created despite 6 simultaneous location updates');
      console.log('  - Queue successfully serialized the processing');
    } else if (user1Sparks.length > 1 || user2Sparks.length > 1) {
      console.log('\n⚠️ WARNING: Multiple sparks detected');
      console.log('  - This might indicate the queue is not preventing duplicates properly');
    } else {
      console.log('\n❌ FAILED: No sparks detected');
      console.log('  - Check if the queue is processing locations correctly');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.response?.data || error.message);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('Queue-based Spark detection test completed');
}

// Run the test
testQueueBasedSparkDetection().catch(console.error);