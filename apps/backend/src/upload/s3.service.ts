import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../common/services/logger.service';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export interface S3UploadResult {
  url: string;
  key: string;
  bucket: string;
  etag?: string;
  size: number;
  mimeType: string;
}

export interface S3ProcessedImage {
  originalUrl: string;
  thumbnailUrl: string;
  mediumUrl: string;
  largeUrl: string;
  originalSize: number;
  dimensions: {
    width: number;
    height: number;
  };
}

@Injectable()
export class S3Service {

  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly maxFileSize: number;
  private readonly allowedImageTypes: string[];

  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService
  ) {
    this.region = this.configService.get('AWS_REGION', 'ap-northeast-2');
    this.bucketName = this.configService.get('AWS_S3_BUCKET', 'dearglobe');
    this.maxFileSize = parseInt(this.configService.get('MAX_FILE_SIZE', '10485760')); // 10MB
    this.allowedImageTypes = this.configService.get('ALLOWED_IMAGE_TYPES', 'image/jpeg,image/png,image/webp,image/gif').split(',');

    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID', '');
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY', '');
    
    // Check if AWS credentials are configured
    if (!accessKeyId || !secretAccessKey) {
      this.loggerService.warn('AWS credentials not configured. S3 uploads will fail.', 'S3Service');
      this.loggerService.warn(`AWS_ACCESS_KEY_ID is ${accessKeyId ? 'set' : 'not set'}`, 'S3Service');
      this.loggerService.warn(`AWS_SECRET_ACCESS_KEY is ${secretAccessKey ? 'set' : 'not set'}`, 'S3Service');
    }

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.loggerService.log(`S3 Service initialized for bucket: ${this.bucketName} in region: ${this.region}`, 'S3Service');
  }

  async uploadProfileImage(file: Express.Multer.File, userId: string): Promise<S3ProcessedImage> {
    this.loggerService.logWithUser('S3Service.uploadProfileImage called', userId, 'S3Service');
    
    // Log file details for debugging
    this.loggerService.debug(`File details - Name: ${file.originalname}, Size: ${file.size}, Type: ${file.mimetype}`, 'S3Service');
    this.loggerService.debug(`Bucket: ${this.bucketName}, Region: ${this.region}`, 'S3Service');
    
    this.validateImageFile(file);

    const fileId = uuidv4();
    const timestamp = Date.now();
    const imageFolder = this.configService.get('AWS_S3_IMAGE_FOLDER', 'signalspot/');
    const baseKey = `${imageFolder}profiles/${userId}/${timestamp}_${fileId}`;

    try {
      // Debug: Check if Sharp is available
      this.loggerService.debug(`Processing image with Sharp...`, 'S3Service');
      
      // Process the image with sharp
      let imageBuffer: Buffer;
      try {
        imageBuffer = await sharp(file.buffer)
          .jpeg({ quality: 90 })
          .toBuffer();
        this.loggerService.debug(`Sharp processing successful, buffer size: ${imageBuffer.length}`, 'S3Service');
      } catch (sharpError) {
        this.loggerService.error('Sharp processing failed:', sharpError.message, 'S3Service');
        throw new Error(`Image processing failed: ${sharpError.message}`);
      }

      const metadata = await sharp(imageBuffer).metadata();

      // Generate different sizes
      const sizes = {
        original: { buffer: imageBuffer, suffix: '' },
        thumbnail: { 
          buffer: await sharp(imageBuffer)
            .resize(150, 150, { fit: 'cover', position: 'center' })
            .jpeg({ quality: 85 })
            .toBuffer(),
          suffix: '_thumb'
        },
        medium: {
          buffer: await sharp(imageBuffer)
            .resize(400, 400, { fit: 'cover', position: 'center' })
            .jpeg({ quality: 85 })
            .toBuffer(),
          suffix: '_medium'
        },
        large: {
          buffer: await sharp(imageBuffer)
            .resize(800, 800, { fit: 'cover', position: 'center' })
            .jpeg({ quality: 85 })
            .toBuffer(),
          suffix: '_large'
        },
      };

      const uploadedUrls: Record<string, string> = {};

      // Upload all sizes to S3
      for (const [sizeName, sizeData] of Object.entries(sizes)) {
        const key = `${baseKey}${sizeData.suffix}.jpg`;
        
        this.loggerService.debug(`Uploading ${sizeName} to S3 with key: ${key}`, 'S3Service');
        
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: sizeData.buffer,
          ContentType: 'image/jpeg',
          Metadata: {
            userId,
            originalName: file.originalname,
            size: sizeName,
          },
        });

        try {
          const uploadResult = await this.s3Client.send(command);
          this.loggerService.debug(`S3 upload response for ${sizeName}: ${JSON.stringify(uploadResult.$metadata)}`, 'S3Service');
        } catch (s3Error) {
          this.loggerService.error(`S3 upload failed for ${sizeName}:`, s3Error.message, 'S3Service');
          if (s3Error.$metadata) {
            this.loggerService.error(`S3 Error Metadata: ${JSON.stringify(s3Error.$metadata)}`, 'S3Service');
          }
          throw s3Error;
        }
        uploadedUrls[sizeName] = this.getPublicUrl(key);
        
        this.loggerService.debug(`Uploaded ${sizeName} image to S3: ${key}`, 'S3Service');
      }

      const result = {
        originalUrl: uploadedUrls.original,
        thumbnailUrl: uploadedUrls.thumbnail,
        mediumUrl: uploadedUrls.medium,
        largeUrl: uploadedUrls.large,
        originalSize: file.size,
        dimensions: {
          width: metadata.width || 0,
          height: metadata.height || 0,
        },
      };
      
      this.loggerService.debug('S3Service.uploadProfileImage completed successfully', 'S3Service');
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      const errorStack = error?.stack || 'No stack trace available';
      const errorName = error?.name || 'UnknownError';
      
      this.loggerService.error('Error uploading profile image to S3', errorMessage, 'S3Service');
      this.loggerService.error('S3 Upload Error Details:', errorStack, 'S3Service');
      this.loggerService.error('AWS Error Name:', errorName, 'S3Service');
      
      // Log AWS specific error details
      if (error?.$metadata) {
        this.loggerService.error('AWS Error Metadata:', JSON.stringify(error.$metadata), 'S3Service');
      }
      
      // Log the full error object for debugging
      this.loggerService.error('Full error object:', JSON.stringify(error, null, 2), 'S3Service');
      
      throw new InternalServerErrorException('Failed to upload profile image');
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general',
    userId?: string,
  ): Promise<S3UploadResult> {
    this.validateFile(file);

    const fileId = uuidv4();
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const imageFolder = this.configService.get('AWS_S3_IMAGE_FOLDER', 'signalspot/');
    const key = userId 
      ? `${imageFolder}${folder}/${userId}/${fileId}${fileExtension}`
      : `${imageFolder}${folder}/${fileId}${fileExtension}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          ...(userId && { userId }),
        },
      });

      const response = await this.s3Client.send(command);
      
      this.loggerService.log(`File uploaded to S3: ${key}`, 'S3Service');

      return {
        url: this.getPublicUrl(key),
        key,
        bucket: this.bucketName,
        etag: response.ETag,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      this.loggerService.error('Error uploading file to S3', error.message, 'S3Service');
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.loggerService.log(`File deleted from S3: ${key}`, 'S3Service');
    } catch (error) {
      this.loggerService.error(`Error deleting file from S3: ${key}`, error.message, 'S3Service');
      // Don't throw error for file deletion failures
    }
  }

  async deleteProfileImageSet(userId: string, timestamp: string, fileId: string): Promise<void> {
    const imageFolder = this.configService.get('AWS_S3_IMAGE_FOLDER', 'signalspot/');
    const baseKey = `${imageFolder}profiles/${userId}/${timestamp}_${fileId}`;
    const suffixes = ['', '_thumb', '_medium', '_large'];

    for (const suffix of suffixes) {
      try {
        await this.deleteFile(`${baseKey}${suffix}.jpg`);
      } catch (error) {
        // Ignore errors for non-existent files
      }
    }
  }

  async getSignedUploadUrl(
    fileName: string,
    fileType: string,
    folder: string = 'temp',
    userId?: string,
    expiresIn: number = 3600,
  ): Promise<{ uploadUrl: string; key: string }> {
    const fileId = uuidv4();
    const fileExtension = path.extname(fileName).toLowerCase();
    const imageFolder = this.configService.get('AWS_S3_IMAGE_FOLDER', 'signalspot/');
    const key = userId
      ? `${imageFolder}${folder}/${userId}/${fileId}${fileExtension}`
      : `${imageFolder}${folder}/${fileId}${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: fileType,
      Metadata: {
        originalName: fileName,
        ...(userId && { userId }),
      },
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

    return { uploadUrl, key };
  }

  async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async checkFileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  private validateImageFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size ${file.size} exceeds maximum allowed size ${this.maxFileSize}`,
      );
    }

    if (!this.allowedImageTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedImageTypes.join(', ')}`,
      );
    }

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        `File extension ${fileExtension} is not allowed`,
      );
    }
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size ${file.size} exceeds maximum allowed size ${this.maxFileSize}`,
      );
    }
  }

  private getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  extractKeyFromUrl(url: string): string | null {
    try {
      const urlPattern = new RegExp(
        `https://${this.bucketName}\\.s3\\.${this.region}\\.amazonaws\\.com/(.+)`,
      );
      const match = url.match(urlPattern);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
}