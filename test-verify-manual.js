const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function verifyWithToken() {
  try {
    // You need to replace this with the actual token from the backend console
    const verificationToken = 'REPLACE_WITH_TOKEN_FROM_BACKEND_CONSOLE';
    
    if (verificationToken === 'REPLACE_WITH_TOKEN_FROM_BACKEND_CONSOLE') {
      console.log('Please check the backend console logs for the verification token.');
      console.log('Look for a line like: "Email verification token for test3@example.com: <TOKEN>"');
      console.log('Then replace REPLACE_WITH_TOKEN_FROM_BACKEND_CONSOLE with the actual token.');
      return;
    }
    
    console.log('Verifying email with token...');
    const verifyResponse = await axios.post(`${API_BASE_URL}/auth/verify-email`, {
      token: verificationToken
    });
    
    console.log('Verification status:', verifyResponse.status);
    console.log('Response:', verifyResponse.data);
    
    if (verifyResponse.status === 200) {
      console.log('\n✅ Email verified successfully! You can now test the signals API.');
    }
    
  } catch (error) {
    console.error('Email verification failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

verifyWithToken();