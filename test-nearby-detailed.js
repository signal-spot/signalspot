const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testNearbyDetailed() {
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
    
    // Test different parameter combinations for nearby signals
    const testCases = [
      {
        name: 'Standard params',
        params: { latitude: 37.7749, longitude: -122.4194, radiusKm: 5 }
      },
      {
        name: 'Minimal params',
        params: { latitude: 37.7749, longitude: -122.4194 }
      },
      {
        name: 'String coordinates',
        params: { latitude: '37.7749', longitude: '-122.4194' }
      },
      {
        name: 'Different endpoint format',
        params: { lat: 37.7749, lng: -122.4194 }
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n2. Testing nearby signals with ${testCase.name}...`);
      console.log('   Params:', JSON.stringify(testCase.params));
      
      try {
        const response = await axios.get(`${API_BASE_URL}/signal-spots/nearby`, {
          headers,
          params: testCase.params
        });
        console.log('✅ Success:', response.status);
        console.log('   Response:', response.data);
        break; // Stop at first success
      } catch (error) {
        console.log('❌ Failed:', error.response?.status);
        if (error.response?.data) {
          console.log('   Error details:', JSON.stringify(error.response.data, null, 2));
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.status, error.response?.data || error.message);
  }
}

testNearbyDetailed();