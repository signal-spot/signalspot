const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testSparksDetailed() {
  try {
    const testEmail = 'test3@example.com';
    const testPassword = 'Password123!';
    
    // Login to get fresh token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    
    const accessToken = loginResponse.data.data.accessToken;
    console.log('✅ Login successful');
    
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    
    // Test sparks API with detailed error logging
    console.log('\n2. Testing sparks API...');
    try {
      const response = await axios.get(`${API_BASE_URL}/sparks`, {
        headers
      });
      console.log('✅ Success:', response.status);
      console.log('   Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Failed:', error.response?.status);
      if (error.response?.data) {
        console.log('   Error details:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log('   Error message:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.status, error.response?.data || error.message);
  }
}

testSparksDetailed();