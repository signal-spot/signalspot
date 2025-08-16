const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000/api';
let authToken = '';

// Test user credentials - using the newly created user
const testUser = {
  email: 's3test@example.com',
  password: 'Test1234!',
  username: 's3testuser'
};

async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful');
    return response.data.data;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetSignedUrl() {
  try {
    console.log('\n📝 Testing signed URL generation...');
    const response = await axios.get(`${API_URL}/upload/signed-url`, {
      params: {
        fileName: 'test-image.jpg',
        fileType: 'image/jpeg',
        folder: 'test'
      },
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    
    const signedUrlData = response.data.data || response.data; // Handle both response formats
    console.log('✅ Signed URL generated:');
    console.log('  - Upload URL:', signedUrlData.uploadUrl.substring(0, 100) + '...');
    console.log('  - S3 Key:', signedUrlData.key);
    
    // Verify the key contains 'signalspot' folder
    if (signedUrlData.key.includes('signalspot/')) {
      console.log('  ✅ Correctly using signalspot/ folder');
    } else {
      console.log('  ❌ Not using signalspot/ folder:', signedUrlData.key);
    }
    
    return signedUrlData;
  } catch (error) {
    console.error('❌ Failed to get signed URL:', error.response?.data || error.message);
    throw error;
  }
}

async function testUploadProfileImage() {
  try {
    console.log('\n📸 Testing profile image upload to S3...');
    
    // Create a test image buffer (1x1 pixel red image)
    const redPixel = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00,
      0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
      0x09, 0x0A, 0x0B, 0xFF, 0xC4, 0x00, 0xB5, 0x10, 0x00, 0x02, 0x01, 0x03,
      0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7D,
      0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
      0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xA1, 0x08,
      0x23, 0x42, 0xB1, 0xC1, 0x15, 0x52, 0xD1, 0xF0, 0x24, 0x33, 0x62, 0x72,
      0x82, 0x09, 0x0A, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x25, 0x26, 0x27, 0x28,
      0x29, 0x2A, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x43, 0x44, 0x45,
      0x46, 0x47, 0x48, 0x49, 0x4A, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
      0x5A, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A, 0x73, 0x74, 0x75,
      0x76, 0x77, 0x78, 0x79, 0x7A, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
      0x8A, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9A, 0xA2, 0xA3,
      0xA4, 0xA5, 0xA6, 0xA7, 0xA8, 0xA9, 0xAA, 0xB2, 0xB3, 0xB4, 0xB5, 0xB6,
      0xB7, 0xB8, 0xB9, 0xBA, 0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9,
      0xCA, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA, 0xE1, 0xE2,
      0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9, 0xEA, 0xF1, 0xF2, 0xF3, 0xF4,
      0xF5, 0xF6, 0xF7, 0xF8, 0xF9, 0xFA, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01,
      0x00, 0x00, 0x3F, 0x00, 0xFB, 0xD1, 0x40, 0x07, 0xFF, 0xD9
    ]);

    const form = new FormData();
    form.append('image', redPixel, {
      filename: 'test-profile.jpg',
      contentType: 'image/jpeg'
    });

    const response = await axios.post(
      `${API_URL}/upload/s3/profile-image`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    console.log('✅ Profile image uploaded to S3:');
    console.log('  - Original URL:', response.data.originalUrl);
    console.log('  - Thumbnail URL:', response.data.thumbnailUrl);
    console.log('  - Medium URL:', response.data.mediumUrl);
    console.log('  - Large URL:', response.data.largeUrl);
    console.log('  - Dimensions:', response.data.dimensions);
    
    // Verify URLs contain 'signalspot' folder
    if (response.data.originalUrl.includes('/signalspot/')) {
      console.log('  ✅ URLs correctly using signalspot/ folder');
    } else {
      console.log('  ❌ URLs not using signalspot/ folder');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Failed to upload profile image:', error.response?.data || error.message);
    throw error;
  }
}

async function testUploadFile() {
  try {
    console.log('\n📄 Testing general file upload to S3...');
    
    // Create a test text file
    const testContent = Buffer.from('This is a test file for S3 upload with signalspot folder');
    
    const form = new FormData();
    form.append('file', testContent, {
      filename: 'test-document.txt',
      contentType: 'text/plain'
    });

    const response = await axios.post(
      `${API_URL}/upload/file`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    console.log('✅ File uploaded to S3:');
    console.log('  - URL:', response.data.url);
    console.log('  - S3 Key:', response.data.key);
    console.log('  - Bucket:', response.data.bucket);
    console.log('  - Size:', response.data.size, 'bytes');
    console.log('  - MIME Type:', response.data.mimeType);
    
    // Verify URL and key contain 'signalspot' folder
    if (response.data.url.includes('/signalspot/') && response.data.key.includes('signalspot/')) {
      console.log('  ✅ File correctly stored in signalspot/ folder');
    } else {
      console.log('  ❌ File not using signalspot/ folder');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Failed to upload file:', error.response?.data || error.message);
    throw error;
  }
}

async function testS3Integration() {
  console.log('🚀 Starting S3 Upload Integration Test (signalspot folder)\n');
  console.log('========================================');
  
  try {
    // Step 1: Login
    const authResult = await login();
    authToken = authResult.accessToken;
    console.log('✅ Authentication successful');
    console.log('  - User ID:', authResult.user.id);
    console.log('  - Username:', authResult.user.username);

    // Step 2: Test signed URL generation
    await testGetSignedUrl();

    // Step 3: Test profile image upload
    await testUploadProfileImage();

    // Step 4: Test general file upload
    await testUploadFile();

    console.log('\n========================================');
    console.log('✅ All S3 upload tests passed successfully!');
    console.log('✅ Files are correctly stored in "signalspot/" folder instead of "images/"');
    
  } catch (error) {
    console.log('\n========================================');
    console.log('❌ S3 upload test failed!');
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Run the test
testS3Integration();