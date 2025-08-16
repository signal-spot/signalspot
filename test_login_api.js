const axios = require('axios');

async function testLogin() {
  const baseURL = 'http://localhost:3000/api';
  
  console.log('Testing SignalSpot Login API...\n');
  
  // Test 1: Health check
  try {
    console.log('1. Testing auth health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/auth/health`);
    console.log('✅ Health check passed:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return;
  }
  
  // Test 2: Try to register a test user first
  console.log('\n2. Testing user registration...');
  const testUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    username: 'testuser'
  };
  
  try {
    const registerResponse = await axios.post(`${baseURL}/auth/register`, testUser);
    console.log('✅ Registration successful:', registerResponse.data);
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('ℹ️ User already exists, proceeding to login test...');
    } else {
      console.log('❌ Registration failed:', error.response?.data?.message || error.message);
    }
  }
  
  // Test 3: Try to login
  console.log('\n3. Testing user login...');
  try {
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('✅ Login successful:', loginResponse.data);
    
    // Test 4: Test authenticated endpoint
    console.log('\n4. Testing authenticated profile endpoint...');
    const profileResponse = await axios.get(`${baseURL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.accessToken}`
      }
    });
    
    console.log('✅ Profile fetch successful:', {
      id: profileResponse.data.id,
      email: profileResponse.data.email,
      username: profileResponse.data.username
    });
    
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
  }
  
  console.log('\n🎉 API tests completed!');
}

testLogin().catch(console.error);