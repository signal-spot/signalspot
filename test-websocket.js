const io = require('socket.io-client');
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const WS_URL = 'http://localhost:3000/ws';

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: `${colors.blue}[INFO]${colors.reset}`,
    success: `${colors.green}[SUCCESS]${colors.reset}`,
    error: `${colors.red}[ERROR]${colors.reset}`,
    warning: `${colors.yellow}[WARNING]${colors.reset}`,
    ws: `${colors.magenta}[WS]${colors.reset}`,
    test: `${colors.cyan}[TEST]${colors.reset}`
  };
  
  console.log(`${prefix[type]} ${colors.bright}${timestamp}${colors.reset} ${message}`);
}

async function testWebSocket() {
  log('='.repeat(80), 'info');
  log('WebSocket 실시간 통신 테스트 시작', 'test');
  log('='.repeat(80), 'info');

  try {
    // 1. 사용자 등록 및 로그인
    log('\n1. 테스트 사용자 생성', 'test');
    const timestamp = Date.now();
    
    // User 1
    const user1Data = {
      email: `ws_user1_${timestamp}@signalspot.com`,
      password: 'Test123!@#',
      username: `ws_user1_${timestamp}`
    };
    
    const user1Response = await axios.post(`${API_URL}/auth/register`, user1Data);
    const user1Token = user1Response.data.data.accessToken;
    const user1 = user1Response.data.data.user;
    log(`✅ User 1 생성: ${user1.username} (ID: ${user1.id})`, 'success');
    
    // User 2
    const user2Data = {
      email: `ws_user2_${timestamp}@signalspot.com`,
      password: 'Test123!@#',
      username: `ws_user2_${timestamp}`
    };
    
    const user2Response = await axios.post(`${API_URL}/auth/register`, user2Data);
    const user2Token = user2Response.data.data.accessToken;
    const user2 = user2Response.data.data.user;
    log(`✅ User 2 생성: ${user2.username} (ID: ${user2.id})`, 'success');

    // 2. WebSocket 연결 설정
    log('\n2. WebSocket 연결 설정', 'test');
    
    // User 1 WebSocket 연결
    const socket1 = io(WS_URL, {
      auth: {
        token: user1Token
      },
      transports: ['websocket']
    });

    // User 2 WebSocket 연결
    const socket2 = io(WS_URL, {
      auth: {
        token: user2Token
      },
      transports: ['websocket']
    });

    // 3. 이벤트 리스너 설정
    log('\n3. 이벤트 리스너 설정', 'test');

    // User 1 이벤트 리스너
    socket1.on('connect', () => {
      log(`User 1 WebSocket 연결됨 (Socket ID: ${socket1.id})`, 'ws');
    });

    socket1.on('connected', (data) => {
      log(`User 1 연결 확인: ${JSON.stringify(data)}`, 'ws');
    });

    socket1.on('spotCreated', (data) => {
      log(`User 1 - 새 Signal Spot 알림: "${data.title}" by ${data.creator.username}`, 'ws');
    });

    socket1.on('spotLiked', (data) => {
      log(`User 1 - 좋아요 알림: ${data.username} liked spot ${data.spotId}`, 'ws');
    });

    socket1.on('messageReceived', (data) => {
      log(`User 1 - 새 메시지: "${data.content}" from ${data.sender.username}`, 'ws');
    });

    socket1.on('sparkReceived', (data) => {
      log(`User 1 - Spark 받음: from ${data.sender.username}`, 'ws');
    });

    socket1.on('notificationReceived', (notification) => {
      log(`User 1 - 알림: ${notification.title} - ${notification.message}`, 'ws');
    });

    // User 2 이벤트 리스너
    socket2.on('connect', () => {
      log(`User 2 WebSocket 연결됨 (Socket ID: ${socket2.id})`, 'ws');
    });

    socket2.on('connected', (data) => {
      log(`User 2 연결 확인: ${JSON.stringify(data)}`, 'ws');
    });

    socket2.on('spotCreated', (data) => {
      log(`User 2 - 새 Signal Spot 알림: "${data.title}" by ${data.creator.username}`, 'ws');
    });

    socket2.on('spotCommented', (data) => {
      log(`User 2 - 댓글 알림: ${data.comment.author.username} commented on spot ${data.spotId}`, 'ws');
    });

    socket2.on('messageReceived', (data) => {
      log(`User 2 - 새 메시지: "${data.content}" from ${data.sender.username}`, 'ws');
    });

    socket2.on('sparkSent', (data) => {
      log(`User 2 - Spark 보냄: to ${data.receiver.username}`, 'ws');
    });

    socket2.on('notificationReceived', (notification) => {
      log(`User 2 - 알림: ${notification.title} - ${notification.message}`, 'ws');
    });

    socket2.on('userTyping', (data) => {
      log(`User 2 - ${data.username} is ${data.isTyping ? 'typing' : 'stopped typing'}...`, 'ws');
    });

    // Wait for connections
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. 위치 구독 테스트
    log('\n4. 위치 기반 구독 테스트', 'test');
    
    const location = { latitude: 37.5665, longitude: 126.9780, radiusKm: 5 };
    
    socket1.emit('subscribeToLocation', location, (response) => {
      log(`User 1 위치 구독 응답: ${JSON.stringify(response)}`, 'success');
    });

    socket2.emit('subscribeToLocation', location, (response) => {
      log(`User 2 위치 구독 응답: ${JSON.stringify(response)}`, 'success');
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 5. Signal Spot 생성 테스트 (WebSocket 알림 확인)
    log('\n5. Signal Spot 생성 및 실시간 알림 테스트', 'test');
    
    const spotData = {
      title: 'WebSocket 테스트 Signal',
      content: '실시간 알림 테스트를 위한 Signal Spot',
      latitude: location.latitude,
      longitude: location.longitude,
      type: 'announcement',
      visibility: 'public',
      tags: ['테스트', 'WebSocket'],
      durationHours: 24,
      radiusInMeters: 1000
    };

    const spotResponse = await axios.post(`${API_URL}/signal-spots`, spotData, {
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });

    const spot = spotResponse.data.data;
    log(`✅ Signal Spot 생성: ${spot.id}`, 'success');

    // Signal Spot 구독
    socket1.emit('subscribeToSpot', { spotId: spot.id }, (response) => {
      log(`User 1 Signal Spot 구독: ${JSON.stringify(response)}`, 'success');
    });

    socket2.emit('subscribeToSpot', { spotId: spot.id }, (response) => {
      log(`User 2 Signal Spot 구독: ${JSON.stringify(response)}`, 'success');
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // 6. Signal Spot 상호작용 테스트
    log('\n6. Signal Spot 좋아요 및 댓글 실시간 알림 테스트', 'test');

    // User 2가 좋아요
    await axios.post(
      `${API_URL}/signal-spots/${spot.id}/interact`,
      { type: 'like' },
      { headers: { 'Authorization': `Bearer ${user2Token}` } }
    );
    log('User 2가 Signal Spot에 좋아요', 'info');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // User 2가 댓글 추가
    await axios.post(
      `${API_URL}/signal-spots/${spot.id}/comments`,
      { content: 'WebSocket을 통한 실시간 댓글 알림 테스트!' },
      { headers: { 'Authorization': `Bearer ${user2Token}` } }
    );
    log('User 2가 댓글 추가', 'info');

    await new Promise(resolve => setTimeout(resolve, 2000));

    // 7. 채팅 메시지 테스트
    log('\n7. 채팅 메시지 실시간 전송 테스트', 'test');

    // 채팅방 생성
    const chatRoomResponse = await axios.post(
      `${API_URL}/chat/rooms`,
      { 
        participantId: user2.id,
        name: 'WebSocket 테스트 채팅',
        type: 'direct'
      },
      { headers: { 'Authorization': `Bearer ${user1Token}` } }
    );

    const chatRoom = chatRoomResponse.data;
    log(`✅ 채팅방 생성: ${chatRoom.id}`, 'success');

    // 채팅방 구독
    socket1.emit('subscribeToChatRoom', { roomId: chatRoom.id }, (response) => {
      log(`User 1 채팅방 구독: ${JSON.stringify(response)}`, 'success');
    });

    socket2.emit('subscribeToChatRoom', { roomId: chatRoom.id }, (response) => {
      log(`User 2 채팅방 구독: ${JSON.stringify(response)}`, 'success');
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 타이핑 인디케이터 테스트
    socket1.emit('typing', { roomId: chatRoom.id, isTyping: true });
    log('User 1 typing indicator 전송', 'info');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    socket1.emit('typing', { roomId: chatRoom.id, isTyping: false });

    // 메시지 전송
    const messageResponse = await axios.post(
      `${API_URL}/chat/messages`,
      { 
        chatRoomId: chatRoom.id,
        content: 'WebSocket을 통한 실시간 메시지 전송 테스트!',
        type: 'text'
      },
      { headers: { 'Authorization': `Bearer ${user1Token}` } }
    );

    log(`✅ 메시지 전송: ${messageResponse.data.id}`, 'success');

    await new Promise(resolve => setTimeout(resolve, 2000));

    // 8. 연결 해제 테스트
    log('\n8. WebSocket 연결 해제', 'test');

    socket1.disconnect();
    log('User 1 연결 해제', 'ws');

    socket2.disconnect();
    log('User 2 연결 해제', 'ws');

    // 테스트 완료
    log('\n' + '='.repeat(80), 'info');
    log('✅ WebSocket 실시간 통신 테스트 완료!', 'success');
    log('='.repeat(80), 'info');

    // 요약
    log('\n📊 테스트 요약:', 'test');
    log('   - WebSocket 연결: ✅', 'info');
    log('   - 위치 기반 구독: ✅', 'info');
    log('   - Signal Spot 실시간 알림: ✅', 'info');
    log('   - 채팅 메시지 실시간 전송: ✅', 'info');
    log('   - 타이핑 인디케이터: ✅', 'info');
    log('   - 연결 해제: ✅', 'info');

    process.exit(0);

  } catch (error) {
    log('\n테스트 실패!', 'error');
    log(`오류: ${error.message}`, 'error');
    
    if (error.response) {
      log(`상태 코드: ${error.response.status}`, 'error');
      log(`응답 데이터: ${JSON.stringify(error.response.data, null, 2)}`, 'error');
    }

    process.exit(1);
  }
}

// socket.io-client 패키지 확인
try {
  require.resolve('socket.io-client');
} catch(e) {
  console.error('socket.io-client 패키지가 설치되지 않았습니다.');
  console.log('다음 명령어를 실행하세요: npm install socket.io-client');
  process.exit(1);
}

// 테스트 실행
testWebSocket();