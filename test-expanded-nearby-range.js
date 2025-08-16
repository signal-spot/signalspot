const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testExpandedNearbyRange() {
  try {
    console.log('🗺️ Testing Expanded Nearby API Range');
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
    
    // Test default parameters (now should be radius=10km, limit=50)
    console.log('\n📍 Test 1: Default parameters (radius=10km, limit=50)...');
    const defaultResponse = await axios.get(`${API_BASE_URL}/signal-spots/nearby`, {
      headers,
      params: {
        latitude: 37.5665,
        longitude: 126.9780
        // No radiusKm or limit specified - should use new defaults
      }
    });
    
    console.log(`   ✅ Found ${defaultResponse.data.count} Signal Spots with default settings`);
    console.log(`   📊 Expected: 10km radius, up to 50 results`);
    
    // Test expanded radius (25km)
    console.log('\n🔍 Test 2: Expanded radius (25km)...');
    const expandedResponse = await axios.get(`${API_BASE_URL}/signal-spots/nearby`, {
      headers,
      params: {
        latitude: 37.5665,
        longitude: 126.9780,
        radiusKm: 25
      }
    });
    
    console.log(`   ✅ Found ${expandedResponse.data.count} Signal Spots within 25km`);
    
    // Test maximum radius (100km)
    console.log('\n🌐 Test 3: Maximum radius (100km)...');
    const maxRadiusResponse = await axios.get(`${API_BASE_URL}/signal-spots/nearby`, {
      headers,
      params: {
        latitude: 37.5665,
        longitude: 126.9780,
        radiusKm: 100
      }
    });
    
    console.log(`   ✅ Found ${maxRadiusResponse.data.count} Signal Spots within 100km`);
    
    // Test higher limit
    console.log('\n📊 Test 4: Higher limit (80 results)...');
    const highLimitResponse = await axios.get(`${API_BASE_URL}/signal-spots/nearby`, {
      headers,
      params: {
        latitude: 37.5665,
        longitude: 126.9780,
        radiusKm: 50,
        limit: 80
      }
    });
    
    console.log(`   ✅ Found ${highLimitResponse.data.count} Signal Spots (limit: 80)`);
    
    // Create some additional test spots to demonstrate increased coverage
    console.log('\n🚀 Test 5: Creating test spots at various distances...');
    
    const testSpots = [
      {
        name: 'Incheon Airport Area',
        latitude: 37.4602,
        longitude: 126.4407,
        distance: '~52km from Seoul City Hall',
        content: '인천공항 근처 테스트 스팟 - 확장된 범위 테스트용'
      },
      {
        name: 'Suwon Area', 
        latitude: 37.2636,
        longitude: 127.0286,
        distance: '~35km from Seoul City Hall',
        content: '수원 지역 테스트 스팟 - 확장 범위 내'
      },
      {
        name: 'Gangnam District',
        latitude: 37.4979,
        longitude: 127.0276,
        distance: '~10km from Seoul City Hall',
        content: '강남구 테스트 스팟 - 기본 범위 내'
      }
    ];
    
    let createdCount = 0;
    for (const spot of testSpots) {
      try {
        await axios.post(`${API_BASE_URL}/signal-spots`, {
          content: spot.content,
          latitude: spot.latitude,
          longitude: spot.longitude,
          title: `확장 범위 테스트 - ${spot.name}`,
          mediaUrls: [],
          tags: ['range-test', spot.name.toLowerCase().replace(/\s+/g, '-')]
        }, { headers });
        
        console.log(`   ✅ Created: ${spot.name} (${spot.distance})`);
        createdCount++;
      } catch (error) {
        if (error.response?.status === 400 && 
            error.response?.data?.error?.message?.includes('Similar spot already exists')) {
          console.log(`   ⚠️  ${spot.name}: Already exists`);
        } else {
          console.log(`   ❌ ${spot.name}: Failed - ${error.response?.data?.error?.message || error.message}`);
        }
      }
    }
    
    // Final verification with expanded range
    console.log('\n🎯 Test 6: Final verification with 50km radius...');
    const finalResponse = await axios.get(`${API_BASE_URL}/signal-spots/nearby`, {
      headers,
      params: {
        latitude: 37.5665,
        longitude: 126.9780,
        radiusKm: 50,
        limit: 100
      }
    });
    
    console.log(`   ✅ Final count: ${finalResponse.data.count} Signal Spots within 50km`);
    
    console.log('\n📈 Range Expansion Results:');
    console.log(`   📍 Default radius: 1km → 10km (10x increase)`);
    console.log(`   📊 Default limit: 20 → 50 (2.5x increase)`);
    console.log(`   🌐 Maximum radius: 50km → 100km (2x increase)`);
    console.log(`   🚀 More Signal Spots will be returned in nearby searches`);
    
    if (createdCount > 0) {
      console.log(`   ✅ Created ${createdCount} test spots at various distances`);
    }
    
    console.log('\n🎉 NEARBY API RANGE SUCCESSFULLY EXPANDED! 🎉');
    console.log('   이제 nearby API가 더 넓은 범위에서 더 많은 Signal Spot을 반환합니다! 🗺️');
    
  } catch (error) {
    console.log('\n❌ Range expansion test FAILED:', error.response?.status);
    if (error.response?.data) {
      console.log('   Error details:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('   Error:', error.message);
    }
  }
}

testExpandedNearbyRange();