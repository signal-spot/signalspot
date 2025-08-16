// Test S3 configuration
require('dotenv').config({ path: './apps/backend/.env' });

console.log('🔧 S3 Configuration Test');
console.log('========================\n');

console.log('Environment Variables:');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Not set');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Not set');
console.log('AWS_REGION:', process.env.AWS_REGION || 'Not set (will use default)');
console.log('AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET || 'Not set');
console.log('\nActual values:');
console.log('  Access Key ID starts with:', process.env.AWS_ACCESS_KEY_ID?.substring(0, 10) + '...');
console.log('  Bucket name:', process.env.AWS_S3_BUCKET);
console.log('AWS_S3_IMAGE_FOLDER:', process.env.AWS_S3_IMAGE_FOLDER || 'Not set');

// Test AWS SDK initialization
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

const client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

console.log('\n🔍 Testing S3 Connection...');

async function testConnection() {
  try {
    const command = new ListBucketsCommand({});
    const response = await client.send(command);
    
    console.log('✅ Successfully connected to AWS S3!');
    console.log('\nBuckets found:');
    response.Buckets.forEach(bucket => {
      console.log(`  - ${bucket.Name} (Created: ${bucket.CreationDate})`);
    });
    
    // Check if our target bucket exists
    const targetBucket = process.env.AWS_S3_BUCKET;
    const bucketExists = response.Buckets.some(b => b.Name === targetBucket);
    
    console.log(`\nTarget bucket "${targetBucket}": ${bucketExists ? '✅ Found' : '❌ Not found'}`);
    
  } catch (error) {
    console.error('❌ Failed to connect to S3:');
    console.error('Error:', error.message);
    if (error.Code) {
      console.error('Error Code:', error.Code);
    }
  }
}

testConnection();