const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Test accounts
const user1 = {
  email: 'cooldown1@test.com',
  username: 'cooldown1',
  password: 'Password123@'
};

const user2 = {
  email: 'cooldown2@test.com', 
  username: 'cooldown2',
  password: 'Password123@'
};

// Same location for both users
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

async function testSparkAfterCooldown() {
  console.log('🚀 Starting Spark Cooldown Test\n');
  console.log('This test verifies that Sparks can be created after the 5-minute cooldown\n');
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
    
    // Step 3: First meeting
    console.log('\n📍 Step 3: First meeting - Creating initial Spark...');
    
    await axios.post(`${API_URL}/location`, testLocation, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    console.log(`✅ Created location for ${user1.username}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await axios.post(`${API_URL}/location`, testLocation, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    console.log(`✅ Created location for ${user2.username}`);
    
    // Wait for Spark detection
    console.log('\n⏳ Waiting for initial Spark detection...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check initial Spark
    const sparks1_initial = await axios.get(`${API_URL}/sparks`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    
    const initialSpark = sparks1_initial.data.data.find(s => 
      s.otherUserNickname === user2.username || s.otherUserId === user2.username
    );
    
    if (initialSpark) {
      console.log(`\n✅ Initial Spark created:`);
      console.log(`  - ID: ${initialSpark.id}`);
      console.log(`  - Time: ${new Date(initialSpark.createdAt).toLocaleTimeString()}`);
    }
    
    // Step 4: Users separate
    console.log('\n🚶 Step 4: Users separate...');
    
    await axios.post(`${API_URL}/location`, differentLocation, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    await axios.post(`${API_URL}/location`, differentLocation, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    console.log(`✅ Users moved to different locations`);
    
    // Step 5: Wait for cooldown (5 minutes + 30 seconds = 330 seconds)
    const waitTime = 330; // 5.5 minutes
    console.log(`\n⏳ Step 5: Waiting ${waitTime} seconds (5.5 minutes) for cooldown to expire...`);
    console.log('This ensures we pass the 5-minute cooldown period.');
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = waitTime - elapsed;
      if (remaining > 0) {
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        process.stdout.write(`\r  ⏱️ Time remaining: ${minutes}m ${seconds}s   `);
      }
    }, 1000);
    
    await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
    clearInterval(interval);
    console.log('\n  ✅ Cooldown period has passed');
    
    // Step 6: Users meet again
    console.log('\n📍 Step 6: Second meeting - Users meet again after cooldown...');
    
    await axios.post(`${API_URL}/location`, testLocation, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    console.log(`✅ ${user1.username} returned to meeting location`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await axios.post(`${API_URL}/location`, testLocation, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    console.log(`✅ ${user2.username} returned to meeting location`);
    
    // Wait for new Spark detection
    console.log('\n⏳ Waiting for new Spark detection...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 7: Check for new Sparks
    console.log('\n🔍 Step 7: Checking for new Sparks...');
    
    const sparks1_final = await axios.get(`${API_URL}/sparks`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    
    const finalSparks = sparks1_final.data.data.filter(s => 
      s.otherUserNickname === user2.username || s.otherUserId === user2.username
    );
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST RESULTS:');
    console.log('=' .repeat(60));
    
    console.log(`\nTotal Sparks between ${user1.username} and ${user2.username}: ${finalSparks.length}`);
    
    finalSparks.forEach((s, idx) => {
      console.log(`\nSpark ${idx + 1}:`);
      console.log(`  - ID: ${s.id}`);
      console.log(`  - Type: ${s.type}`);
      console.log(`  - Status: ${s.status}`);
      console.log(`  - Created: ${new Date(s.createdAt).toLocaleTimeString()}`);
      const age = Math.floor((Date.now() - new Date(s.createdAt).getTime()) / 1000);
      console.log(`  - Age: ${Math.floor(age / 60)}m ${age % 60}s`);
    });
    
    // Check if a new Spark was created
    const newSparks = finalSparks.filter(s => {
      const age = Date.now() - new Date(s.createdAt).getTime();
      return age < 10000; // Created in the last 10 seconds
    });
    
    if (newSparks.length > 0) {
      console.log('\n✅ SUCCESS: New Spark created after cooldown period!');
      console.log('The system correctly allows new Sparks after the 5-minute cooldown.');
    } else if (finalSparks.length > 0) {
      console.log('\n⚠️ WARNING: Only old Spark(s) exist');
      console.log('No new Spark was created even after the 5-minute cooldown.');
    } else {
      console.log('\n❌ FAILED: No Sparks found between users');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.response?.data || error.message);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('Test completed');
}

// Run the test
console.log('⚠️ NOTE: This test takes about 6 minutes to complete.\n');
testSparkAfterCooldown().catch(console.error);