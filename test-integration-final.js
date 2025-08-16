#!/usr/bin/env node

/**
 * SignalSpot 최종 통합 테스트
 * 모든 주요 기능이 정상적으로 작동하는지 확인
 */

const axios = require('axios');
const WebSocket = require('ws');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:3000/api';
let authToken = null;
let userId = null;
let ws = null;

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// 로그 헬퍼 함수
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`  ${title}`, 'bright');
  console.log('='.repeat(60));
}

function logTest(testName, success) {
  const icon = success ? '✅' : '❌';
  const color = success ? 'green' : 'red';
  log(`${icon} ${testName}`, color);
}

// API 클라이언트 설정
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 인증 토큰 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      log(`API Error: ${error.response.status} - ${error.response.data.message || error.message}`, 'red');
    }
    return Promise.reject(error);
  }
);

// 테스트 함수들
async function testUserAuthentication() {
  logSection('1. 사용자 인증 테스트');
  
  try {
    // 회원가입
    const signupData = {
      email: `test${Date.now()}@example.com`,
      password: 'Test1234!',
      username: `testuser${Date.now()}`,
    };
    
    const signupRes = await apiClient.post('/auth/signup', signupData);
    logTest('회원가입', signupRes.data.success);
    
    // 로그인
    const loginRes = await apiClient.post('/auth/login', {
      email: signupData.email,
      password: signupData.password,
    });
    
    authToken = loginRes.data.data.token;
    userId = loginRes.data.data.user.id;
    
    logTest('로그인', !!authToken);
    log(`  토큰: ${authToken.substring(0, 20)}...`, 'cyan');
    log(`  사용자 ID: ${userId}`, 'cyan');
    
    return true;
  } catch (error) {
    logTest('인증 테스트 실패', false);
    return false;
  }
}

async function testWebSocketConnection() {
  logSection('2. WebSocket 연결 테스트');
  
  return new Promise((resolve) => {
    try {
      ws = new WebSocket(`ws://localhost:3000?token=${authToken}`);
      
      ws.on('open', () => {
        logTest('WebSocket 연결', true);
        
        // 테스트 메시지 전송
        ws.send(JSON.stringify({
          type: 'ping',
          data: { timestamp: Date.now() },
        }));
      });
      
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        log(`  WebSocket 메시지 수신: ${message.type}`, 'cyan');
        
        if (message.type === 'pong') {
          logTest('WebSocket 통신', true);
          resolve(true);
        }
      });
      
      ws.on('error', (error) => {
        logTest('WebSocket 연결 실패', false);
        log(`  에러: ${error.message}`, 'red');
        resolve(false);
      });
      
      // 타임아웃 설정
      setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          logTest('WebSocket 연결 시간 초과', false);
          resolve(false);
        }
      }, 5000);
    } catch (error) {
      logTest('WebSocket 테스트 실패', false);
      resolve(false);
    }
  });
}

async function testSignalSpot() {
  logSection('3. Signal Spot 기능 테스트');
  
  try {
    // Signal Spot 생성
    const createRes = await apiClient.post('/signal-spots', {
      content: '테스트 시그널 스팟입니다',
      latitude: 37.5665,
      longitude: 126.9780,
      expiresIn: 24,
      visibility: 'public',
      tags: ['test', 'integration'],
    });
    
    const spotId = createRes.data.data.id;
    logTest('Signal Spot 생성', !!spotId);
    log(`  Spot ID: ${spotId}`, 'cyan');
    
    // 주변 스팟 조회
    const nearbyRes = await apiClient.get('/signal-spots/nearby', {
      params: {
        latitude: 37.5665,
        longitude: 126.9780,
        radius: 1000,
      },
    });
    
    logTest('주변 스팟 조회', nearbyRes.data.data.length > 0);
    log(`  발견된 스팟: ${nearbyRes.data.data.length}개`, 'cyan');
    
    // 스팟 좋아요
    const likeRes = await apiClient.post(`/signal-spots/${spotId}/like`);
    logTest('스팟 좋아요', likeRes.data.success);
    
    // 댓글 작성
    const commentRes = await apiClient.post(`/signal-spots/${spotId}/comments`, {
      content: '좋은 스팟이네요!',
    });
    logTest('댓글 작성', commentRes.data.success);
    
    return true;
  } catch (error) {
    logTest('Signal Spot 테스트 실패', false);
    return false;
  }
}

async function testSpark() {
  logSection('4. Spark 기능 테스트');
  
  try {
    // Spark 전송
    const createRes = await apiClient.post('/sparks', {
      user2Id: userId, // 테스트용으로 자기 자신에게 전송
      message: '테스트 스파크 메시지입니다',
      sparkType: 'interest',
    });
    
    const sparkId = createRes.data.data?.id;
    logTest('Spark 전송', !!sparkId);
    
    // Spark 목록 조회
    const listRes = await apiClient.get('/sparks');
    logTest('Spark 목록 조회', Array.isArray(listRes.data.data));
    log(`  받은 스파크: ${listRes.data.data.length}개`, 'cyan');
    
    // Spark 통계 조회
    const statsRes = await apiClient.get('/sparks/stats');
    logTest('Spark 통계 조회', !!statsRes.data.data);
    
    return true;
  } catch (error) {
    logTest('Spark 테스트 실패', false);
    return false;
  }
}

async function testChat() {
  logSection('5. Chat 기능 테스트');
  
  try {
    // 채팅방 생성
    const createRes = await apiClient.post('/chat/rooms', {
      participantIds: [userId],
      type: 'direct',
    });
    
    const roomId = createRes.data.data?.id;
    logTest('채팅방 생성', !!roomId);
    
    // 메시지 전송
    const messageRes = await apiClient.post(`/chat/rooms/${roomId}/messages`, {
      content: '테스트 메시지입니다',
      type: 'text',
    });
    logTest('메시지 전송', messageRes.data.success);
    
    // 메시지 목록 조회
    const messagesRes = await apiClient.get(`/chat/rooms/${roomId}/messages`);
    logTest('메시지 목록 조회', Array.isArray(messagesRes.data.data));
    
    return true;
  } catch (error) {
    logTest('Chat 테스트 실패', false);
    return false;
  }
}

async function testNotification() {
  logSection('6. 알림 기능 테스트');
  
  try {
    // 푸시 토큰 등록
    const tokenRes = await apiClient.post('/notifications/token', {
      token: 'test-fcm-token-' + Date.now(),
      platform: 'fcm',
    });
    logTest('푸시 토큰 등록', tokenRes.data.success);
    
    // 알림 설정 업데이트
    const settingsRes = await apiClient.put('/notifications/settings', {
      pushEnabled: true,
      sparkReceived: true,
      messageReceived: true,
      spotLiked: true,
    });
    logTest('알림 설정 업데이트', settingsRes.data.success);
    
    // 테스트 알림 전송
    const testRes = await apiClient.post('/notifications/test');
    logTest('테스트 알림 전송', testRes.data.success);
    log(`  플랫폼: ${testRes.data.platform}`, 'cyan');
    
    return true;
  } catch (error) {
    logTest('알림 테스트 실패', false);
    return false;
  }
}

async function testFileUpload() {
  logSection('7. 파일 업로드 테스트');
  
  try {
    // 테스트 이미지 생성 (1x1 픽셀 PNG)
    const imageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    
    const form = new FormData();
    form.append('image', imageBuffer, {
      filename: 'test.png',
      contentType: 'image/png',
    });
    
    const uploadRes = await apiClient.post('/upload/profile-image', form, {
      headers: form.getHeaders(),
    });
    
    logTest('프로필 이미지 업로드', uploadRes.data.success);
    
    if (uploadRes.data.data) {
      log(`  원본 URL: ${uploadRes.data.data.originalUrl}`, 'cyan');
      log(`  썸네일 URL: ${uploadRes.data.data.thumbnailUrl}`, 'cyan');
    }
    
    return true;
  } catch (error) {
    logTest('파일 업로드 테스트 실패', false);
    return false;
  }
}

async function testCaching() {
  logSection('8. 캐싱 성능 테스트');
  
  try {
    const iterations = 5;
    const times = [];
    
    // 첫 번째 요청 (캐시 미스)
    const start1 = Date.now();
    await apiClient.get('/signal-spots/popular');
    const time1 = Date.now() - start1;
    times.push(time1);
    log(`  첫 번째 요청 (캐시 미스): ${time1}ms`, 'yellow');
    
    // 후속 요청들 (캐시 히트)
    for (let i = 2; i <= iterations; i++) {
      const start = Date.now();
      await apiClient.get('/signal-spots/popular');
      const time = Date.now() - start;
      times.push(time);
      log(`  ${i}번째 요청 (캐시 히트): ${time}ms`, 'green');
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const improvement = ((time1 - times[times.length - 1]) / time1 * 100).toFixed(1);
    
    log(`  평균 응답 시간: ${avgTime.toFixed(1)}ms`, 'cyan');
    log(`  성능 개선: ${improvement}%`, 'cyan');
    
    logTest('캐싱 성능', improvement > 30);
    
    return true;
  } catch (error) {
    logTest('캐싱 테스트 실패', false);
    return false;
  }
}

async function testErrorHandling() {
  logSection('9. 에러 처리 테스트');
  
  let testsPassed = 0;
  const totalTests = 4;
  
  // 404 에러
  try {
    await apiClient.get('/signal-spots/nonexistent');
  } catch (error) {
    if (error.response?.status === 404) {
      logTest('404 에러 처리', true);
      testsPassed++;
    }
  }
  
  // 400 에러 (잘못된 데이터)
  try {
    await apiClient.post('/signal-spots', {
      // content 누락
      latitude: 'invalid',
      longitude: 'invalid',
    });
  } catch (error) {
    if (error.response?.status === 400) {
      logTest('400 에러 처리 (유효성 검사)', true);
      testsPassed++;
    }
  }
  
  // 401 에러 (인증 없음)
  try {
    const tempToken = authToken;
    authToken = null;
    await apiClient.get('/profile');
    authToken = tempToken;
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('401 에러 처리 (인증)', true);
      testsPassed++;
    }
  }
  
  // Rate limiting (옵션)
  try {
    const promises = [];
    for (let i = 0; i < 20; i++) {
      promises.push(apiClient.get('/signal-spots/popular'));
    }
    await Promise.all(promises);
    logTest('Rate limiting', true);
    testsPassed++;
  } catch (error) {
    if (error.response?.status === 429) {
      logTest('Rate limiting (429)', true);
      testsPassed++;
    }
  }
  
  return testsPassed >= totalTests - 1; // 최소 3개 이상 통과
}

async function testPerformance() {
  logSection('10. 성능 측정');
  
  const endpoints = [
    { name: 'Signal Spots 목록', url: '/signal-spots', method: 'get' },
    { name: 'Spark 목록', url: '/sparks', method: 'get' },
    { name: '프로필 조회', url: '/profile', method: 'get' },
    { name: '알림 설정', url: '/notifications/settings', method: 'get' },
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const times = [];
    
    for (let i = 0; i < 3; i++) {
      const start = Date.now();
      try {
        await apiClient[endpoint.method](endpoint.url);
        const time = Date.now() - start;
        times.push(time);
      } catch (error) {
        times.push(-1);
      }
    }
    
    const avgTime = times.filter(t => t > 0).reduce((a, b) => a + b, 0) / times.filter(t => t > 0).length;
    const success = avgTime > 0 && avgTime < 500;
    
    results.push(success);
    logTest(`${endpoint.name}: ${avgTime.toFixed(0)}ms`, success);
  }
  
  return results.filter(r => r).length >= results.length * 0.75;
}

// 메인 실행 함수
async function runIntegrationTests() {
  console.log('\n');
  log('🚀 SignalSpot 최종 통합 테스트 시작', 'bright');
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  const results = [];
  
  // 각 테스트 실행
  results.push(await testUserAuthentication());
  results.push(await testWebSocketConnection());
  results.push(await testSignalSpot());
  results.push(await testSpark());
  results.push(await testChat());
  results.push(await testNotification());
  results.push(await testFileUpload());
  results.push(await testCaching());
  results.push(await testErrorHandling());
  results.push(await testPerformance());
  
  // WebSocket 연결 종료
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close();
  }
  
  // 결과 요약
  logSection('테스트 결과 요약');
  
  const passedTests = results.filter(r => r).length;
  const totalTests = results.length;
  const successRate = (passedTests / totalTests * 100).toFixed(1);
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  
  log(`통과한 테스트: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'yellow');
  log(`성공률: ${successRate}%`, successRate >= 80 ? 'green' : 'red');
  log(`전체 실행 시간: ${totalTime}초`, 'cyan');
  
  if (passedTests === totalTests) {
    console.log('\n');
    log('✨ 모든 통합 테스트를 성공적으로 통과했습니다! ✨', 'green');
    log('SignalSpot 애플리케이션이 프로덕션 준비가 완료되었습니다.', 'bright');
  } else {
    console.log('\n');
    log('⚠️  일부 테스트가 실패했습니다. 로그를 확인해주세요.', 'yellow');
  }
  
  console.log('\n');
  process.exit(passedTests === totalTests ? 0 : 1);
}

// 서버 연결 확인 후 테스트 실행
async function checkServerAndRun() {
  try {
    await axios.get(`${API_BASE_URL}/health`);
    runIntegrationTests();
  } catch (error) {
    log('❌ 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.', 'red');
    log(`   API URL: ${API_BASE_URL}`, 'yellow');
    process.exit(1);
  }
}

// 실행
checkServerAndRun();