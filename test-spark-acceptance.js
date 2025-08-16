const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Test accounts
const user1 = {
  email: 'accept1@test.com',
  username: 'accept1',
  password: 'Password123@'
};

const user2 = {
  email: 'accept2@test.com', 
  username: 'accept2',
  password: 'Password123@'
};

// Same location for both users
const testLocation = {
  latitude: 37.5665,
  longitude: 126.9780,
  accuracy: 10,
  isCurrentLocation: true
};

async function testSparkAcceptance() {
  console.log('🚀 Starting Spark Acceptance Test\n');
  console.log('Testing that PROXIMITY sparks require both users to accept\n');
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
    
    // Step 3: Create proximity spark
    console.log('\n📍 Step 3: Creating proximity spark...');
    
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
    console.log('\n⏳ Waiting for Spark detection...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get the spark
    const sparks1 = await axios.get(`${API_URL}/sparks`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    
    const spark = sparks1.data.data.find(s => 
      s.otherUserNickname === user2.username || s.otherUserId === user2.username
    );
    
    if (!spark) {
      console.log('❌ No spark found between users');
      return;
    }
    
    console.log(`\n✅ Proximity Spark created:`);
    console.log(`  - ID: ${spark.id}`);
    console.log(`  - Type: ${spark.type}`);
    console.log(`  - Status: ${spark.status}`);
    
    // Step 4: Test acceptance scenarios
    console.log('\n🔍 Step 4: Testing acceptance scenarios...');
    console.log('=' .repeat(40));
    
    // Test 1: User1 accepts
    console.log('\n📌 Test 1: User1 accepts the spark');
    try {
      const response1 = await axios.put(
        `${API_URL}/sparks/${spark.id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token1}` } }
      );
      
      console.log(`✅ User1 accepted spark`);
      console.log(`  - Spark status: ${response1.data.data.status}`);
      console.log(`  - Expected: PENDING (waiting for user2)`);
      
      if (response1.data.data.status === 'pending') {
        console.log('  ✅ Correct: Still pending, waiting for user2');
      } else if (response1.data.data.status === 'matched') {
        console.log('  ❌ Error: Should not be matched with only one acceptance');
      }
    } catch (error) {
      console.log(`❌ Error accepting spark as user1: ${error.response?.data?.message || error.message}`);
    }
    
    // Test 2: User2 also accepts
    console.log('\n📌 Test 2: User2 accepts the spark');
    try {
      const response2 = await axios.put(
        `${API_URL}/sparks/${spark.id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token2}` } }
      );
      
      console.log(`✅ User2 accepted spark`);
      console.log(`  - Spark status: ${response2.data.data.status}`);
      console.log(`  - Expected: MATCHED`);
      
      if (response2.data.data.status === 'matched') {
        console.log('  ✅ Correct: Both accepted, spark is matched!');
      } else {
        console.log(`  ❌ Error: Expected matched but got ${response2.data.data.status}`);
      }
    } catch (error) {
      console.log(`❌ Error accepting spark as user2: ${error.response?.data?.message || error.message}`);
    }
    
    // Step 5: Verify final state
    console.log('\n📊 Step 5: Verifying final state...');
    
    const finalSparks = await axios.get(`${API_URL}/sparks`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    
    const finalSpark = finalSparks.data.data.find(s => s.id === spark.id);
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 FINAL RESULTS:');
    console.log('=' .repeat(60));
    
    if (finalSpark) {
      console.log(`\nFinal Spark State:`);
      console.log(`  - Type: ${finalSpark.type}`);
      console.log(`  - Status: ${finalSpark.status}`);
      console.log(`  - User1 Accepted: ${finalSpark.user1Accepted || 'unknown'}`);
      console.log(`  - User2 Accepted: ${finalSpark.user2Accepted || 'unknown'}`);
      
      if (finalSpark.status === 'matched') {
        console.log('\n✅ SUCCESS: Proximity spark requires both users to accept!');
        console.log('The bidirectional acceptance is working correctly.');
      } else {
        console.log(`\n⚠️ WARNING: Spark status is ${finalSpark.status}, expected 'matched'`);
      }
    } else {
      console.log('\n❌ Could not find final spark state');
    }
    
    // Test rejection scenario
    console.log('\n' + '=' .repeat(60));
    console.log('📌 Bonus Test: Testing rejection scenario...');
    console.log('=' .repeat(60));
    
    // Create a new spark first
    console.log('\nCreating a new spark to test rejection...');
    
    // Move to slightly different location to create new spark
    const newLocation = { ...testLocation, latitude: 37.5666 };
    
    await axios.post(`${API_URL}/location`, newLocation, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    await axios.post(`${API_URL}/location`, newLocation, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newSparks = await axios.get(`${API_URL}/sparks`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    
    const newSpark = newSparks.data.data.find(s => 
      s.id !== spark.id && (s.otherUserNickname === user2.username || s.otherUserId === user2.username)
    );
    
    if (newSpark) {
      console.log(`\n✅ New spark created for rejection test: ${newSpark.id}`);
      
      // User1 rejects
      try {
        const rejectResponse = await axios.put(
          `${API_URL}/sparks/${newSpark.id}/reject`,
          {},
          { headers: { Authorization: `Bearer ${token1}` } }
        );
        
        console.log(`\nUser1 rejected the spark`);
        console.log(`  - Status: ${rejectResponse.data.data.status}`);
        
        if (rejectResponse.data.data.status === 'rejected') {
          console.log('  ✅ Correct: Spark is rejected when one user rejects');
        } else {
          console.log(`  ❌ Error: Expected rejected but got ${rejectResponse.data.data.status}`);
        }
      } catch (error) {
        console.log(`❌ Error rejecting spark: ${error.response?.data?.message || error.message}`);
      }
    } else {
      console.log('\n⚠️ Could not create new spark for rejection test');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.response?.data || error.message);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('Test completed');
}

// Run the test
testSparkAcceptance().catch(console.error);