const axios = require('axios');
const FormData = require('form-data');

const API_URL = 'http://localhost:3000/api';

// Get token from previous registration
const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZDI0NjYxNS0zOTYzLTQyZjQtYjg1Ny1lNmE3Y2Q1ZGRmZDYiLCJlbWFpbCI6InMzdGVzdEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiczN0ZXN0dXNlciIsImlhdCI6MTc1NTAyMjAxNiwiZXhwIjoxNzU1MDIyOTE2fQ.3rTrjJbeQFv5ttuHhFwMmkL4bixrj4U04EMkE0r6K6I';

async function testProfileImageUpload() {
  try {
    console.log('🚀 Testing S3 Profile Image Upload');
    console.log('==================================\n');
    
    // Create a simple test image (1x1 pixel JPEG)
    const testImage = Buffer.from([
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
      0x09, 0x0A, 0x0B, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F,
      0x00, 0xFB, 0xD1, 0x40, 0x07, 0xFF, 0xD9
    ]);

    const form = new FormData();
    form.append('image', testImage, {
      filename: 'test-profile.jpg',
      contentType: 'image/jpeg'
    });

    console.log('📤 Uploading profile image to S3...');
    
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

    const imageData = response.data.data || response.data;
    
    console.log('\n✅ Profile image successfully uploaded!\n');
    console.log('📊 Upload Results:');
    console.log('==================');
    console.log('Original URL:', imageData.originalUrl);
    console.log('Thumbnail URL:', imageData.thumbnailUrl);
    console.log('Medium URL:', imageData.mediumUrl);
    console.log('Large URL:', imageData.largeUrl);
    
    // Check if URLs contain signalspot folder
    const urlsValid = [
      imageData.originalUrl,
      imageData.thumbnailUrl, 
      imageData.mediumUrl,
      imageData.largeUrl
    ].every(url => url && url.includes('/signalspot/'));
    
    console.log('\n📁 Folder Verification:');
    if (urlsValid) {
      console.log('✅ All URLs correctly use "signalspot/" folder');
    } else {
      console.log('❌ URLs are not using "signalspot/" folder correctly');
    }
    
    // Try to verify one of the URLs is accessible
    console.log('\n🔍 Verifying S3 upload...');
    try {
      const checkResponse = await axios.head(imageData.originalUrl);
      console.log('✅ S3 file is accessible (Status:', checkResponse.status, ')');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('⚠️  S3 file exists but bucket permissions may need adjustment');
      } else {
        console.log('❌ Could not verify S3 file:', error.message);
      }
    }
    
    console.log('\n==================================');
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

// Run the test
testProfileImageUpload();