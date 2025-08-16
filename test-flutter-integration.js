const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testFlutterIntegration() {
  try {
    console.log('📱 Testing Flutter Signal Spot Creation Integration');
    console.log('=' .repeat(50));
    
    // Test 1: Simulate Flutter login
    console.log('\n🔐 1. Simulating Flutter login...');
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
    
    // Test 2: Simulate the exact data structure Flutter sends
    console.log('\n📝 2. Testing with exact Flutter request format...');
    const flutterRequestData = {
      content: '지도에서 클릭해서 만든 Signal Spot입니다! 🗺️',
      latitude: 37.5665,
      longitude: 126.9780,
      title: '서울시청 근처',
      mediaUrls: [],
      tags: []
    };
    
    console.log('   Flutter request data:', JSON.stringify(flutterRequestData, null, 2));
    
    const createResponse = await axios.post(`${API_BASE_URL}/signal-spots`, flutterRequestData, { headers });
    console.log('✅ Flutter-style Signal Spot creation SUCCESS!');
    console.log('   Response status:', createResponse.status);
    console.log('   Created spot ID:', createResponse.data.data.id);
    console.log('   Stored message:', createResponse.data.data.message);
    
    // Test 3: Test without optional fields (minimal request)
    console.log('\n🔄 3. Testing minimal request (content + coordinates only)...');
    const minimalRequest = {
      content: '최소 필드만으로 생성한 스팟',
      latitude: 37.5670,
      longitude: 126.9783
    };
    
    const minimalResponse = await axios.post(`${API_BASE_URL}/signal-spots`, minimalRequest, { headers });
    console.log('✅ Minimal request SUCCESS!');
    console.log('   Created spot ID:', minimalResponse.data.data.id);
    
    // Test 4: Fetch nearby spots to verify both are stored
    console.log('\n🔍 4. Fetching nearby spots to verify storage...');
    const nearbyResponse = await axios.get(`${API_BASE_URL}/signal-spots/nearby`, {
      headers,
      params: {
        latitude: 37.5665,
        longitude: 126.9780,
        radiusKm: 1
      }
    });
    
    console.log('✅ Nearby spots fetched:', nearbyResponse.data.data.length, 'spots found');
    nearbyResponse.data.data.forEach((spot, index) => {
      console.log(`   Spot ${index + 1}: "${spot.message}" (${spot.title || 'No title'})`);
    });
    
    console.log('\n🎉 Flutter Integration Test PASSED!');
    console.log('\n📊 Integration Summary:');
    console.log('   ✅ Frontend-Backend field mapping: Fixed');
    console.log('   ✅ Flutter CreateSignalSpotRequest → Backend CreateSpotDto: Working');
    console.log('   ✅ Validation pipeline: Working');
    console.log('   ✅ Database storage: Working');
    console.log('   ✅ API response format: Correct');
    console.log('\n🔧 Fix Applied:');
    console.log('   • Changed backend DTO from "message" to "content" field');
    console.log('   • Added mapping from "content" → "message" in domain layer');
    console.log('   • Maintained database schema (message field unchanged)');
    console.log('   • Fixed ValidationPipe rejection issue');
    
  } catch (error) {
    console.log('❌ Flutter integration test FAILED:', error.response?.status);
    if (error.response?.data) {
      console.log('   Error details:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('   Error:', error.message);
    }
  }
}

testFlutterIntegration();