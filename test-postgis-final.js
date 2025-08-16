const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testPostGISFinal() {
  try {
    console.log('1. Testing existing user login...');
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
    
    console.log('2. Testing nearby signals with PostGIS...');
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
      
      console.log('\n3. Testing sparks API...');
      const sparksResponse = await axios.get(`${API_BASE_URL}/sparks`, {
        headers
      });
      console.log('✅ Sparks API working:', sparksResponse.status);
      console.log('   Response:', sparksResponse.data);
      
    } catch (error) {
      console.log('❌ API call FAILED:', error.response?.status);
      if (error.response?.data) {
        console.log('   Error details:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.status, error.response?.data || error.message);
  }
}

testPostGISFinal();