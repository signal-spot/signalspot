const axios = require('axios');

const API_BASE_URL = 'https://lettie.co.kr/signalspot/api';

// 익명 계정 정보
const ANONYMOUS_ACCOUNT = {
  email: 'anonymous2024@example.com',
  password: 'Anonymous123!',
  username: '익명'
};

// 대한민국 전역 20개 실제 장소 좌표
const koreaLocations = [
  // 서울 지역 (5개)
  { lat: 37.5012, lng: 127.0396, city: '서울-강남', place: '강남역 11번 출구' },
  { lat: 37.5533, lng: 126.9235, city: '서울-홍대', place: '홍대입구역 9번 출구' },
  { lat: 37.5602, lng: 126.9862, city: '서울-명동', place: '명동성당' },
  { lat: 37.5340, lng: 126.9948, city: '서울-이태원', place: '이태원역 1번 출구' },
  { lat: 37.5640, lng: 126.9770, city: '서울-종로', place: '광화문광장' },
  
  // 경기도 지역 (3개)
  { lat: 37.3220, lng: 127.1268, city: '성남-분당', place: '서현역' },
  { lat: 37.2636, lng: 127.0286, city: '수원', place: '수원역 로데오거리' },
  { lat: 37.3947, lng: 127.1115, city: '성남-판교', place: '판교테크노밸리' },
  
  // 부산 지역 (2개)
  { lat: 35.1581, lng: 129.1602, city: '부산-해운대', place: '해운대 백사장' },
  { lat: 35.1537, lng: 129.0594, city: '부산-서면', place: '서면 지하상가' },
  
  // 대구 지역 (2개)
  { lat: 35.8690, lng: 128.5956, city: '대구-중구', place: '동성로 스파크' },
  { lat: 35.8403, lng: 128.6816, city: '대구-수성구', place: '수성못역' },
  
  // 인천 지역 (2개)
  { lat: 37.4562, lng: 126.7052, city: '인천-남동구', place: '인천시청역' },
  { lat: 37.3923, lng: 126.6612, city: '인천-연수구', place: '송도국제도시' },
  
  // 광주
  { lat: 35.1468, lng: 126.9224, city: '광주-동구', place: '충장로5가역' },
  
  // 대전
  { lat: 36.3504, lng: 127.3845, city: '대전-서구', place: '대전시청' },
  
  // 울산
  { lat: 35.5439, lng: 129.2560, city: '울산-남구', place: '울산대공원' },
  
  // 제주 (2개)
  { lat: 33.4890, lng: 126.4983, city: '제주시', place: '제주공항' },
  { lat: 33.4612, lng: 126.5603, city: '제주-중문', place: '중문관광단지' },
  
  // 전주
  { lat: 35.8242, lng: 127.1480, city: '전주', place: '전주한옥마을' }
];

// 익명 고백 메시지들 (20개)
const anonymousMessages = [
  {
    title: "오늘 지하철에서 봤어요",
    content: "베이지 코트 입으신 분 스타일 좋으시네요! 좋은 하루 보내세요.",
    tags: ['익명고백', '지하철', '일상', '칭찬']
  },
  {
    title: "카페에서 공부하시는 분께",
    content: "열심히 하시는 모습이 멋있어요. 화이팅!",
    tags: ['익명고백', '카페', '공부', '응원']
  },
  {
    title: "점심시간 우연히 봤어요",
    content: "김치볶음밥 맛있죠? 저도 자주 먹어요!",
    tags: ['익명고백', '편의점', '점심', '공감']
  },
  {
    title: "도서관에서 자주 뵈네요",
    content: "시험기간인가봐요. 우리 모두 화이팅해요!",
    tags: ['익명고백', '도서관', '공부', '응원']
  },
  {
    title: "운동 열심히 하시네요",
    content: "저도 동기부여 받고 갑니다. 건강하세요!",
    tags: ['익명고백', '운동', '동기부여', '건강']
  },
  {
    title: "퇴근길 수고하셨어요",
    content: "오늘도 고생 많으셨어요. 푹 쉬세요!",
    tags: ['익명고백', '퇴근', '위로', '응원']
  },
  {
    title: "음악 듣는 모습이 평화로워요",
    content: "좋은 음악 들으시나봐요. 행복한 하루 되세요.",
    tags: ['익명고백', '일상', '음악', '평화']
  },
  {
    title: "맛집 취향이 비슷하네요",
    content: "저도 마라탕 좋아해요! 맛있게 드세요.",
    tags: ['익명고백', '맛집', '음식', '공감']
  },
  {
    title: "아침 운동 멋있어요",
    content: "일찍 일어나서 운동하시는 거 대단해요!",
    tags: ['익명고백', '운동', '아침', '칭찬']
  },
  {
    title: "독서하는 모습 보기 좋아요",
    content: "책 읽는 사람이 줄어드는데 멋있으세요.",
    tags: ['익명고백', '독서', '칭찬', '문화']
  },
  {
    title: "새벽 운동 대단하세요",
    content: "의지력이 정말 강하신가봐요. 존경스러워요!",
    tags: ['익명고백', '운동', '새벽', '존경']
  },
  {
    title: "개발자이신가요?",
    content: "스티커 보니 친근하네요. 코딩 화이팅!",
    tags: ['익명고백', '개발자', 'IT', '응원']
  },
  {
    title: "야근 힘드시죠",
    content: "늦게까지 일하시는 것 같아요. 건강 챙기세요!",
    tags: ['익명고백', '야근', '걱정', '응원']
  },
  {
    title: "공부 열심히 하시네요",
    content: "좋은 결과 있으실 거예요. 응원합니다!",
    tags: ['익명고백', '공부', '도서관', '응원']
  },
  {
    title: "목소리가 좋으세요",
    content: "우연히 들었는데 목소리가 따뜻하네요.",
    tags: ['익명고백', '일상', '목소리', '칭찬']
  },
  {
    title: "자전거 타는 모습 멋져요",
    content: "환경도 생각하시고 건강도 챙기시네요!",
    tags: ['익명고백', '자전거', '환경', '칭찬']
  },
  {
    title: "혼자만의 시간",
    content: "평화롭게 시간 보내시는 모습이 좋아 보여요.",
    tags: ['익명고백', '일상', '평화', '공감']
  },
  {
    title: "우연히 마주쳤네요",
    content: "오늘도 좋은 하루 보내세요!",
    tags: ['익명고백', '일상', '인사', '긍정']
  }
];

// 계정 생성 또는 로그인
async function createOrLoginAccount() {
  try {
    // 먼저 계정 생성 시도
    console.log('🔐 익명 계정 생성 시도 중...');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: ANONYMOUS_ACCOUNT.email,
        password: ANONYMOUS_ACCOUNT.password,
        username: ANONYMOUS_ACCOUNT.username
      });
      console.log(`✅ 익명 계정 생성 성공: ${ANONYMOUS_ACCOUNT.username}`);
      return registerResponse.data.data.accessToken;
    } catch (error) {
      if (error.response?.status === 409) {
        // 이미 존재하는 계정이면 로그인
        console.log('⚠️  계정이 이미 존재합니다. 로그인 시도 중...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: ANONYMOUS_ACCOUNT.email,
          password: ANONYMOUS_ACCOUNT.password
        });
        console.log(`✅ 로그인 성공: ${ANONYMOUS_ACCOUNT.username}`);
        return loginResponse.data.data.accessToken;
      }
      throw error;
    }
  } catch (error) {
    console.error('❌ 계정 생성/로그인 실패:', error.response?.data || error.message);
    throw error;
  }
}

// 시그널스팟 생성
async function createSignalSpots(accessToken) {
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
  
  console.log('\n📍 대한민국 전역에 시그널스팟 생성 시작...\n');
  console.log('⚠️  Rate limiting (분당 5개) 대응을 위해 배치 처리합니다.\n');
  
  let successCount = 0;
  let failCount = 0;
  
  // 위치와 메시지를 랜덤하게 매칭
  const shuffledMessages = [...anonymousMessages].sort(() => Math.random() - 0.5);
  const spotsToCreate = koreaLocations.map((location, index) => ({
    location,
    message: shuffledMessages[index]
  }));
  
  // 5개씩 배치 처리
  const batchSize = 5;
  const batches = [];
  for (let i = 0; i < spotsToCreate.length; i += batchSize) {
    batches.push(spotsToCreate.slice(i, i + batchSize));
  }
  
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];

    // if (batchIndex > 0) {
    //   console.log(`\n⏳ Rate limit 대기 중... (1분)`);
    // }
    //
    // console.log(`\n📦 배치 ${batchIndex + 1}/${batches.length} 처리 중...\n`);

    for (const { location, message } of batch) {
      try {
        const spotData = {
          content: message.content,
          title: message.title,
          latitude: location.lat,
          longitude: location.lng,
          radiusInMeters: Math.floor(200 + Math.random() * 300), // 200-500m
          durationHours: Math.floor(24 + Math.random() * 144), // 24-168시간 (1-7일)
          tags: message.tags
        };
        
        const response = await axios.post(
          `${API_BASE_URL}/signal-spots`,
          spotData,
          { headers }
        );
        
        if (response.data.success) {
          successCount++;
          console.log(`  ✅ [${location.city}] "${message.title.substring(0, 20)}..."`);
        } else {
          failCount++;
          console.log(`  ❌ [${location.city}] 생성 실패`);
        }
        
        await delay(1000); // 요청 간 1초 대기
        
      } catch (error) {
        if (error.response?.status === 429) {
          console.log(`  ⏳ Rate limit 도달. 다음 배치로 이동`);
          break;
        } else {
          failCount++;
          console.log(`  ❌ [${location.city}] 오류:`, error.response?.data?.message || error.message);
        }
      }
    }
  }
  
  return { successCount, failCount };
}

// 결과 확인
async function verifyResults(accessToken) {
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
  
  console.log('\n🔍 생성된 시그널스팟 확인 중...\n');
  
  // 서울 중심으로 전국 범위 검색
  const response = await axios.get(`${API_BASE_URL}/signal-spots/nearby`, {
    headers,
    params: {
      latitude: 37.5665,
      longitude: 126.9780,
      radiusKm: 500, // 전국 범위
      limit: 100
    }
  });
  
  const spots = response.data.data;
  console.log(`📊 총 ${spots.length}개의 시그널스팟 발견\n`);
  
  // 도시별 그룹화
  const spotsByCity = {};
  spots.forEach(spot => {
    // 가장 가까운 도시 찾기
    let closestCity = '';
    let minDistance = Infinity;
    
    koreaLocations.forEach(loc => {
      const distance = calculateDistance(spot.latitude, spot.longitude, loc.lat, loc.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = loc.city;
      }
    });
    
    if (!spotsByCity[closestCity]) {
      spotsByCity[closestCity] = [];
    }
    spotsByCity[closestCity].push(spot.title);
  });
  
  // 도시별 출력
  console.log('📍 도시별 시그널스팟:');
  Object.entries(spotsByCity).forEach(([city, titles]) => {
    console.log(`\n  ${city}: ${titles.length}개`);
    titles.slice(0, 2).forEach(title => {
      console.log(`    - "${title.substring(0, 30)}..."`);
    });
  });
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

// 메인 실행 함수
async function main() {
  const startTime = Date.now();
  
  try {
    console.log('🚀 대한민국 전역 익명 시그널스팟 생성 스크립트\n');
    console.log('=' .repeat(50));
    
    // 1. 계정 생성/로그인
    const accessToken = await createOrLoginAccount();
    
    // 2. 시그널스팟 생성
    const { successCount, failCount } = await createSignalSpots(accessToken);
    
    // 3. 결과 확인
    await verifyResults(accessToken);
    
    // 4. 최종 통계
    const elapsedTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    
    console.log('\n' + '=' .repeat(50));
    console.log('\n📊 최종 결과:');
    console.log(`  ✅ 성공: ${successCount}개`);
    console.log(`  ❌ 실패: ${failCount}개`);
    console.log(`  ⏱️  총 소요시간: ${elapsedTime}분`);
    console.log('\n✨ 스크립트 실행 완료!');
    
  } catch (error) {
    console.error('\n❌ 스크립트 실행 실패:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
main();