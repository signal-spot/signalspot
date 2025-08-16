# S3 Upload Debugging Tips

## Common Issues and Solutions

### 1. AWS Credentials Not Configured
- Check if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set in .env file
- Verify the credentials are valid and have S3 permissions
- Check the bucket name and region configuration

### 2. S3 Bucket Permissions
- Ensure the AWS IAM user has the following permissions:
  - s3:PutObject
  - s3:PutObjectAcl
  - s3:GetObject
  - s3:DeleteObject
- Check bucket policy allows uploads from the IAM user

### 3. File Upload Issues
- Verify file buffer is properly received
- Check file size limits
- Validate file type restrictions
- Ensure Sharp library is installed for image processing

### 4. Logging Improvements Added
- AWS credential validation on startup
- Detailed file information logging
- AWS error metadata capture
- S3 configuration logging (bucket, region)

## Environment Variables Required
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=your_bucket_name
AWS_S3_IMAGE_FOLDER=signalspot/
```

## Testing S3 Upload
1. Check server logs for AWS credential warnings on startup
2. Monitor logs when uploading a file for detailed error messages
3. Verify the S3 bucket exists and is accessible
4. Test with a small JPEG image first