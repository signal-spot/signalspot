const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testNotificationAPI() {
  try {
    console.log('🔔 Testing Notification API\n');
    
    // Login first
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'notiftest1@test.com',
      password: 'test1234'
    });
    
    const token = loginResponse.data.accessToken;
    console.log('✅ Login successful\n');
    
    // Get notifications
    console.log('2. Fetching notifications...');
    const notifResponse = await axios.get(`${API_URL}/notifications?limit=10&offset=0`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📬 Raw API Response:');
    console.log(JSON.stringify(notifResponse.data, null, 2));
    
    // Check structure
    console.log('\n📊 Response Analysis:');
    console.log('- Has success field:', 'success' in notifResponse.data);
    console.log('- Has data field:', 'data' in notifResponse.data);
    console.log('- Has notifications field:', 'notifications' in notifResponse.data);
    console.log('- Has pagination field:', 'pagination' in notifResponse.data);
    
    if (notifResponse.data.data) {
      console.log('\n📦 Data field contents:');
      console.log('- Type:', typeof notifResponse.data.data);
      console.log('- Is Array:', Array.isArray(notifResponse.data.data));
      
      if (notifResponse.data.data.notifications) {
        console.log('- Has notifications in data:', true);
        console.log('- Notifications count:', notifResponse.data.data.notifications.length);
      }
      
      if (notifResponse.data.data.pagination) {
        console.log('- Has pagination in data:', true);
        console.log('- Total:', notifResponse.data.data.pagination.total);
      }
    }
    
    // Check if notifications are wrapped in data
    const notifications = notifResponse.data.notifications || 
                          notifResponse.data.data?.notifications || 
                          notifResponse.data.data || 
                          [];
    
    console.log('\n📝 Notifications found:', Array.isArray(notifications) ? notifications.length : 'Not an array');
    
    if (Array.isArray(notifications) && notifications.length > 0) {
      console.log('\nFirst notification:');
      console.log(JSON.stringify(notifications[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testNotificationAPI();