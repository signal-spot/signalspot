const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// 서울 주요 지역의 테스트 위치들
const testLocations = [
  { lat: 37.5665, lng: 126.9780, title: "시청역", content: "서울시청 근처에서 스파크를 느꼈어요!" },
  { lat: 37.5636, lng: 126.9783, title: "덕수궁", content: "덕수궁 돌담길에서 우연히 마주쳤어요" },
  { lat: 37.5672, lng: 126.9736, title: "광화문", content: "광화문 광장에서 같은 공연을 봤네요" },
  { lat: 37.5658, lng: 126.9800, title: "을지로입구역", content: "을지로 카페거리에서 본 것 같아요" },
  { lat: 37.5700, lng: 126.9760, title: "경복궁역", content: "경복궁 관람 중에 눈이 마주쳤어요" },
  { lat: 37.5640, lng: 126.9750, title: "종각역", content: "종각 젊음의 거리에서 스쳐 지나갔어요" },
  { lat: 37.5660, lng: 126.9826, title: "명동", content: "명동 쇼핑 중에 같은 매장에 있었네요" },
  { lat: 37.5511, lng: 126.9882, title: "남산타워", content: "남산 케이블카에서 함께 탔던 분이신가요?" },
  { lat: 37.5704, lng: 126.9911, title: "혜화역", content: "대학로에서 연극 보고 나오시는 거 봤어요" },
  { lat: 37.5607, lng: 126.9937, title: "동대문", content: "DDP에서 전시 보던 중 마주쳤네요" },
  { lat: 37.5579, lng: 127.0068, title: "왕십리역", content: "왕십리역 환승 중에 봤어요" },
  { lat: 37.5443, lng: 126.9685, title: "이태원", content: "이태원 거리에서 스쳐 지나갔어요" },
  { lat: 37.5311, lng: 126.9974, title: "강남역", content: "강남역 11번 출구에서 만났던 것 같아요" },
  { lat: 37.5219, lng: 126.9245, title: "여의도", content: "한강공원에서 자전거 타시던 분?" },
  { lat: 37.5172, lng: 127.0473, title: "잠실역", content: "롯데타워에서 엘리베이터 함께 탔어요" },
];

async function createTestSignalSpots() {
  try {
    console.log('🔐 1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'postgis@example.com',
      password: 'Password123!'
    });
    
    const accessToken = loginResponse.data.data.accessToken;
    console.log('✅ Login successful\n');
    
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    
    console.log('📍 2. Creating Signal Spots at various locations...\n');
    console.log('⚠️  Note: API has rate limiting (5 requests per minute). Will create spots in batches.\n');
    
    let successCount = 0;
    let failCount = 0;
    let rateLimitedCount = 0;
    
    // 배치 처리: 5개씩 나누어 처리 (rate limit 회피)
    const batchSize = 5;
    const batches = [];
    for (let i = 0; i < testLocations.length; i += batchSize) {
      batches.push(testLocations.slice(i, i + batchSize));
    }
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      
      if (batchIndex > 0) {
        console.log(`\n⏳ Waiting 1 minute for rate limit (batch ${batchIndex + 1}/${batches.length})...`);
        await delay(60000); // 1분 대기
      }
      
      console.log(`\n📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} spots)...`);
      
      for (const location of batch) {
        try {
          const spotData = {
            content: location.content,
            title: location.title,
            latitude: location.lat,
            longitude: location.lng,
            radiusInMeters: Math.floor(100 + Math.random() * 200), // 100-300m 랜덤
            durationHours: Math.floor(24 + Math.random() * 48), // 24-72시간 랜덤 (정수로 변경)
            tags: generateRandomTags()
          };
          
          console.log(`  Creating Signal Spot at ${location.title}...`);
          
          const response = await axios.post(
            `${API_BASE_URL}/signal-spots`,
            spotData,
            { headers }
          );
          
          if (response.data.success) {
            successCount++;
            console.log(`  ✅ Created: ${location.title} (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`);
          } else {
            failCount++;
            console.log(`  ❌ Failed: ${location.title}`);
          }
          
          // 각 요청 사이에 짧은 딜레이
          await delay(1000);
          
        } catch (error) {
          if (error.response?.status === 429) {
            rateLimitedCount++;
            console.log(`  ⏳ Rate limited at ${location.title}. Skipping this batch.`);
            break; // 현재 배치 중단
          } else {
            failCount++;
            console.log(`  ❌ Error creating spot at ${location.title}:`, error.response?.data?.message || error.message);
          }
        }
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully created: ${successCount} spots`);
    console.log(`   ❌ Failed: ${failCount} spots`);
    if (rateLimitedCount > 0) {
      console.log(`   ⏳ Rate limited: ${rateLimitedCount} attempts`);
    }
    
    // 생성된 Signal Spot 확인
    console.log('\n🔍 3. Verifying created spots...');
    const nearbyResponse = await axios.get(`${API_BASE_URL}/signal-spots/nearby`, {
      headers,
      params: {
        latitude: 37.5665,
        longitude: 126.9780,
        radiusKm: 10,
        limit: 50
      }
    });
    
    console.log(`   Found ${nearbyResponse.data.data.length} Signal Spots within 10km of 시청역`);
    
    // 각 지역별 Signal Spot 표시
    console.log('\n📍 Signal Spots by location:');
    for (const spot of nearbyResponse.data.data) {
      const distance = calculateDistance(37.5665, 126.9780, spot.latitude, spot.longitude);
      console.log(`   - ${spot.title}: ${distance.toFixed(1)}km away`);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.status);
    if (error.response?.data) {
      console.log('   Error details:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('   Error:', error.message);
    }
  }
}

// 랜덤 태그 생성
function generateRandomTags() {
  const allTags = [
    '우연', '스파크', '만남', '인연', '커피', '카페', 
    '지하철', '버스', '공원', '쇼핑', '맛집', '산책',
    '운동', '독서', '음악', '전시', '영화', '공연'
  ];
  
  const numTags = Math.floor(Math.random() * 3) + 2; // 2-4개의 태그
  const tags = [];
  
  for (let i = 0; i < numTags; i++) {
    const randomTag = allTags[Math.floor(Math.random() * allTags.length)];
    if (!tags.includes(randomTag)) {
      tags.push(randomTag);
    }
  }
  
  return tags;
}

// 거리 계산 (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 지구 반경 (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 스크립트 실행
createTestSignalSpots();