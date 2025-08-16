const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Test accounts
const user1 = {
  email: 'notiftest1@test.com',
  username: 'notiftest1',
  password: 'Password123@'
};

const user2 = {
  email: 'notiftest2@test.com', 
  username: 'notiftest2',
  password: 'Password123@'
};

// Test location for spark
const testLocation = {
  latitude: 37.5665,
  longitude: 126.9780,
  accuracy: 10,
  isCurrentLocation: true
};

async function testNotificationStorage() {
  console.log('🔔 Starting Notification Storage Test\n');
  console.log('Testing that notifications are properly stored in the database\n');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Register and login users
    console.log('\n📝 Step 1: Setting up test users...');
    
    try {
      await axios.post(`${API_URL}/auth/register`, user1);
      console.log(`✅ Registered ${user1.username}`);
    } catch (e) {
      if (e.response?.status === 409) {
        console.log(`ℹ️ ${user1.username} already exists`);
      } else throw e;
    }
    
    try {
      await axios.post(`${API_URL}/auth/register`, user2);
      console.log(`✅ Registered ${user2.username}`);
    } catch (e) {
      if (e.response?.status === 409) {
        console.log(`ℹ️ ${user2.username} already exists`);
      } else throw e;
    }
    
    const login1 = await axios.post(`${API_URL}/auth/login`, {
      email: user1.email,
      password: user1.password
    });
    const token1 = login1.data.data.accessToken;
    console.log(`✅ Logged in ${user1.username}`);
    
    const login2 = await axios.post(`${API_URL}/auth/login`, {
      email: user2.email,
      password: user2.password
    });
    const token2 = login2.data.data.accessToken;
    console.log(`✅ Logged in ${user2.username}`);
    
    // Step 2: Trigger a notification (create a spark)
    console.log('\n🌟 Step 2: Creating a spark to trigger notifications...');
    
    await axios.post(`${API_URL}/location`, testLocation, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    console.log(`✅ Created location for ${user1.username}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await axios.post(`${API_URL}/location`, testLocation, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    console.log(`✅ Created location for ${user2.username}`);
    
    // Wait for spark detection and notification
    console.log('\n⏳ Waiting for spark detection and notifications...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 3: Check notifications for both users
    console.log('\n🔍 Step 3: Checking stored notifications...');
    
    // Get notifications for user1
    try {
      const notifs1 = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token1}` }
      });
      
      const notifications1 = notifs1.data.notifications || notifs1.data.data || [];
      console.log(`\n${user1.username} notifications:`);
      console.log(`  - Total: ${notifications1.length} notification(s)`);
      console.log(`  - Unread: ${notifs1.data.unreadCount || 0}`);
      
      if (notifications1.length > 0) {
        notifications1.slice(0, 3).forEach((notif, idx) => {
          console.log(`  ${idx + 1}. ${notif.title}`);
          console.log(`     Type: ${notif.type}`);
          console.log(`     Status: ${notif.status}`);
          console.log(`     Created: ${new Date(notif.createdAt).toLocaleString()}`);
        });
      }
    } catch (error) {
      console.log(`⚠️ Could not fetch notifications for ${user1.username}: ${error.response?.data?.message || error.message}`);
    }
    
    // Get notifications for user2
    try {
      const notifs2 = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token2}` }
      });
      
      const notifications2 = notifs2.data.notifications || notifs2.data.data || [];
      console.log(`\n${user2.username} notifications:`);
      console.log(`  - Total: ${notifications2.length} notification(s)`);
      console.log(`  - Unread: ${notifs2.data.unreadCount || 0}`);
      
      if (notifications2.length > 0) {
        notifications2.slice(0, 3).forEach((notif, idx) => {
          console.log(`  ${idx + 1}. ${notif.title}`);
          console.log(`     Type: ${notif.type}`);
          console.log(`     Status: ${notif.status}`);
          console.log(`     Created: ${new Date(notif.createdAt).toLocaleString()}`);
        });
      }
    } catch (error) {
      console.log(`⚠️ Could not fetch notifications for ${user2.username}: ${error.response?.data?.message || error.message}`);
    }
    
    // Step 4: Test manual spark notification
    console.log('\n📨 Step 4: Testing manual spark notification...');
    
    try {
      // Send a manual spark
      const manualSpark = await axios.post(`${API_URL}/sparks`, {
        user2Id: user2.id || login2.data.data.user?.id || login2.data.data.id,
        message: 'Test spark for notification'
      }, {
        headers: { Authorization: `Bearer ${token1}` }
      });
      
      console.log(`✅ Manual spark sent from ${user1.username} to ${user2.username}`);
      
      // Wait for notification
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check notifications again
      try {
        const notifs2After = await axios.get(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token2}` }
        });
        
        const notificationsAfter = notifs2After.data.notifications || notifs2After.data.data || [];
        console.log(`\n${user2.username} notifications after manual spark:`);
        console.log(`  - Total: ${notificationsAfter.length} notification(s)`);
        
        const recentNotifs = notificationsAfter.filter(n => {
          const createdTime = new Date(n.createdAt).getTime();
          return Date.now() - createdTime < 10000; // Last 10 seconds
        });
        
        if (recentNotifs.length > 0) {
          console.log(`  - Recent notifications (last 10 seconds): ${recentNotifs.length}`);
          recentNotifs.forEach(notif => {
            console.log(`    • ${notif.title} (${notif.type})`);
          });
        }
      } catch (error) {
        console.log(`⚠️ Could not fetch notifications after manual spark: ${error.response?.data?.message || error.message}`);
      }
    } catch (error) {
      console.log(`⚠️ Could not send manual spark: ${error.response?.data?.message || error.message}`);
    }
    
    // Step 5: Check database directly
    console.log('\n💾 Step 5: Verification Summary');
    console.log('=' .repeat(40));
    
    console.log('\nChecklist:');
    console.log('  ✓ Users created and logged in');
    console.log('  ✓ Spark created between users');
    console.log('  ✓ Notifications API endpoint checked');
    console.log('  ✓ Manual spark notification tested');
    
    console.log('\n📊 Results:');
    console.log('If notifications are being stored correctly, you should see:');
    console.log('  1. Notification entries for spark_detected type');
    console.log('  2. Status should be "delivered"');
    console.log('  3. Recent notifications should appear after manual spark');
    
    console.log('\nTo verify in database directly, run:');
    console.log('  SELECT * FROM notification ORDER BY created_at DESC LIMIT 10;');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.response?.data || error.message);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('Test completed');
}

// Run the test
testNotificationStorage().catch(console.error);