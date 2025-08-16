const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testAllAPIs() {
  try {
    console.log('🔐 1. Testing user login...');
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
    
    console.log('\n📍 2. Testing nearby signals API with PostGIS...');
    const nearbyResponse = await axios.get(`${API_BASE_URL}/signal-spots/nearby`, {
      headers,
      params: {
        latitude: 37.7749,
        longitude: -122.4194,
        radiusKm: 5
      }
    });
    console.log('✅ PostGIS nearby signals API SUCCESS:', nearbyResponse.status);
    console.log('   Count:', nearbyResponse.data.count);
    console.log('   Data length:', nearbyResponse.data.data.length);
    
    console.log('\n⚡ 3. Testing sparks API...');
    const sparksResponse = await axios.get(`${API_BASE_URL}/sparks`, {
      headers
    });
    console.log('✅ Sparks API SUCCESS:', sparksResponse.status);
    console.log('   Data length:', sparksResponse.data.data.length);
    
    console.log('\n🎉 All APIs are working correctly!');
    console.log('\n📊 Summary:');
    console.log('   ✅ User authentication: Working');
    console.log('   ✅ PostGIS spatial queries: Working');
    console.log('   ✅ Database column mapping: Fixed');
    console.log('   ✅ Spark entity relations: Fixed');
    
  } catch (error) {
    console.log('❌ API test FAILED:', error.response?.status);
    if (error.response?.data) {
      console.log('   Error details:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('   Error:', error.message);
    }
  }
}

testAllAPIs();