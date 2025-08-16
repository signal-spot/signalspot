const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Test accounts with simpler passwords
const user1 = {
  email: 'sparkuser1@test.com',
  username: 'sparkuser1',
  password: 'Password123@'
};

const user2 = {
  email: 'sparkuser2@test.com', 
  username: 'sparkuser2',
  password: 'Password123@'
};

// Same location for both users (Seoul City Hall)
const testLocation = {
  latitude: 37.5665,
  longitude: 126.9780,
  accuracy: 10,
  isCurrentLocation: true
};

async function testSparkDetection() {
  console.log('🚀 Starting Simple Spark Detection Test\n');
  
  try {
    // Step 1: Register users
    console.log('📝 Registering users...');
    
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
    console.log('\n🔐 Logging in users...');
    
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
    
    // Step 3: Create locations at the same spot
    console.log('\n📍 Creating locations...');
    
    const loc1 = await axios.post(`${API_URL}/location`, testLocation, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    console.log(`✅ Created location for ${user1.username}`);
    
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const loc2 = await axios.post(`${API_URL}/location`, testLocation, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    console.log(`✅ Created location for ${user2.username}`);
    
    // Step 4: Wait for Spark detection
    console.log('\n⏳ Waiting 3 seconds for Spark detection...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 5: Check for Sparks
    console.log('\n🔍 Checking for Sparks...');
    
    const sparks1 = await axios.get(`${API_URL}/sparks`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    
    const sparks2 = await axios.get(`${API_URL}/sparks`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    
    console.log('\n📊 Results:');
    console.log('=' .repeat(50));
    
    const user1Sparks = sparks1.data.data || [];
    const user2Sparks = sparks2.data.data || [];
    
    console.log(`${user1.username}: ${user1Sparks.length} spark(s)`);
    if (user1Sparks.length > 0) {
      user1Sparks.forEach(s => {
        console.log(`  - With ${s.otherUserNickname}, type: ${s.type}`);
      });
    }
    
    console.log(`${user2.username}: ${user2Sparks.length} spark(s)`);
    if (user2Sparks.length > 0) {
      user2Sparks.forEach(s => {
        console.log(`  - With ${s.otherUserNickname}, type: ${s.type}`);
      });
    }
    
    if (user1Sparks.length > 0 || user2Sparks.length > 0) {
      console.log('\n✅ SUCCESS: Spark detection is working!');
    } else {
      console.log('\n❌ FAILED: No sparks detected');
      console.log('Both users were at the same location but no spark was created');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }
}

// Run the test
testSparkDetection().catch(console.error);
