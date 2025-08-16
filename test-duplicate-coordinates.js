const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testDuplicateCoordinates() {
  try {
    console.log('🔍 Testing Duplicate Coordinates Issue');
    console.log('=' .repeat(50));
    
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
    
    const targetLat = 37.567734205835166;
    const targetLon = 126.97411481291056;
    
    // Test nearby with exact coordinates
    console.log(`\n📍 Testing nearby API with exact coordinates:`);
    console.log(`   Latitude: ${targetLat}`);
    console.log(`   Longitude: ${targetLon}`);
    
    const nearbyResponse = await axios.get(`${API_BASE_URL}/signal-spots/nearby`, {
      headers,
      params: {
        latitude: targetLat,
        longitude: targetLon,
        radiusKm: 1, // 1km to see very close spots
        limit: 100
      }
    });
    
    console.log(`\n📊 Nearby API returned: ${nearbyResponse.data.count} spots`);
    
    // Check for exact coordinate matches
    let exactMatches = 0;
    nearbyResponse.data.data.forEach((spot, index) => {
      const isExactMatch = spot.latitude === targetLat && spot.longitude === targetLon;
      if (isExactMatch) {
        exactMatches++;
        console.log(`   ✅ Exact match ${exactMatches}: "${spot.title}" - ID: ${spot.id}`);
      }
    });
    
    console.log(`\n🎯 Found ${exactMatches} exact coordinate matches (expected 4)`);
    
    // Get all user's spots to check
    console.log('\n📋 Checking all user spots for duplicates...');
    const allSpots = await axios.get(`${API_BASE_URL}/signal-spots/my-spots`, {
      headers,
      params: {
        limit: 100,
        includeExpired: true
      }
    });
    
    let totalExactMatches = 0;
    console.log('\n📍 Spots at target coordinates:');
    allSpots.data.data.forEach((spot) => {
      if (spot.latitude === targetLat && spot.longitude === targetLon) {
        totalExactMatches++;
        console.log(`   ${totalExactMatches}. "${spot.title}" - Status: ${spot.status} - Created: ${spot.createdAt}`);
      }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   - Total spots at coordinates: ${totalExactMatches}`);
    console.log(`   - Returned by nearby API: ${exactMatches}`);
    console.log(`   - Missing from nearby: ${totalExactMatches - exactMatches}`);
    
    if (totalExactMatches > exactMatches) {
      console.log('\n❌ ISSUE CONFIRMED: Not all spots at same coordinates are returned!');
      console.log('   This could be due to:');
      console.log('   1. PostGIS deduplication in the query');
      console.log('   2. Additional filtering (expired, inactive, etc.)');
      console.log('   3. Visibility permissions');
    }
    
  } catch (error) {
    console.log('\n❌ Test FAILED:', error.response?.status);
    if (error.response?.data) {
      console.log('   Error details:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('   Error:', error.message);
    }
  }
}

testDuplicateCoordinates();