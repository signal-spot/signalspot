const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Test accounts
const user1 = {
  email: 'regentest1@test.com',
  username: 'regentest1',
  password: 'Password123@'
};

const user2 = {
  email: 'regentest2@test.com', 
  username: 'regentest2',
  password: 'Password123@'
};

// Same location for both users (Seoul City Hall)
const testLocation = {
  latitude: 37.5665,
  longitude: 126.9780,
  accuracy: 10,
  isCurrentLocation: true
};

// Different location for separation
const differentLocation = {
  latitude: 37.5765,
  longitude: 126.9880,
  accuracy: 10,
  isCurrentLocation: true
};

async function testSparkRegeneration() {
  console.log('🚀 Starting Spark Regeneration Test\n');
  console.log('This test verifies that Sparks can be regenerated when users meet again\n');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Register users
    console.log('\n📝 Step 1: Registering test users...');
    
    try {
      await axios.post(`${API_URL}/auth/register`, user1);
      console.log(`✅ Registered ${user1.username}`);
    } catch (e) {
      if (e.response?.status === 409) {
        console.log(`ℹ️ ${user1.username} already exists`);
      } else throw e;
    }
    
    try {
      await axios.post(`${API_URL}/auth/register`, user2);
      console.log(`✅ Registered ${user2.username}`);
    } catch (e) {
      if (e.response?.status === 409) {
        console.log(`ℹ️ ${user2.username} already exists`);
      } else throw e;
    }
    
    // Step 2: Login
    console.log('\n🔐 Step 2: Logging in users...');
    
    const login1 = await axios.post(`${API_URL}/auth/login`, {
      email: user1.email,
      password: user1.password
    });
    const token1 = login1.data.data.accessToken;
    console.log(`✅ Logged in ${user1.username}`);
    
    const login2 = await axios.post(`${API_URL}/auth/login`, {
      email: user2.email,
      password: user2.password
    });
    const token2 = login2.data.data.accessToken;
    console.log(`✅ Logged in ${user2.username}`);
    
    // Step 3: First meeting - Create locations at the same spot
    console.log('\n📍 Step 3: First meeting - Creating locations at the same spot...');
    
    await axios.post(`${API_URL}/location`, testLocation, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    console.log(`✅ Created location for ${user1.username} at (${testLocation.latitude}, ${testLocation.longitude})`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await axios.post(`${API_URL}/location`, testLocation, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    console.log(`✅ Created location for ${user2.username} at (${testLocation.latitude}, ${testLocation.longitude})`);
    
    // Wait for Spark detection
    console.log('\n⏳ Waiting 3 seconds for Spark detection...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check for initial Sparks
    const sparks1_initial = await axios.get(`${API_URL}/sparks`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    
    console.log(`\n✅ Initial Spark created: ${sparks1_initial.data.data.length} spark(s) for ${user1.username}`);
    const initialSpark = sparks1_initial.data.data.find(s => 
      s.otherUserNickname === user2.username || s.otherUserId === user2.username
    );
    if (initialSpark) {
      console.log(`  - Spark ID: ${initialSpark.id}`);
      console.log(`  - Type: ${initialSpark.type}`);
      console.log(`  - Status: ${initialSpark.status}`);
    }
    
    // Step 4: Users separate
    console.log('\n🚶 Step 4: Users separate to different locations...');
    
    await axios.post(`${API_URL}/location`, differentLocation, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    console.log(`✅ ${user1.username} moved to different location`);
    
    await axios.post(`${API_URL}/location`, differentLocation, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    console.log(`✅ ${user2.username} moved to different location`);
    
    // Step 5: Wait 30 seconds
    console.log('\n⏳ Step 5: Waiting 30 seconds before users meet again...');
    for (let i = 30; i > 0; i--) {
      process.stdout.write(`\r  ${i} seconds remaining...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('\r  ✅ 30 seconds passed');
    
    // Step 6: Users meet again at the same location
    console.log('\n📍 Step 6: Second meeting - Users meet again at the same location...');
    
    await axios.post(`${API_URL}/location`, testLocation, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    console.log(`✅ ${user1.username} returned to meeting location`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await axios.post(`${API_URL}/location`, testLocation, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    console.log(`✅ ${user2.username} returned to meeting location`);
    
    // Wait for Spark detection
    console.log('\n⏳ Waiting 3 seconds for new Spark detection...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 7: Check for new Sparks
    console.log('\n🔍 Step 7: Checking for new Sparks...');
    
    const sparks1_final = await axios.get(`${API_URL}/sparks`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    
    const sparks2_final = await axios.get(`${API_URL}/sparks`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    
    // Count sparks between these specific users
    const user1Sparks = sparks1_final.data.data.filter(s => 
      s.otherUserNickname === user2.username || s.otherUserId === user2.username
    );
    const user2Sparks = sparks2_final.data.data.filter(s => 
      s.otherUserNickname === user1.username || s.otherUserId === user1.username
    );
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST RESULTS:');
    console.log('=' .repeat(60));
    
    console.log(`\n${user1.username} has ${user1Sparks.length} spark(s) with ${user2.username}:`);
    user1Sparks.forEach((s, idx) => {
      console.log(`  Spark ${idx + 1}:`);
      console.log(`    - ID: ${s.id}`);
      console.log(`    - Type: ${s.type}`);
      console.log(`    - Status: ${s.status}`);
      console.log(`    - Created: ${new Date(s.createdAt).toLocaleString()}`);
    });
    
    console.log(`\n${user2.username} has ${user2Sparks.length} spark(s) with ${user1.username}:`);
    user2Sparks.forEach((s, idx) => {
      console.log(`  Spark ${idx + 1}:`);
      console.log(`    - ID: ${s.id}`);
      console.log(`    - Type: ${s.type}`);
      console.log(`    - Status: ${s.status}`);
      console.log(`    - Created: ${new Date(s.createdAt).toLocaleString()}`);
    });
    
    // Determine test success
    if (user1Sparks.length > 1 || user2Sparks.length > 1) {
      console.log('\n✅ SUCCESS: Spark regeneration is working!');
      console.log('Users can create new Sparks when they meet again after separation.');
    } else if (user1Sparks.length === 1 && user2Sparks.length === 1) {
      // Check if it's a new spark or the same one
      const latestSpark = user1Sparks[0];
      const sparkAge = Date.now() - new Date(latestSpark.createdAt).getTime();
      if (sparkAge < 10000) { // Less than 10 seconds old
        console.log('\n✅ PARTIAL SUCCESS: New Spark was created (old one may have been replaced)');
      } else {
        console.log('\n⚠️ WARNING: Only the original Spark exists');
        console.log('No new Spark was created after 30 seconds when users met again.');
        console.log('This might be due to the 72-hour cooldown still being active.');
      }
    } else {
      console.log('\n❌ FAILED: No sparks detected between users');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.response?.data || error.message);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('Test completed');
}

// Run the test
testSparkRegeneration().catch(console.error);