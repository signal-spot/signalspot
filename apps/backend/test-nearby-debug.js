const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testNearbyDebug() {
  try {
    console.log('🔍 Testing Nearby API with Debug Logging');
    console.log('=' .repeat(45));
    
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
    
    // Test with explicit radius parameter
    console.log('\n📍 Testing with explicit 50km radius...');
    const explicitResponse = await axios.get(`${API_BASE_URL}/signal-spots/nearby`, {
      headers,
      params: {
        latitude: 37.5665,
        longitude: 126.9780,
        radiusKm: 50,
        limit: 100
      }
    });
    
    console.log(`   📊 Explicit 50km: ${explicitResponse.data.count} Signal Spots`);
    console.log(`   📋 Response data structure:`, JSON.stringify(explicitResponse.data, null, 2));
    
    // Test without radius (should use default)
    console.log('\n📍 Testing without radius parameter (should use 10km default)...');
    const defaultResponse = await axios.get(`${API_BASE_URL}/signal-spots/nearby`, {
      headers,
      params: {
        latitude: 37.5665,
        longitude: 126.9780
      }
    });
    
    console.log(`   📊 Default radius: ${defaultResponse.data.count} Signal Spots`);
    
    // Test different location (maybe there are more spots elsewhere)
    console.log('\n📍 Testing different location (Gangnam)...');
    const gangnamResponse = await axios.get(`${API_BASE_URL}/signal-spots/nearby`, {
      headers,
      params: {
        latitude: 37.4979, // Gangnam
        longitude: 127.0276,
        radiusKm: 30
      }
    });
    
    console.log(`   📊 Gangnam area (30km): ${gangnamResponse.data.count} Signal Spots`);
    
    // List all spots to see what's available
    console.log('\n📍 Getting user\'s own spots...');
    try {
      const mySpots = await axios.get(`${API_BASE_URL}/signal-spots/my-spots`, {
        headers,
        params: {
          limit: 100,
          includeExpired: true
        }
      });
      
      console.log(`   📊 User's total spots: ${mySpots.data.count}`);
      if (mySpots.data.data.length > 0) {
        console.log(`   📍 User's spots locations:`);
        mySpots.data.data.forEach((spot, index) => {
          console.log(`      ${index + 1}. [${spot.location?.latitude || 'N/A'}, ${spot.location?.longitude || 'N/A'}] - "${spot.title}"`);
        });
      }
    } catch (error) {
      console.log(`   ⚠️  Could not fetch user spots: ${error.response?.data?.message || error.message}`);
    }
    
    console.log('\n🎯 Debug Analysis:');
    console.log('   If we\'re still getting only 2 results, it could be due to:');
    console.log('   1. Database only has 2 active spots');
    console.log('   2. Spots are filtered by user permissions');
    console.log('   3. Spots have expired');
    console.log('   4. PostGIS query is working but data is limited');
    
  } catch (error) {
    console.log('\n❌ Debug test FAILED:', error.response?.status);
    if (error.response?.data) {
      console.log('   Error details:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('   Error:', error.message);
    }
  }
}

testNearbyDebug();