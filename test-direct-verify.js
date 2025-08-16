const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testDirectVerification() {
  try {
    // First login to get access token
    const testEmail = 'test3@example.com';
    const testPassword = 'Password123!';
    
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    
    const accessToken = loginResponse.data.data.accessToken;
    console.log('✅ Login successful');
    
    // Check if there's a development endpoint to verify user
    console.log('2. Checking user status...');
    const userResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('Current user status:', {
      email: userResponse.data.data.email,
      isEmailVerified: userResponse.data.data.isEmailVerified
    });
    
    if (!userResponse.data.data.isEmailVerified) {
      console.log('\n❌ User is not verified.');
      console.log('To proceed with testing:');
      console.log('1. Check backend console for verification token after running test-verify.js');
      console.log('2. Copy the token and run test-verify-manual.js');
      console.log('3. Or ask the developer to temporarily disable verification in development');
    } else {
      console.log('✅ User is already verified!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testDirectVerification();