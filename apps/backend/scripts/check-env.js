#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('================================================');
console.log('  SignalSpot Environment Check');
console.log('================================================\n');

// Check NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
console.log(`NODE_ENV: ${nodeEnv}`);
console.log(`Current Directory: ${process.cwd()}`);
console.log('');

// Determine which env file will be used
const envFiles = {
  production: ['.env.production', '.env'],
  development: ['.env.development', '.env.local', '.env'],
};

const filesToCheck = envFiles[nodeEnv] || envFiles.development;

console.log('Environment Files Priority Order:');
filesToCheck.forEach((file, index) => {
  const filePath = path.join(process.cwd(), file);
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅ EXISTS' : '❌ NOT FOUND';
  console.log(`  ${index + 1}. ${file}: ${status}`);
  
  if (exists && index === 0) {
    console.log(`     ^ This will be the primary config file`);
  }
});

console.log('\n================================================');
console.log('  Database Configuration');
console.log('================================================');

// Load the appropriate env file
require('dotenv').config({ 
  path: nodeEnv === 'production' ? '.env.production' : '.env.development' 
});

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '5432',
  database: process.env.DB_DATABASE || process.env.DB_NAME || 'signalspot',
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD ? '***hidden***' : 'not set',
};

console.log(`  Host: ${dbConfig.host}`);
console.log(`  Port: ${dbConfig.port}`);
console.log(`  Database: ${dbConfig.database}`);
console.log(`  Username: ${dbConfig.username}`);
console.log(`  Password: ${dbConfig.password}`);

console.log('\n================================================');
console.log('  Redis Configuration');
console.log('================================================');

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || '6379',
  password: process.env.REDIS_PASSWORD ? '***hidden***' : 'not set',
};

console.log(`  Host: ${redisConfig.host}`);
console.log(`  Port: ${redisConfig.port}`);
console.log(`  Password: ${redisConfig.password}`);

console.log('\n================================================');
console.log('  Application Configuration');
console.log('================================================');

console.log(`  Port: ${process.env.PORT || '3000'}`);
console.log(`  WebSocket Port: ${process.env.WEBSOCKET_PORT || '3001'}`);
console.log(`  JWT Secret: ${process.env.JWT_SECRET ? '***hidden***' : 'not set'}`);
console.log(`  Firebase: ${process.env.FIREBASE_SERVICE_ACCOUNT ? 'configured' : 'not configured'}`);

console.log('\n================================================');
console.log('  How to Run');
console.log('================================================');

console.log('Development:');
console.log('  npm run dev           # Uses .env.development');
console.log('  npm run start:dev     # Uses .env.development');
console.log('');
console.log('Production:');
console.log('  npm run prod          # Uses .env.production');
console.log('  npm run start:prod    # Uses .env.production');
console.log('');
console.log('Docker:');
console.log('  docker-compose -f docker-compose.production.yml up');
console.log('  # Uses .env.production for both Postgres and Redis');
console.log('');