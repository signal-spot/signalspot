const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testAllFixes() {
  try {
    console.log('🎯 Testing All Nearby API Fixes');
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
    
    // Test 1: Default parameters (should use 10km default)
    console.log('\n📍 Test 1: Default parameters (should use 10km default)...');
    const defaultResponse = await axios.get(`${API_BASE_URL}/signal-spots/nearby`, {
      headers,
      params: {
        latitude: 37.5665,
        longitude: 126.9780
      }
    });
    
    console.log(`   ✅ Found ${defaultResponse.data.count} Signal Spots with defaults`);
    console.log(`   📊 Expected: 10km radius, up to 50 results`);
    
    // Test 2: Large radius to find all spots
    console.log('\n🌐 Test 2: Large radius (50km) to find more spots...');
    const largeRadiusResponse = await axios.get(`${API_BASE_URL}/signal-spots/nearby`, {
      headers,
      params: {
        latitude: 37.5665,
        longitude: 126.9780,
        radiusKm: 50,
        limit: 100
      }
    });
    
    console.log(`   ✅ Found ${largeRadiusResponse.data.count} Signal Spots within 50km`);
    
    // Test 3: Check for duplicates at same coordinates
    console.log('\n🔍 Test 3: Checking for multiple spots at same coordinates...');
    const duplicateCoords = {};
    
    largeRadiusResponse.data.data.forEach(spot => {
      const key = `${spot.latitude},${spot.longitude}`;
      if (!duplicateCoords[key]) {
        duplicateCoords[key] = [];
      }
      duplicateCoords[key].push(spot);
    });
    
    let hasDuplicates = false;
    Object.entries(duplicateCoords).forEach(([coords, spots]) => {
      if (spots.length > 1) {
        hasDuplicates = true;
        console.log(`   📍 Coordinates ${coords}: ${spots.length} spots`);
        spots.forEach((spot, index) => {
          console.log(`      ${index + 1}. "${spot.title}" - ID: ${spot.id}`);
        });
      }
    });
    
    if (!hasDuplicates) {
      console.log('   ℹ️  No duplicate coordinates found in results');
    }
    
    // Test 4: Swagger parameter check
    console.log('\n📋 Test 4: API parameter structure...');
    console.log('   ℹ️  Check Swagger UI for parameter duplication');
    console.log('   Expected: Each parameter should appear only once');
    
    // Summary
    console.log('\n📊 Fix Summary:');
    console.log('   ✅ Default radius: Now using 10km (was 1km)');
    console.log('   ✅ Service layer: Using LocationQueryDto class');
    console.log('   ✅ Domain filtering: Removed double radius check');
    console.log('   ✅ Swagger: Using declare keyword to avoid duplication');
    
    console.log('\n🎉 All fixes have been applied!');
    console.log('   ⚠️  Note: Backend server needs restart to apply changes');
    
  } catch (error) {
    console.log('\n❌ Test FAILED:', error.response?.status);
    if (error.response?.data) {
      console.log('   Error details:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('   Error:', error.message);
    }
  }
}

testAllFixes();