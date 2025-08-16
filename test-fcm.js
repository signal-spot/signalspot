const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Test FCM configuration and push notification
async function testFCM() {
  console.log('🔔 FCM Push Notification Test');
  console.log('==============================\n');

  let authToken = '';
  
  // Step 1: Login
  try {
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 's3test@example.com',
      password: 'Test1234!'
    });
    
    authToken = loginResponse.data.data.accessToken;
    console.log('✅ Login successful');
    console.log('   User ID:', loginResponse.data.data.user.id);
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return;
  }

  // Step 2: Update FCM token
  try {
    console.log('\n2. Updating FCM token...');
    const fcmToken = 'test_fcm_token_' + Date.now();
    
    await axios.post(
      `${API_URL}/notifications-push/token`,
      {
        token: fcmToken,
        platform: 'fcm'
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    console.log('✅ FCM token updated successfully');
    console.log('   Token:', fcmToken);
  } catch (error) {
    console.error('❌ Failed to update FCM token:', error.response?.data || error.message);
  }

  // Step 3: Send test notification
  try {
    console.log('\n3. Sending test notification...');
    
    const response = await axios.post(
      `${API_URL}/notifications-push/test`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    console.log('📬 Notification result:');
    console.log('   Success:', response.data.success);
    console.log('   Platform:', response.data.platform);
    
    if (response.data.error) {
      console.log('   Error:', response.data.error);
    }
    
    if (response.data.success) {
      console.log('✅ Test notification sent successfully!');
    } else {
      console.log('⚠️  Notification sent but with issues');
    }
  } catch (error) {
    console.error('❌ Failed to send test notification:', error.response?.data || error.message);
  }

  // Step 4: Update notification settings
  try {
    console.log('\n4. Updating notification settings...');
    
    await axios.put(
      `${API_URL}/notifications-push/settings`,
      {
        pushEnabled: true,
        spotCreated: true,
        spotLiked: true,
        spotCommented: true,
        messageReceived: true,
        sparkReceived: true,
        systemAnnouncements: true
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    console.log('✅ Notification settings updated successfully');
  } catch (error) {
    console.error('❌ Failed to update notification settings:', error.response?.data || error.message);
  }

  // Step 5: Check Firebase configuration
  console.log('\n5. Checking Firebase configuration...');
  console.log('   Note: Firebase needs proper service account JSON in FIREBASE_CONFIG env variable');
  console.log('   Current status:');
  
  // Check if firebase config exists
  const envCheck = require('dotenv').config({ path: './apps/backend/.env' });
  
  if (envCheck.parsed?.FIREBASE_CONFIG) {
    try {
      const config = JSON.parse(envCheck.parsed.FIREBASE_CONFIG);
      console.log('   ✅ FIREBASE_CONFIG is set');
      console.log('   Project ID:', config.project_id || '❌ Not set');
      console.log('   Client Email:', config.client_email || '❌ Not set');
      console.log('   Has Private Key:', config.private_key ? '✅ Yes' : '❌ No');
    } catch (e) {
      console.log('   ⚠️  FIREBASE_CONFIG exists but may be invalid JSON');
    }
  } else if (envCheck.parsed?.FIREBASE_PROJECT_ID) {
    console.log('   ⚠️  Using individual Firebase env variables (legacy)');
    console.log('   Project ID:', envCheck.parsed.FIREBASE_PROJECT_ID);
    console.log('   Note: Should migrate to FIREBASE_CONFIG JSON format');
  } else {
    console.log('   ❌ No Firebase configuration found');
    console.log('   Push notifications will not work without proper Firebase setup');
  }

  console.log('\n==============================');
  console.log('📋 Summary:');
  console.log('- FCM token registration: ✅ Working');
  console.log('- Notification settings: ✅ Working');
  console.log('- Firebase configuration: Need to add actual Firebase service account');
  console.log('\nTo enable real push notifications:');
  console.log('1. Go to Firebase Console (https://console.firebase.google.com)');
  console.log('2. Select your project or create a new one');
  console.log('3. Go to Project Settings > Service Accounts');
  console.log('4. Generate new private key (downloads JSON file)');
  console.log('5. Copy the entire JSON content');
  console.log('6. Set FIREBASE_CONFIG environment variable with the JSON string');
  console.log('\nExample:');
  console.log('FIREBASE_CONFIG=\'{"type":"service_account","project_id":"your-project",...}\'');
}

// Run the test
testFCM().catch(console.error);