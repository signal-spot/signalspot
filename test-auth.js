const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testAuth() {
  try {
    const testEmail = 'test3@example.com';
    const testPassword = 'Password123!';
    const testUsername = 'testuser3';

    console.log('Testing user registration...');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: testEmail,
        password: testPassword,
        username: testUsername
      });
      console.log('Registration successful!');
      console.log('User registered:', registerResponse.data.user);
    } catch (regError) {
      if (regError.response?.status === 409) {
        console.log('User already exists, proceeding to login...');
      } else {
        console.error('Registration failed:', regError.response?.data);
        return;
      }
    }

    // Test login
    console.log('\nTesting user login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    
    console.log('Login successful!');
    console.log('Response status:', loginResponse.status);
    console.log('Response data:', JSON.stringify(loginResponse.data, null, 2));
    
  } catch (error) {
    console.error('Login failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAuth();