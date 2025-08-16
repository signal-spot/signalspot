const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testSparks() {
  try {
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'postgis@example.com',
      password: 'Password123!'
    });
    
    const accessToken = loginResponse.data.data.accessToken;
    console.log('✅ Login successful');
    
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    
    console.log('2. Testing sparks API...');
    const response = await axios.get(`${API_BASE_URL}/sparks`, {
      headers
    });
    console.log('✅ Sparks API SUCCESS:', response.status);
    console.log('   Response:', response.data);
    
  } catch (error) {
    console.log('❌ API call FAILED:', error.response?.status);
    if (error.response?.data) {
      console.log('   Error details:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('   Error:', error.message);
    }
  }
}

testSparks();