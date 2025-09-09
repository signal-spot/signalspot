const axios = require('axios');

const API_BASE_URL = 'https://lettie.co.kr/signalspot/api';

// 익명 계정 정보
const ANONYMOUS_ACCOUNT = {
  email: 'nationwide2025@example.com',
  password: 'Nationwide123!',
  username: '전국여행자'
};

// 전국 구석구석 100개 지역 좌표 (빈 곳 없이)
const koreaLocations = [
  // 서울/수도권 (15개)
  { lat: 37.5172, lng: 127.0473, city: '서울-잠실', place: '롯데월드타워' },
  { lat: 37.5796, lng: 126.9770, city: '서울-종로', place: '인사동' },
  { lat: 37.5443, lng: 127.0557, city: '서울-성수', place: '성수동' },
  { lat: 37.4979, lng: 127.0276, city: '서울-강남', place: '강남역' },
  { lat: 37.5571, lng: 126.9240, city: '서울-홍대', place: '홍대입구' },
  { lat: 37.6584, lng: 127.0615, city: '서울-노원', place: '노원역' },
  { lat: 37.4837, lng: 126.8976, city: '서울-관악', place: '서울대입구' },
  { lat: 37.3220, lng: 127.1268, city: '성남-분당', place: '정자역' },
  { lat: 37.6538, lng: 126.8350, city: '고양-일산', place: '라페스타' },
  { lat: 37.2636, lng: 127.0286, city: '수원', place: '수원역' },
  { lat: 37.3824, lng: 126.9356, city: '안양', place: '평촌' },
  { lat: 37.3085, lng: 126.8532, city: '부천', place: '부천역' },
  { lat: 37.5945, lng: 127.1298, city: '남양주', place: '다산신도시' },
  { lat: 37.7418, lng: 127.0467, city: '의정부', place: '의정부역' },
  { lat: 37.4449, lng: 126.6986, city: '시흥', place: '시흥시청' },
  
  // 경기 남부/외곽 (10개)
  { lat: 37.0741, lng: 127.0312, city: '평택', place: '평택역' },
  { lat: 36.9910, lng: 127.0829, city: '오산', place: '오산역' },
  { lat: 37.3201, lng: 126.8219, city: '안산', place: '중앙역' },
  { lat: 37.2070, lng: 126.8310, city: '화성', place: '동탄신도시' },
  { lat: 37.1433, lng: 127.0690, city: '용인', place: '용인시청' },
  { lat: 37.4363, lng: 127.5509, city: '이천', place: '이천시청' },
  { lat: 37.2987, lng: 127.6379, city: '여주', place: '여주역' },
  { lat: 37.7521, lng: 127.6303, city: '포천', place: '포천시청' },
  { lat: 37.8983, lng: 127.2007, city: '파주', place: '파주시청' },
  { lat: 37.8713, lng: 127.7451, city: '가평', place: '가평역' },
  
  // 강원도 (15개)
  { lat: 37.7519, lng: 128.8761, city: '강릉', place: '강릉역' },
  { lat: 38.2055, lng: 128.5920, city: '속초', place: '속초해수욕장' },
  { lat: 37.3422, lng: 127.9202, city: '원주', place: '원주역' },
  { lat: 37.8813, lng: 127.7298, city: '춘천', place: '춘천역' },
  { lat: 37.4848, lng: 129.1285, city: '동해', place: '동해역' },
  { lat: 37.1790, lng: 128.4671, city: '태백', place: '태백역' },
  { lat: 37.3274, lng: 128.5569, city: '삼척', place: '삼척역' },
  { lat: 38.0792, lng: 128.6298, city: '양양', place: '양양시외버스터미널' },
  { lat: 37.7393, lng: 128.3026, city: '홍천', place: '홍천터미널' },
  { lat: 37.8070, lng: 128.1550, city: '횡성', place: '횡성시외버스터미널' },
  { lat: 37.2196, lng: 127.6515, city: '평창', place: '평창역' },
  { lat: 37.4973, lng: 128.3931, city: '정선', place: '정선터미널' },
  { lat: 37.3815, lng: 128.6738, city: '영월', place: '영월역' },
  { lat: 38.3792, lng: 128.4668, city: '고성', place: '고성터미널' },
  { lat: 38.1075, lng: 127.3065, city: '인제', place: '인제터미널' },
  
  // 충청북도 (10개)
  { lat: 36.6424, lng: 127.4890, city: '청주', place: '청주시청' },
  { lat: 36.9910, lng: 127.9259, city: '충주', place: '충주역' },
  { lat: 36.8065, lng: 127.6601, city: '제천', place: '제천역' },
  { lat: 36.5854, lng: 127.2994, city: '청원', place: '청원구청' },
  { lat: 37.1316, lng: 127.4897, city: '음성', place: '음성터미널' },
  { lat: 36.9817, lng: 127.7035, city: '진천', place: '진천터미널' },
  { lat: 36.7698, lng: 127.2821, city: '증평', place: '증평역' },
  { lat: 36.8935, lng: 127.9173, city: '괴산', place: '괴산터미널' },
  { lat: 36.2746, lng: 127.5689, city: '옥천', place: '옥천역' },
  { lat: 36.1816, lng: 127.8007, city: '영동', place: '영동역' },
  
  // 충청남도 (10개)
  { lat: 36.8065, lng: 127.1522, city: '천안', place: '천안아산역' },
  { lat: 36.3328, lng: 127.4452, city: '세종', place: '세종정부청사' },
  { lat: 36.3504, lng: 127.3845, city: '대전', place: '대전시청' },
  { lat: 36.7745, lng: 126.4502, city: '아산', place: '아산시청' },
  { lat: 36.5184, lng: 126.8003, city: '공주', place: '공주역' },
  { lat: 36.4567, lng: 127.1195, city: '논산', place: '논산역' },
  { lat: 36.2753, lng: 126.9088, city: '부여', place: '부여터미널' },
  { lat: 36.7832, lng: 126.9453, city: '서산', place: '서산터미널' },
  { lat: 36.5933, lng: 126.6127, city: '보령', place: '보령역' },
  { lat: 36.0743, lng: 126.5523, city: '서천', place: '서천터미널' },
  
  // 경상북도 (15개) - 영주, 문경 등 포함
  { lat: 36.8050, lng: 128.6245, city: '영주', place: '영주역' },
  { lat: 36.5862, lng: 128.1869, city: '문경', place: '문경역' },
  { lat: 36.5681, lng: 128.7296, city: '안동', place: '안동역' },
  { lat: 35.8380, lng: 129.2132, city: '포항', place: '포항역' },
  { lat: 35.8869, lng: 128.6010, city: '경주', place: '경주역' },
  { lat: 36.9919, lng: 128.3985, city: '예천', place: '예천터미널' },
  { lat: 36.4014, lng: 128.3927, city: '상주', place: '상주터미널' },
  { lat: 36.4320, lng: 128.6792, city: '의성', place: '의성터미널' },
  { lat: 36.4103, lng: 129.3653, city: '영덕', place: '영덕터미널' },
  { lat: 36.2839, lng: 129.3172, city: '청송', place: '청송터미널' },
  { lat: 36.0194, lng: 129.3432, city: '영천', place: '영천역' },
  { lat: 35.9731, lng: 128.9381, city: '경산', place: '경산역' },
  { lat: 35.8189, lng: 128.5275, city: '청도', place: '청도역' },
  { lat: 36.1071, lng: 128.3390, city: '김천', place: '김천역' },
  { lat: 36.9748, lng: 128.9397, city: '봉화', place: '봉화터미널' },
  
  // 경상남도 (15개) - 거창 등 포함
  { lat: 35.6868, lng: 127.9095, city: '거창', place: '거창터미널' },
  { lat: 35.5419, lng: 127.7303, city: '함양', place: '함양터미널' },
  { lat: 35.4259, lng: 127.8762, city: '산청', place: '산청터미널' },
  { lat: 35.1923, lng: 128.6848, city: '창원', place: '창원중앙역' },
  { lat: 35.2271, lng: 128.6811, city: '김해', place: '김해공항' },
  { lat: 35.1795, lng: 128.0982, city: '진주', place: '진주역' },
  { lat: 34.8380, lng: 128.4234, city: '통영', place: '통영터미널' },
  { lat: 34.7604, lng: 127.6622, city: '사천', place: '사천터미널' },
  { lat: 35.3229, lng: 128.2608, city: '의령', place: '의령터미널' },
  { lat: 35.2718, lng: 128.4582, city: '함안', place: '함안터미널' },
  { lat: 35.5036, lng: 128.7462, city: '창녕', place: '창녕터미널' },
  { lat: 35.3285, lng: 129.0364, city: '양산', place: '양산역' },
  { lat: 35.4919, lng: 128.4382, city: '합천', place: '합천터미널' },
  { lat: 34.8806, lng: 128.0680, city: '고성', place: '고성터미널' },
  { lat: 35.0677, lng: 127.7515, city: '하동', place: '하동터미널' },
  
  // 전라북도 (10개)
  { lat: 35.8242, lng: 127.1480, city: '전주', place: '전주한옥마을' },
  { lat: 35.9674, lng: 126.7369, city: '익산', place: '익산역' },
  { lat: 35.7175, lng: 127.1530, city: '완주', place: '완주터미널' },
  { lat: 35.8015, lng: 126.8808, city: '군산', place: '군산역' },
  { lat: 35.9481, lng: 127.1297, city: '김제', place: '김제터미널' },
  { lat: 35.6161, lng: 127.4409, city: '남원', place: '남원역' },
  { lat: 35.8035, lng: 127.6574, city: '무주', place: '무주터미널' },
  { lat: 35.6504, lng: 127.9086, city: '장수', place: '장수터미널' },
  { lat: 35.9095, lng: 127.7456, city: '진안', place: '진안터미널' },
  { lat: 35.5705, lng: 126.8564, city: '정읍', place: '정읍역' },
  
  // 전라남도 (10개)
  { lat: 35.1595, lng: 126.8526, city: '광주', place: '광주터미널' },
  { lat: 34.8118, lng: 126.3922, city: '목포', place: '목포역' },
  { lat: 34.9513, lng: 127.4875, city: '순천', place: '순천역' },
  { lat: 34.7604, lng: 127.6622, city: '여수', place: '여수엑스포역' },
  { lat: 35.3213, lng: 126.9889, city: '나주', place: '나주역' },
  { lat: 35.0747, lng: 126.7118, city: '무안', place: '무안공항' },
  { lat: 34.5731, lng: 126.5985, city: '해남', place: '해남터미널' },
  { lat: 34.5948, lng: 127.2816, city: '고흥', place: '고흥터미널' },
  { lat: 35.2605, lng: 127.2463, city: '구례', place: '구례터미널' },
  { lat: 35.0149, lng: 127.0588, city: '보성', place: '보성터미널' },
  
  // 제주도 (10개)
  { lat: 33.4890, lng: 126.4983, city: '제주시', place: '제주공항' },
  { lat: 33.2541, lng: 126.5601, city: '서귀포', place: '서귀포시청' },
  { lat: 33.4612, lng: 126.5603, city: '제주-중문', place: '중문관광단지' },
  { lat: 33.5178, lng: 126.5219, city: '제주-시청', place: '제주시청' },
  { lat: 33.3859, lng: 126.8504, city: '제주-애월', place: '애월읍' },
  { lat: 33.4256, lng: 126.4258, city: '제주-한림', place: '한림읍' },
  { lat: 33.3589, lng: 126.1942, city: '제주-한경', place: '한경면' },
  { lat: 33.4852, lng: 126.9525, city: '제주-조천', place: '조천읍' },
  { lat: 33.2772, lng: 126.3695, city: '서귀포-안덕', place: '안덕면' },
  { lat: 33.2348, lng: 126.6158, city: '서귀포-남원', place: '남원읍' }
];

// 다양한 메시지들 (100개)
const diverseMessages = [
  // 지역 특색 메시지 (20개)
  {
    title: "영주 부석사 다녀왔어요",
    content: "부석사 무량수전이 정말 아름답네요. 천년의 역사가 느껴져요.",
    tags: ['여행', '영주', '문화재']
  },
  {
    title: "거창 수승대 산책",
    content: "계곡물 소리 들으며 걷기 좋아요. 힐링되네요.",
    tags: ['자연', '거창', '힐링']
  },
  {
    title: "문경새재 넘어왔어요",
    content: "옛날 선비들도 이 길을 걸었겠죠? 감회가 새롭네요.",
    tags: ['역사', '문경', '산책']
  },
  {
    title: "안동 하회마을",
    content: "한국의 전통이 살아있는 곳이에요. 강추합니다!",
    tags: ['전통', '안동', '관광']
  },
  {
    title: "속초 대포항 회",
    content: "싱싱한 회 한 접시! 속초 오면 꼭 드세요.",
    tags: ['맛집', '속초', '회']
  },
  {
    title: "춘천 닭갈비 맛집",
    content: "춘천하면 역시 닭갈비죠! 막국수도 최고!",
    tags: ['맛집', '춘천', '닭갈비']
  },
  {
    title: "전주 한옥마을 야경",
    content: "밤에 보는 한옥마을도 정말 예뻐요.",
    tags: ['야경', '전주', '한옥']
  },
  {
    title: "여수 밤바다",
    content: "여수 밤바다~ 노래가 절로 나와요.",
    tags: ['바다', '여수', '야경']
  },
  {
    title: "경주 불국사",
    content: "천년고도 경주의 품격이 느껴집니다.",
    tags: ['문화재', '경주', '불국사']
  },
  {
    title: "제주 한라산 등반",
    content: "백록담까지 올라갔어요! 힘들었지만 뿌듯!",
    tags: ['등산', '제주', '한라산']
  },
  {
    title: "포항 호미곶 일출",
    content: "새해 첫 일출 보러 왔어요. 장관이네요!",
    tags: ['일출', '포항', '호미곶']
  },
  {
    title: "보령 머드축제",
    content: "머드 묻히고 놀았더니 피부가 좋아진 것 같아요!",
    tags: ['축제', '보령', '머드']
  },
  {
    title: "평창 대관령 양떼목장",
    content: "양들이 너무 귀여워요. 아이들이 좋아해요.",
    tags: ['목장', '평창', '양']
  },
  {
    title: "통영 케이블카",
    content: "한려수도 전망이 끝내줘요!",
    tags: ['전망', '통영', '케이블카']
  },
  {
    title: "담양 죽녹원",
    content: "대나무 숲길 걸으니 마음이 편안해져요.",
    tags: ['자연', '담양', '대나무']
  },
  {
    title: "부여 백제문화단지",
    content: "백제의 역사를 느낄 수 있어요. 교육적이네요.",
    tags: ['역사', '부여', '백제']
  },
  {
    title: "강릉 커피거리",
    content: "바다 보며 마시는 커피 한 잔, 최고예요!",
    tags: ['카페', '강릉', '바다']
  },
  {
    title: "군산 경암동 철길",
    content: "레트로 감성 가득한 곳이에요.",
    tags: ['레트로', '군산', '철길']
  },
  {
    title: "남원 광한루",
    content: "춘향전의 무대가 된 곳! 로맨틱해요.",
    tags: ['전통', '남원', '광한루']
  },
  {
    title: "태백 눈꽃축제",
    content: "하얀 눈의 나라! 겨울왕국이 따로 없어요.",
    tags: ['축제', '태백', '눈']
  },
  
  // 일상 메시지 (20개)
  {
    title: "아침 운동 완료",
    content: "오늘도 상쾌한 하루 시작! 다들 화이팅!",
    tags: ['운동', '아침', '일상']
  },
  {
    title: "재택근무 중",
    content: "집에서 일하니 편하긴 한데 집중이 안 돼요.",
    tags: ['재택', '일상', '직장']
  },
  {
    title: "오늘 저녁 뭐 먹지?",
    content: "매일 고민되는 저녁 메뉴... 추천 받아요!",
    tags: ['일상', '저녁', '고민']
  },
  {
    title: "드디어 주말!",
    content: "일주일 기다린 주말! 다들 뭐하시나요?",
    tags: ['주말', '일상', '휴식']
  },
  {
    title: "장보기 완료",
    content: "마트 세일하네요! 득템했어요.",
    tags: ['일상', '장보기', '마트']
  },
  {
    title: "청소하는 날",
    content: "대청소 끝! 깨끗해진 집 보니 기분 좋아요.",
    tags: ['일상', '청소', '집']
  },
  {
    title: "넷플릭스 정주행",
    content: "주말엔 역시 넷플! 추천작 있나요?",
    tags: ['일상', '넷플릭스', '주말']
  },
  {
    title: "홈카페 오픈",
    content: "집에서 만든 달고나 커피! 카페 안 부럽네요.",
    tags: ['일상', '커피', '홈카페']
  },
  {
    title: "반려견 산책",
    content: "강아지랑 산책 중! 날씨가 좋아서 기분도 좋아요.",
    tags: ['일상', '반려견', '산책']
  },
  {
    title: "요리 도전!",
    content: "유튜브 보고 파스타 만들었는데 성공!",
    tags: ['일상', '요리', '도전']
  },
  {
    title: "독서 시간",
    content: "오랜만에 책 한 권 완독! 뿌듯해요.",
    tags: ['일상', '독서', '취미']
  },
  {
    title: "홈트레이닝",
    content: "헬스장 못 가서 집에서 운동 중! 효과 있을까요?",
    tags: ['일상', '운동', '홈트']
  },
  {
    title: "화분 가꾸기",
    content: "베란다 정원 만들기 프로젝트! 식물들이 잘 자라네요.",
    tags: ['일상', '식물', '취미']
  },
  {
    title: "일기 쓰기",
    content: "하루를 정리하는 시간. 일기 쓰는 습관 들이는 중!",
    tags: ['일상', '일기', '습관']
  },
  {
    title: "미용실 다녀왔어요",
    content: "머리 자르고 나니 기분전환 되네요!",
    tags: ['일상', '미용실', '변화']
  },
  {
    title: "카공족",
    content: "카페에서 공부 중! 집중 잘 돼요.",
    tags: ['일상', '공부', '카페']
  },
  {
    title: "야식 참기",
    content: "다이어트 중인데 야식 유혹이... 참아야지!",
    tags: ['일상', '다이어트', '야식']
  },
  {
    title: "새벽 감성",
    content: "잠이 안 와서 음악 듣는 중. 새벽 감성 최고.",
    tags: ['일상', '새벽', '음악']
  },
  {
    title: "빨래하는 날",
    content: "날씨 좋아서 이불빨래! 뽀송뽀송해요.",
    tags: ['일상', '빨래', '집안일']
  },
  {
    title: "택배 왔어요",
    content: "기다리던 택배 도착! 언박싱의 즐거움!",
    tags: ['일상', '택배', '기대']
  },
  
  // 응원/격려 (20개)
  {
    title: "수험생 응원합니다",
    content: "시험 준비하는 모든 분들! 좋은 결과 있기를!",
    tags: ['응원', '수험생', '격려']
  },
  {
    title: "다이어터 화이팅",
    content: "다이어트 중이신 분들! 포기하지 마세요!",
    tags: ['응원', '다이어트', '격려']
  },
  {
    title: "신입사원 응원",
    content: "새로운 시작! 모든 신입분들 화이팅!",
    tags: ['응원', '신입', '직장']
  },
  {
    title: "창업 준비생 화이팅",
    content: "도전하는 당신이 멋져요! 성공하실 거예요!",
    tags: ['응원', '창업', '도전']
  },
  {
    title: "운동 시작하신 분들",
    content: "작심삼일 NO! 꾸준히 하면 변화가 와요!",
    tags: ['응원', '운동', '동기부여']
  },
  {
    title: "금연 도전!",
    content: "금연 중이신 분들! 할 수 있어요!",
    tags: ['응원', '금연', '건강']
  },
  {
    title: "우울한 날",
    content: "힘든 날도 있어요. 내일은 더 나은 날!",
    tags: ['위로', '응원', '격려']
  },
  {
    title: "실패해도 괜찮아",
    content: "실패는 성장의 과정! 다시 일어서요!",
    tags: ['응원', '위로', '격려']
  },
  {
    title: "외로운 분들께",
    content: "혼자가 아니에요. 모두가 응원해요!",
    tags: ['위로', '응원', '함께']
  },
  {
    title: "야근하는 분들",
    content: "늦게까지 고생이 많으세요. 힘내세요!",
    tags: ['응원', '야근', '격려']
  },
  {
    title: "아픈 분들 쾌유 기원",
    content: "빨리 나으시길 바라요. 건강이 최고!",
    tags: ['응원', '건강', '쾌유']
  },
  {
    title: "이별의 아픔",
    content: "시간이 약이에요. 더 좋은 사람 만날 거예요.",
    tags: ['위로', '이별', '응원']
  },
  {
    title: "취업준비생 파이팅",
    content: "포기하지 마세요! 곧 좋은 소식 있을 거예요!",
    tags: ['응원', '취업', '격려']
  },
  {
    title: "육아맘 응원",
    content: "육아 정말 힘드시죠? 대단하세요!",
    tags: ['응원', '육아', '격려']
  },
  {
    title: "장거리 연애",
    content: "떨어져 있어도 마음은 가까이! 화이팅!",
    tags: ['응원', '연애', '격려']
  },
  {
    title: "재수생 응원",
    content: "한 번 더 도전하는 용기! 응원해요!",
    tags: ['응원', '재수', '격려']
  },
  {
    title: "프리랜서 화이팅",
    content: "불안정해도 자유로운 삶! 멋져요!",
    tags: ['응원', '프리랜서', '격려']
  },
  {
    title: "코딩 공부 중",
    content: "개발자 꿈꾸는 분들! 할 수 있어요!",
    tags: ['응원', '코딩', '공부']
  },
  {
    title: "편입 준비생",
    content: "새로운 도전! 좋은 결과 있기를!",
    tags: ['응원', '편입', '격려']
  },
  {
    title: "자격증 공부",
    content: "자기계발 하시는 분들! 멋져요!",
    tags: ['응원', '자격증', '공부']
  },
  
  // 계절/날씨 (20개)
  {
    title: "봄이 왔어요",
    content: "꽃이 피기 시작했네요. 봄 나들이 가요!",
    tags: ['봄', '계절', '꽃']
  },
  {
    title: "여름 더위",
    content: "너무 더워요! 다들 더위 조심하세요!",
    tags: ['여름', '더위', '날씨']
  },
  {
    title: "가을 단풍",
    content: "단풍이 정말 예뻐요. 등산 가기 좋은 날!",
    tags: ['가을', '단풍', '등산']
  },
  {
    title: "첫눈이 왔어요",
    content: "올해 첫눈! 로맨틱하네요.",
    tags: ['겨울', '눈', '낭만']
  },
  {
    title: "장마철",
    content: "비가 계속 오네요. 우산 꼭 챙기세요!",
    tags: ['장마', '비', '날씨']
  },
  {
    title: "태풍 조심",
    content: "태풍 온다고 하네요. 모두 안전하게!",
    tags: ['태풍', '날씨', '안전']
  },
  {
    title: "미세먼지 나쁨",
    content: "오늘 미세먼지 심해요. 마스크 필수!",
    tags: ['미세먼지', '날씨', '건강']
  },
  {
    title: "화창한 날씨",
    content: "날씨가 너무 좋아요! 나들이 가요!",
    tags: ['날씨', '맑음', '나들이']
  },
  {
    title: "추운 아침",
    content: "갑자기 추워졌어요. 감기 조심!",
    tags: ['추위', '아침', '건강']
  },
  {
    title: "황사 주의",
    content: "황사가 심하네요. 외출 자제하세요!",
    tags: ['황사', '날씨', '주의']
  },
  {
    title: "무더위 시작",
    content: "벌써 더워지네요. 여름 준비해야겠어요.",
    tags: ['여름', '더위', '준비']
  },
  {
    title: "선선한 저녁",
    content: "저녁 바람이 시원해요. 산책 어때요?",
    tags: ['저녁', '선선', '산책']
  },
  {
    title: "일교차 조심",
    content: "낮과 밤 온도차가 커요. 옷 챙기세요!",
    tags: ['일교차', '날씨', '건강']
  },
  {
    title: "폭염 경보",
    content: "너무 더워요! 물 많이 드세요!",
    tags: ['폭염', '여름', '건강']
  },
  {
    title: "한파 주의",
    content: "영하 10도! 따뜻하게 입으세요!",
    tags: ['한파', '겨울', '추위']
  },
  {
    title: "벚꽃 개화",
    content: "벚꽃이 피기 시작했어요! 꽃구경 가요!",
    tags: ['벚꽃', '봄', '꽃구경']
  },
  {
    title: "단풍 절정",
    content: "단풍이 절정이래요! 주말에 산 가요!",
    tags: ['단풍', '가을', '산']
  },
  {
    title: "서리 내림",
    content: "첫서리가 내렸어요. 겨울이 오나봐요.",
    tags: ['서리', '겨울', '계절']
  },
  {
    title: "무지개 떴어요",
    content: "비 온 후 무지개! 행운이 올 것 같아요!",
    tags: ['무지개', '비', '행운']
  },
  {
    title: "안개 자욱",
    content: "안개가 자욱해요. 운전 조심하세요!",
    tags: ['안개', '날씨', '주의']
  },
  
  // 음식/맛집 (20개)
  {
    title: "떡볶이 먹고싶다",
    content: "갑자기 떡볶이가 당겨요. 어디가 맛있나요?",
    tags: ['음식', '떡볶이', '맛집']
  },
  {
    title: "치킨 먹는 날",
    content: "오늘은 치킨이다! 맥주도 한 잔!",
    tags: ['음식', '치킨', '맥주']
  },
  {
    title: "삼겹살 파티",
    content: "고기 구워먹는 중! 소주 한 잔 어때요?",
    tags: ['음식', '삼겹살', '회식']
  },
  {
    title: "라면 끓여먹기",
    content: "밤에 먹는 라면은 왜 이렇게 맛있을까요?",
    tags: ['음식', '라면', '야식']
  },
  {
    title: "김밥천국",
    content: "김밥 한 줄이면 든든! 가성비 최고!",
    tags: ['음식', '김밥', '가성비']
  },
  {
    title: "커피 한 잔",
    content: "아침엔 역시 커피! 오늘도 카페인 충전!",
    tags: ['음식', '커피', '아침']
  },
  {
    title: "초밥 먹고싶어",
    content: "연어초밥이 먹고싶은 날! 초밥집 추천해주세요!",
    tags: ['음식', '초밥', '일식']
  },
  {
    title: "파스타 맛집",
    content: "크림파스타 최고! 이 근처 맛집 아시나요?",
    tags: ['음식', '파스타', '양식']
  },
  {
    title: "국밥 한 그릇",
    content: "추운 날엔 뜨끈한 국밥! 속이 든든해요.",
    tags: ['음식', '국밥', '한식']
  },
  {
    title: "빵 맛집 발견",
    content: "크로와상이 정말 맛있는 빵집 찾았어요!",
    tags: ['음식', '빵', '베이커리']
  },
  {
    title: "짜장면 vs 짬뽕",
    content: "오늘은 뭘 먹지? 영원한 고민!",
    tags: ['음식', '중식', '고민']
  },
  {
    title: "분식 사랑",
    content: "떡볶이, 순대, 튀김! 분식 조합 최고!",
    tags: ['음식', '분식', '간식']
  },
  {
    title: "피자 먹는 날",
    content: "피자 한 판 시켰어요! 콜라는 필수!",
    tags: ['음식', '피자', '배달']
  },
  {
    title: "샐러드로 다이어트",
    content: "건강한 한 끼! 샐러드도 맛있어요!",
    tags: ['음식', '샐러드', '다이어트']
  },
  {
    title: "마라탕 중독",
    content: "마라탕이 자꾸 생각나요. 중독인가봐요!",
    tags: ['음식', '마라탕', '중식']
  },
  {
    title: "디저트 카페",
    content: "케이크 맛있는 카페 발견! 분위기도 좋아요!",
    tags: ['음식', '디저트', '카페']
  },
  {
    title: "족발 먹방",
    content: "족발에 소주! 최고의 조합!",
    tags: ['음식', '족발', '술']
  },
  {
    title: "아이스크림",
    content: "더운 날엔 아이스크림! 무슨 맛 좋아하세요?",
    tags: ['음식', '아이스크림', '디저트']
  },
  {
    title: "브런치 카페",
    content: "늦은 아침 브런치! 여유로운 주말!",
    tags: ['음식', '브런치', '카페']
  },
  {
    title: "한정식 코스",
    content: "부모님 모시고 한정식! 정성 가득해요!",
    tags: ['음식', '한정식', '가족']
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
  
  console.log('\n📍 전국 구석구석 시그널스팟 생성 시작...\n');
  console.log('🗺️  영주, 거창 등 빈 지역도 채웁니다!\n');
  console.log('⚠️  Rate limiting (분당 5개) 대응을 위해 배치 처리합니다.\n');
  
  let successCount = 0;
  let failCount = 0;
  let dailyLimitReached = false;
  
  // 20개 랜덤 선택 (영주, 거창 지역 우선 포함)
  const priorityLocations = koreaLocations.filter(loc => 
    loc.city.includes('영주') || loc.city.includes('거창') || 
    loc.city.includes('문경') || loc.city.includes('함양') ||
    loc.city.includes('산청') || loc.city.includes('합천')
  );
  
  const otherLocations = koreaLocations.filter(loc => 
    !priorityLocations.includes(loc)
  ).sort(() => Math.random() - 0.5);
  
  // 우선 지역 + 나머지 랜덤 = 총 20개
  const selectedLocations = [
    ...priorityLocations,
    ...otherLocations.slice(0, 20 - priorityLocations.length)
  ];
  
  // 메시지도 랜덤 선택
  const shuffledMessages = [...diverseMessages].sort(() => Math.random() - 0.5).slice(0, 20);
  
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
          radiusInMeters: Math.floor(200 + Math.random() * 800), // 200-1000m
          durationHours: Math.floor(24 + Math.random() * 144), // 24-168시간
          tags: message.tags
        };
        
        const response = await axios.post(
          `${API_BASE_URL}/signal-spots`,
          spotData,
          { headers }
        );
        
        if (response.data.success) {
          successCount++;
          console.log(`  ✅ [${location.city} - ${location.place}] "${message.title}"`);
        } else {
          failCount++;
          console.log(`  ❌ [${location.city}] 생성 실패`);
        }
        
        await delay(1500); // 요청 간 1.5초 대기
        
      } catch (error) {
        if (error.response?.status === 429) {
          console.log(`  ⏳ Rate limit 도달. 1분 대기...`);
          await delay(60000);
          // 재시도 생략 (다음 배치로)
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
    // 여러 지역 중심으로 검색
    const searchPoints = [
      { name: '영주/문경 지역', lat: 36.8050, lng: 128.6245, radius: 100 },
      { name: '거창/함양 지역', lat: 35.6868, lng: 127.9095, radius: 100 },
      { name: '서울/수도권', lat: 37.5665, lng: 126.9780, radius: 50 },
      { name: '부산/경남', lat: 35.1795, lng: 128.9386, radius: 100 }
    ];
    
    for (const point of searchPoints) {
      const response = await axios.get(`${API_BASE_URL}/signal-spots/nearby`, {
        headers,
        params: {
          latitude: point.lat,
          longitude: point.lng,
          radiusKm: point.radius,
          limit: 20
        }
      });
      
      const spots = response.data.data || [];
      console.log(`📊 ${point.name}: ${spots.length}개 시그널스팟`);
      
      if (spots.length > 0) {
        spots.slice(0, 3).forEach(spot => {
          console.log(`  - "${spot.title}"`);
        });
      }
    }
  } catch (error) {
    console.log('❌ 결과 확인 실패:', error.response?.data?.error?.message || error.message);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 메인 실행 함수
async function main() {
  const startTime = Date.now();
  
  try {
    console.log('🚀 전국 구석구석 시그널스팟 생성 스크립트\n');
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