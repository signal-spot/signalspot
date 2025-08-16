const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testApiEndpoints() {
  try {
    const testEmail = 'test3@example.com';
    const testPassword = 'Password123!';
    
    // Step 1: Login to get fresh token
    console.log('1. Logging in to get fresh token...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    
    const accessToken = loginResponse.data.data.accessToken;
    console.log('✅ Login successful, got access token');
    
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    
    // Step 2: Test nearby signals API
    console.log('\n2. Testing nearby signals API...');
    try {
      const nearbyResponse = await axios.get(`${API_BASE_URL}/signal-spots/nearby`, {
        headers,
        params: {
          latitude: 37.7749,
          longitude: -122.4194,
          radiusKm: 5
        }
      });
      console.log('✅ Nearby signals API working:', nearbyResponse.status);
      console.log('   Response:', nearbyResponse.data);
    } catch (error) {
      console.log('❌ Nearby signals API failed:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    // Step 3: Test trending signals API (for feed)
    console.log('\n3. Testing trending signals API (for feed)...');
    try {
      const trendingResponse = await axios.get(`${API_BASE_URL}/signal-spots/trending`, {
        headers,
        params: {
          limit: 20
        }
      });
      console.log('✅ Trending signals API working:', trendingResponse.status);
      console.log('   Response:', trendingResponse.data);
    } catch (error) {
      console.log('❌ Trending signals API failed:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    // Step 4: Test sparks API
    console.log('\n4. Testing sparks API...');
    try {
      const sparksResponse = await axios.get(`${API_BASE_URL}/sparks`, {
        headers
      });
      console.log('✅ Sparks API working:', sparksResponse.status);
      console.log('   Response:', sparksResponse.data);
    } catch (error) {
      console.log('❌ Sparks API failed:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    // Step 5: Test my signals API
    console.log('\n5. Testing my signals API...');
    try {
      const mySignalsResponse = await axios.get(`${API_BASE_URL}/signal-spots/my-spots`, {
        headers
      });
      console.log('✅ My signals API working:', mySignalsResponse.status);
      console.log('   Response:', mySignalsResponse.data);
    } catch (error) {
      console.log('❌ My signals API failed:', error.response?.status, error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.status, error.response?.data || error.message);
  }
}

testApiEndpoints();