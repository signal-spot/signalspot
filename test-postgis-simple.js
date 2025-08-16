const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testPostGIS() {
  try {
    console.log('1. Registering new user...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      email: 'postgis@example.com',
      password: 'Password123!',
      username: 'postgisuser'
    });
    
    console.log('✅ Registration successful');
    
    console.log('2. Logging in...');
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
    
    console.log('3. Testing nearby signals with PostGIS...');
    try {
      const response = await axios.get(`${API_BASE_URL}/signal-spots/nearby`, {
        headers,
        params: {
          latitude: 37.7749,
          longitude: -122.4194,
          radiusKm: 5
        }
      });
      console.log('✅ PostGIS nearby query SUCCESS:', response.status);
      console.log('   Response:', response.data);
    } catch (error) {
      console.log('❌ PostGIS nearby query FAILED:', error.response?.status);
      if (error.response?.data) {
        console.log('   Error details:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.status, error.response?.data || error.message);
  }
}

testPostGIS();