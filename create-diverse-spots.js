const axios = require('axios');

const API_BASE_URL = 'https://lettie.co.kr/signalspot/api';

// 익명 계정 정보
const ANONYMOUS_ACCOUNT = {
  email: 'diverse2025@example.com',
  password: 'Diverse123!',
  username: '익명여행자'
};

// 전국 50개 다양한 지역 좌표
const koreaLocations = [
  // 서울 (10개)
  { lat: 37.5172, lng: 127.0473, city: '서울-잠실', place: '롯데월드타워' },
  { lat: 37.5138, lng: 127.1004, city: '서울-송파', place: '올림픽공원' },
  { lat: 37.5502, lng: 126.8490, city: '서울-마포', place: '월드컵공원' },
  { lat: 37.5796, lng: 126.9770, city: '서울-종로', place: '인사동' },
  { lat: 37.5511, lng: 126.9882, city: '서울-남산', place: 'N서울타워' },
  { lat: 37.5443, lng: 127.0557, city: '서울-성동', place: '성수동카페거리' },
  { lat: 37.5263, lng: 126.8966, city: '서울-영등포', place: '여의도한강공원' },
  { lat: 37.4837, lng: 126.8976, city: '서울-관악', place: '서울대입구역' },
  { lat: 37.6584, lng: 127.0615, city: '서울-노원', place: '노원역' },
  { lat: 37.5950, lng: 127.0850, city: '서울-중랑', place: '상봉역' },
  
  // 경기도 (8개)
  { lat: 37.4138, lng: 127.1264, city: '성남-분당', place: '정자역카페거리' },
  { lat: 37.7418, lng: 127.0467, city: '의정부', place: '의정부역' },
  { lat: 37.6538, lng: 126.8350, city: '고양-일산', place: '라페스타' },
  { lat: 37.3824, lng: 126.9356, city: '안양', place: '평촌중앙공원' },
  { lat: 37.3085, lng: 126.8532, city: '부천', place: '부천역' },
  { lat: 37.0741, lng: 127.0312, city: '평택', place: '평택역' },
  { lat: 37.4449, lng: 126.6986, city: '시흥', place: '시흥시청' },
  { lat: 37.5945, lng: 127.1298, city: '남양주', place: '다산신도시' },
  
  // 부산 (6개)
  { lat: 35.1149, lng: 129.0421, city: '부산-부산진', place: '부전시장' },
  { lat: 35.0984, lng: 129.0323, city: '부산-남구', place: '경성대학교' },
  { lat: 35.2100, lng: 129.0791, city: '부산-동래', place: '동래온천' },
  { lat: 35.1795, lng: 128.9386, city: '부산-사상', place: '사상터미널' },
  { lat: 35.0641, lng: 129.0596, city: '부산-수영', place: '수영역' },
  { lat: 35.2284, lng: 129.2089, city: '부산-기장', place: '기장시장' },
  
  // 대구 (4개)
  { lat: 35.8283, lng: 128.5655, city: '대구-달서', place: '두류공원' },
  { lat: 35.9147, lng: 128.6091, city: '대구-북구', place: '칠성시장' },
  { lat: 35.8852, lng: 128.5641, city: '대구-서구', place: '서대구역' },
  { lat: 35.8560, lng: 128.6355, city: '대구-동구', place: '동대구역' },
  
  // 인천 (4개)
  { lat: 37.4485, lng: 126.4507, city: '인천-중구', place: '인천공항' },
  { lat: 37.5205, lng: 126.6742, city: '인천-미추홀', place: '주안역' },
  { lat: 37.4559, lng: 126.7052, city: '인천-남동', place: '구월동로데오' },
  { lat: 37.5748, lng: 126.6348, city: '인천-서구', place: '청라국제도시' },
  
  // 광주 (3개)
  { lat: 35.1595, lng: 126.8526, city: '광주-서구', place: '광주종합터미널' },
  { lat: 35.1747, lng: 126.9123, city: '광주-북구', place: '전남대학교' },
  { lat: 35.1102, lng: 126.8770, city: '광주-광산', place: '첨단지구' },
  
  // 대전 (3개)
  { lat: 36.3274, lng: 127.4271, city: '대전-유성', place: '유성온천' },
  { lat: 36.3667, lng: 127.3886, city: '대전-중구', place: '대전역' },
  { lat: 36.2908, lng: 127.4544, city: '대전-대덕', place: '대덕연구단지' },
  
  // 울산 (2개)
  { lat: 35.5019, lng: 129.4373, city: '울산-울주', place: '언양읍' },
  { lat: 35.5585, lng: 129.3375, city: '울산-중구', place: '울산시청' },
  
  // 강원도 (3개)
  { lat: 37.7519, lng: 128.8761, city: '강릉', place: '강릉역' },
  { lat: 38.2055, lng: 128.5920, city: '속초', place: '속초해수욕장' },
  { lat: 37.3422, lng: 127.9202, city: '원주', place: '원주역' },
  
  // 충청도 (3개)
  { lat: 36.8065, lng: 127.1522, city: '천안', place: '천안아산역' },
  { lat: 36.6424, lng: 127.4890, city: '청주', place: '청주시청' },
  { lat: 36.3328, lng: 127.4452, city: '세종', place: '세종정부청사' },
  
  // 전라도 (3개)
  { lat: 34.9513, lng: 127.4875, city: '순천', place: '순천역' },
  { lat: 34.8118, lng: 126.3922, city: '목포', place: '목포역' },
  { lat: 35.9674, lng: 126.7369, city: '익산', place: '익산역' },
  
  // 경상도 (3개)
  { lat: 35.8380, lng: 129.2132, city: '포항', place: '포항역' },
  { lat: 35.1923, lng: 128.6848, city: '창원', place: '창원중앙역' },
  { lat: 35.2271, lng: 128.6811, city: '김해', place: '김해공항' }
];

// 다양한 메시지들 (50개)
const diverseMessages = [
  // 일상 공유 (10개)
  {
    title: "오늘 날씨 정말 좋네요",
    content: "산책하기 딱 좋은 날씨예요. 모두 좋은 하루!",
    tags: ['일상', '날씨', '산책']
  },
  {
    title: "첫 출근 성공!",
    content: "새로운 시작이에요. 응원 부탁드려요!",
    tags: ['일상', '직장', '시작']
  },
  {
    title: "금요일이다!",
    content: "한 주 고생하셨어요. 주말 잘 보내세요!",
    tags: ['일상', '금요일', '주말']
  },
  {
    title: "비 오는 날 감성",
    content: "빗소리 들으며 커피 한 잔, 최고예요",
    tags: ['일상', '비', '커피']
  },
  {
    title: "벚꽃이 피었어요",
    content: "봄이 왔나봐요. 꽃구경 가실 분?",
    tags: ['일상', '봄', '벚꽃']
  },
  {
    title: "월요병 극복!",
    content: "월요일도 화이팅! 이번 주도 잘 보내요",
    tags: ['일상', '월요일', '응원']
  },
  {
    title: "퇴근시간이다!",
    content: "오늘도 수고 많으셨어요. 집에 조심히 가세요",
    tags: ['일상', '퇴근', '수고']
  },
  {
    title: "점심 뭐 먹지?",
    content: "매일 고민되는 점심 메뉴... 추천 받아요!",
    tags: ['일상', '점심', '고민']
  },
  {
    title: "주말 나들이",
    content: "날씨 좋은 주말, 어디로 놀러가시나요?",
    tags: ['일상', '주말', '나들이']
  },
  {
    title: "새벽 감성",
    content: "잠이 안 와서 산책 중... 별이 예뻐요",
    tags: ['일상', '새벽', '산책']
  },
  
  // 응원 메시지 (10개)
  {
    title: "시험 보시는 분들 화이팅!",
    content: "준비한 만큼 잘 될 거예요. 응원합니다!",
    tags: ['응원', '시험', '격려']
  },
  {
    title: "힘든 하루였나요?",
    content: "내일은 분명 더 좋은 날이 될 거예요",
    tags: ['응원', '위로', '희망']
  },
  {
    title: "당신은 소중한 사람",
    content: "오늘도 최선을 다한 당신, 정말 멋져요!",
    tags: ['응원', '격려', '칭찬']
  },
  {
    title: "포기하지 마세요",
    content: "조금만 더 힘내요. 곧 좋은 일이 생길 거예요",
    tags: ['응원', '격려', '희망']
  },
  {
    title: "취준생 여러분 파이팅!",
    content: "준비하는 모든 분들 좋은 결과 있기를!",
    tags: ['응원', '취업', '격려']
  },
  {
    title: "건강이 최고예요",
    content: "무리하지 마시고 건강 챙기세요!",
    tags: ['응원', '건강', '걱정']
  },
  {
    title: "당신의 꿈을 응원해요",
    content: "꿈을 향해 달려가는 모습이 아름다워요",
    tags: ['응원', '꿈', '격려']
  },
  {
    title: "실패해도 괜찮아요",
    content: "실패는 성공의 어머니! 다시 도전해요",
    tags: ['응원', '위로', '격려']
  },
  {
    title: "혼자가 아니에요",
    content: "힘들 때 주변을 둘러보세요. 응원하는 사람들이 있어요",
    tags: ['응원', '위로', '함께']
  },
  {
    title: "오늘도 고생했어요",
    content: "하루를 마무리하는 당신께 박수를!",
    tags: ['응원', '수고', '칭찬']
  },
  
  // 질문/궁금증 (10개)
  {
    title: "이 근처 맛집 아시나요?",
    content: "처음 와봤는데 맛집 추천 부탁드려요!",
    tags: ['질문', '맛집', '추천']
  },
  {
    title: "여기 와이파이 비번?",
    content: "카페 와이파이 비번 아시는 분 계신가요?",
    tags: ['질문', '와이파이', '카페']
  },
  {
    title: "버스 언제 오나요?",
    content: "버스 앱이 안 돼서... 곧 오나요?",
    tags: ['질문', '버스', '교통']
  },
  {
    title: "운동 같이 하실 분?",
    content: "혼자 하기 심심한데 운동 메이트 구해요",
    tags: ['질문', '운동', '함께']
  },
  {
    title: "공부 모임 있나요?",
    content: "같이 공부할 스터디 그룹 찾고 있어요",
    tags: ['질문', '공부', '모임']
  },
  {
    title: "산책로 추천해주세요",
    content: "조용하고 예쁜 산책로 있을까요?",
    tags: ['질문', '산책', '추천']
  },
  {
    title: "주차 가능한가요?",
    content: "이 근처 주차하기 편한 곳 있나요?",
    tags: ['질문', '주차', '정보']
  },
  {
    title: "24시간 카페 있나요?",
    content: "밤늦게까지 공부할 곳 찾고 있어요",
    tags: ['질문', '카페', '공부']
  },
  {
    title: "반려동물 동반 가능?",
    content: "강아지랑 갈 수 있는 카페 있을까요?",
    tags: ['질문', '반려동물', '카페']
  },
  {
    title: "사진 찍기 좋은 곳?",
    content: "인스타 감성 사진 찍을 곳 추천해주세요",
    tags: ['질문', '사진', '추천']
  },
  
  // 감사/칭찬 (10개)
  {
    title: "길 알려주셔서 감사해요",
    content: "덕분에 제시간에 도착했어요!",
    tags: ['감사', '도움', '길']
  },
  {
    title: "우산 빌려주신 분",
    content: "갑작스런 비에 정말 감사했어요",
    tags: ['감사', '우산', '도움']
  },
  {
    title: "자리 양보 감사합니다",
    content: "다리가 아팠는데 정말 감사했어요",
    tags: ['감사', '양보', '친절']
  },
  {
    title: "떨어뜨린 지갑",
    content: "주워주신 분 정말 감사합니다!",
    tags: ['감사', '지갑', '정직']
  },
  {
    title: "친절한 직원분",
    content: "웃으며 응대해주셔서 기분이 좋았어요",
    tags: ['칭찬', '친절', '서비스']
  },
  {
    title: "청소하시는 분들께",
    content: "항상 깨끗하게 해주셔서 감사해요",
    tags: ['감사', '청소', '수고']
  },
  {
    title: "배달 라이더님",
    content: "비 오는데도 안전운전 감사해요!",
    tags: ['감사', '배달', '안전']
  },
  {
    title: "편의점 알바생",
    content: "늦은 시간에도 친절하게 대해주셔서 감사해요",
    tags: ['감사', '편의점', '친절']
  },
  {
    title: "버스 기사님",
    content: "안전운전 항상 감사합니다",
    tags: ['감사', '버스', '안전']
  },
  {
    title: "경비 아저씨",
    content: "항상 인사해주셔서 감사해요",
    tags: ['감사', '경비', '인사']
  },
  
  // 추억/회상 (10개)
  {
    title: "학창시절이 그립네요",
    content: "교복 입고 다니던 때가 그리워요",
    tags: ['추억', '학교', '그리움']
  },
  {
    title: "첫사랑 생각나는 날",
    content: "이 계절이 되면 떠오르는 사람이 있어요",
    tags: ['추억', '첫사랑', '계절']
  },
  {
    title: "어릴 적 동네",
    content: "여기 와보니 어릴 때 살던 동네 생각나요",
    tags: ['추억', '어린시절', '동네']
  },
  {
    title: "할머니가 보고싶어요",
    content: "할머니가 해주신 음식이 그리워요",
    tags: ['추억', '가족', '그리움']
  },
  {
    title: "군대 생각나네",
    content: "이맘때쯤 전역했었는데... 시간 참 빨라요",
    tags: ['추억', '군대', '시간']
  },
  {
    title: "대학 MT 추억",
    content: "친구들이랑 MT 갔던 게 엊그제 같은데",
    tags: ['추억', '대학', '친구']
  },
  {
    title: "첫 직장 생각나요",
    content: "신입사원 때가 그립기도 하네요",
    tags: ['추억', '직장', '신입']
  },
  {
    title: "여행 가고 싶다",
    content: "작년 이맘때 여행 갔었는데...",
    tags: ['추억', '여행', '그리움']
  },
  {
    title: "옛날 노래 듣는 중",
    content: "이 노래 들으면 그때 생각나요",
    tags: ['추억', '음악', '과거']
  },
  {
    title: "시간이 빠르네요",
    content: "벌써 이렇게 시간이 지났다니...",
    tags: ['추억', '시간', '감상']
  }
];

// 계정 생성 또는 로그인
async function createOrLoginAccount() {
  try {
    console.log('🔐 계정 생성 시도 중...');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: ANONYMOUS_ACCOUNT.email,
        password: ANONYMOUS_ACCOUNT.password,
        username: ANONYMOUS_ACCOUNT.username
      });
      console.log(`✅ 계정 생성 성공: ${ANONYMOUS_ACCOUNT.username}`);
      return registerResponse.data.data.accessToken;
    } catch (error) {
      if (error.response?.status === 409) {
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
  
  console.log('\n📍 전국 각지에 다양한 시그널스팟 생성 시작...\n');
  console.log('⚠️  Rate limiting (분당 5개) 대응을 위해 배치 처리합니다.\n');
  
  let successCount = 0;
  let failCount = 0;
  let dailyLimitReached = false;
  
  // 위치와 메시지를 랜덤하게 매칭
  const shuffledMessages = [...diverseMessages].sort(() => Math.random() - 0.5);
  const selectedLocations = koreaLocations.sort(() => Math.random() - 0.5).slice(0, 20);
  
  const spotsToCreate = selectedLocations.map((location, index) => ({
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
    if (dailyLimitReached) break;
    
    const batch = batches[batchIndex];
    
    if (batchIndex > 0) {
      console.log(`\n⏳ Rate limit 대기 중... (1분)`);
      await delay(60000);
    }
    
    console.log(`\n📦 배치 ${batchIndex + 1}/${batches.length} 처리 중...\n`);
    
    for (const { location, message } of batch) {
      try {
        const spotData = {
          content: message.content,
          title: message.title,
          latitude: location.lat,
          longitude: location.lng,
          radiusInMeters: Math.floor(100 + Math.random() * 400), // 100-500m
          durationHours: Math.floor(12 + Math.random() * 156), // 12-168시간 (0.5-7일)
          tags: message.tags
        };
        
        const response = await axios.post(
          `${API_BASE_URL}/signal-spots`,
          spotData,
          { headers }
        );
        
        if (response.data.success) {
          successCount++;
          console.log(`  ✅ [${location.city}] "${message.title}"`);
        } else {
          failCount++;
          console.log(`  ❌ [${location.city}] 생성 실패`);
        }
        
        await delay(1500); // 요청 간 1.5초 대기
        
      } catch (error) {
        if (error.response?.status === 429) {
          console.log(`  ⏳ Rate limit 도달. 1분 대기 후 재시도...`);
          await delay(60000);
          // 재시도
          try {
            const response = await axios.post(
              `${API_BASE_URL}/signal-spots`,
              spotData,
              { headers }
            );
            if (response.data.success) {
              successCount++;
              console.log(`  ✅ [재시도] [${location.city}] "${message.title}"`);
            }
          } catch (retryError) {
            failCount++;
            console.log(`  ❌ [재시도 실패] [${location.city}]`);
          }
        } else if (error.response?.data?.error?.message?.includes('Daily spot creation limit')) {
          console.log(`\n⚠️  일일 생성 제한 도달 (20개/일)`);
          dailyLimitReached = true;
          break;
        } else {
          failCount++;
          console.log(`  ❌ [${location.city}] 오류:`, error.response?.data?.error?.message || error.message);
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
  
  try {
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
    
    const spots = response.data.data || [];
    console.log(`📊 총 ${spots.length}개의 시그널스팟 발견\n`);
    
    // 메시지 타입별 분류
    const messageTypes = {
      '일상': [],
      '응원': [],
      '질문': [],
      '감사': [],
      '추억': [],
      '기타': []
    };
    
    spots.forEach(spot => {
      let categorized = false;
      for (const type of Object.keys(messageTypes)) {
        if (spot.tags && spot.tags.some(tag => tag.includes(type))) {
          messageTypes[type].push(spot.title);
          categorized = true;
          break;
        }
      }
      if (!categorized) {
        messageTypes['기타'].push(spot.title);
      }
    });
    
    // 타입별 출력
    console.log('📝 메시지 타입별 분류:');
    Object.entries(messageTypes).forEach(([type, titles]) => {
      if (titles.length > 0) {
        console.log(`\n  ${type}: ${titles.length}개`);
        titles.slice(0, 3).forEach(title => {
          console.log(`    - "${title}"`);
        });
      }
    });
  } catch (error) {
    console.log('❌ 결과 확인 실패:', error.response?.data?.error?.message || error.message);
  }
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
    console.log('🚀 전국 다양한 시그널스팟 생성 스크립트\n');
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