const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testDatabaseLocations() {
  try {
    console.log('🗄️ Testing Database Location Data');
    console.log('=' .repeat(40));
    
    // Authentication
    console.log('\n🔐 Authentication...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'postgis@example.com',
      password: 'Password123!'
    });
    
    const headers = {
      'Authorization': `Bearer ${loginResponse.data.data.accessToken}`,
      'Content-Type': 'application/json'
    };
    
    // Get detailed spots info
    console.log('\n📍 Getting user spots with full details...');
    const mySpots = await axios.get(`${API_BASE_URL}/signal-spots/my-spots`, {
      headers,
      params: {
        limit: 10,
        includeExpired: true
      }
    });
    
    console.log(`\n📊 Found ${mySpots.data.count} spots. Checking location data:\n`);
    
    let spotsWithLocation = 0;
    let spotsWithoutLocation = 0;
    
    mySpots.data.data.forEach((spot, index) => {
      const hasLocation = spot.latitude !== null && spot.longitude !== null && 
                         spot.latitude !== undefined && spot.longitude !== undefined;
      
      if (hasLocation) {
        spotsWithLocation++;
        console.log(`✅ ${index + 1}. "${spot.title}" - [${spot.latitude}, ${spot.longitude}]`);
      } else {
        spotsWithoutLocation++;
        console.log(`❌ ${index + 1}. "${spot.title}" - [${spot.latitude}, ${spot.longitude}] (NULL/UNDEFINED)`);
      }
    });
    
    console.log(`\n📈 Location Data Summary:`);
    console.log(`   ✅ Spots WITH location data: ${spotsWithLocation}`);
    console.log(`   ❌ Spots WITHOUT location data: ${spotsWithoutLocation}`);
    console.log(`   📊 Total spots: ${mySpots.data.count}`);
    
    // Create a new test spot with explicit location
    console.log('\n🚀 Creating new test spot with explicit location...');
    try {
      const testSpot = {
        content: 'Database location test - 이 스팟은 위치 데이터가 제대로 저장되어야 합니다',
        latitude: 37.5665, // Seoul City Hall
        longitude: 126.9780,
        title: 'DB Location Test',
        mediaUrls: [],
        tags: ['location-test', 'database-debug']
      };
      
      const createResponse = await axios.post(`${API_BASE_URL}/signal-spots`, testSpot, { headers });
      console.log(`   ✅ Test spot created: ID ${createResponse.data.data.id}`);
      console.log(`   📍 Response location: [${createResponse.data.data.latitude}, ${createResponse.data.data.longitude}]`);
      
      // Immediately fetch it back
      const fetchResponse = await axios.get(`${API_BASE_URL}/signal-spots/${createResponse.data.data.id}`, { headers });
      console.log(`   🔍 Fetched back: [${fetchResponse.data.data.latitude}, ${fetchResponse.data.data.longitude}]`);
      
    } catch (error) {
      console.log(`   ❌ Failed to create test spot: ${error.response?.data?.message || error.message}`);
    }
    
    // Test nearby query again with known good coordinates
    console.log('\n🎯 Testing nearby with Seoul coordinates...');
    const nearbyResponse = await axios.get(`${API_BASE_URL}/signal-spots/nearby`, {
      headers,
      params: {
        latitude: 37.5665,
        longitude: 126.9780,
        radiusKm: 50
      }
    });
    
    console.log(`   📍 Nearby spots found: ${nearbyResponse.data.count}`);
    nearbyResponse.data.data.forEach((spot, index) => {
      console.log(`      ${index + 1}. "${spot.title}" - [${spot.latitude}, ${spot.longitude}]`);
    });
    
    console.log('\n🎯 Analysis:');
    if (spotsWithoutLocation > spotsWithLocation) {
      console.log('   🔍 Most spots are missing location data - this explains low nearby results');
      console.log('   💡 Solution: Fix the Signal Spot creation process to properly store coordinates');
    } else {
      console.log('   ✅ Most spots have location data - issue might be elsewhere');
    }
    
  } catch (error) {
    console.log('\n❌ Database location test FAILED:', error.response?.status);
    if (error.response?.data) {
      console.log('   Error details:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('   Error:', error.message);
    }
  }
}

testDatabaseLocations();