const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testVerification() {
  try {
    const testEmail = 'test3@example.com';
    
    console.log('Step 1: Requesting verification email via resend-verification...');
    const sendVerificationResponse = await axios.post(`${API_BASE_URL}/auth/resend-verification`, {
      email: testEmail
    });
    
    console.log('Verification email request status:', sendVerificationResponse.status);
    console.log('Response:', sendVerificationResponse.data);
    
    // Note: The verification token should be printed in the backend console
    console.log('\nLook at the backend console for the verification token, then run the next step manually.');
    
  } catch (error) {
    console.error('Verification email request failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testVerification();