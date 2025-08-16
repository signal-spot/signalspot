import { registerAs } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { LoggerService } from '../common/services/logger.service';

export default registerAs('firebase', () => {
  const logger = new LoggerService();
  
  // Get service account filename from env or use default pattern
  const serviceAccountFileName = process.env.FIREBASE_SERVICE_ACCOUNT_FILE || 'firebase-service-account.json';
  
  // Try multiple paths to find the service account file
  const possiblePaths = [
    // Relative paths
    path.join(__dirname, '..', '..', serviceAccountFileName),
    path.join(process.cwd(), 'apps', 'backend', serviceAccountFileName),
    path.join(process.cwd(), serviceAccountFileName),
    // Environment variable for absolute path
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
  ].filter(Boolean); // Remove undefined values
  
  let serviceAccount = null;
  let foundPath = null;
  
  for (const serviceAccountPath of possiblePaths) {
    if (fs.existsSync(serviceAccountPath)) {
      try {
        const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
        serviceAccount = JSON.parse(fileContent);
        foundPath = serviceAccountPath;
        
        // Validate required fields
        if (!serviceAccount.private_key || serviceAccount.private_key === '') {
          logger.error(`Firebase service account at ${serviceAccountPath} has empty or missing private_key`, null, 'FirebaseConfig');
          serviceAccount = null;
          continue;
        }
        
        // Check if private_key is a placeholder
        if (serviceAccount.private_key.includes('-----BEGIN') === false) {
          logger.error(`Firebase service account at ${serviceAccountPath} has invalid private_key format`, null, 'FirebaseConfig');
          serviceAccount = null;
          continue;
        }
        
        logger.log(`Firebase service account loaded from: ${serviceAccountPath}`, 'FirebaseConfig');
        break;
      } catch (error) {
        logger.error(`Failed to parse Firebase service account file at ${serviceAccountPath}`, error.stack, 'FirebaseConfig');
      }
    }
  }
  
  if (!serviceAccount) {
    logger.warn('Firebase service account file not found in any of the expected paths', 'FirebaseConfig');
    
    // Fallback to environment variable if file doesn't exist
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        logger.log('Firebase service account loaded from environment variable', 'FirebaseConfig');
      } catch (error) {
        logger.error('Failed to parse FIREBASE_SERVICE_ACCOUNT env variable', error.stack, 'FirebaseConfig');
      }
    }
  }

  const config = {
    projectId: serviceAccount?.project_id || process.env.FIREBASE_PROJECT_ID,
    serviceAccount,
    enabled: process.env.ENABLE_PUSH_NOTIFICATIONS !== 'false', // Default to enabled
  };
  
  if (serviceAccount) {
    logger.log(`Firebase config loaded successfully. Project ID: ${config.projectId}`, 'FirebaseConfig');
  } else {
    logger.warn('Firebase service account not configured. Push notifications will be disabled.', 'FirebaseConfig');
  }
  
  return config;
});