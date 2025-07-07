import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export interface ProcessedImage {
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

export interface UploadResult {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

@Injectable()
export class UploadService {
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedImageTypes: string[];
  
  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR', 'uploads');
    this.maxFileSize = parseInt(this.configService.get('MAX_FILE_SIZE', '5242880')); // 5MB
    this.allowedImageTypes = this.configService.get('ALLOWED_IMAGE_TYPES', 'image/jpeg,image/png,image/webp').split(',');
  }

  async processProfileImage(file: Express.Multer.File): Promise<ProcessedImage> {
    this.validateImageFile(file);

    const fileId = uuidv4();
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const baseFilename = `profile_${fileId}`;
    
    // Create upload directory if it doesn't exist
    await this.ensureUploadDirectory();

    try {
      // Process the image with sharp
      const imageBuffer = await sharp(file.buffer)
        .jpeg({ quality: 90 })
        .toBuffer();

      const metadata = await sharp(imageBuffer).metadata();
      
      // Generate different sizes
      const sizes = {
        thumbnail: { width: 150, height: 150, suffix: '_thumb' },
        medium: { width: 400, height: 400, suffix: '_medium' },
        large: { width: 800, height: 800, suffix: '_large' },
      };

      const processedImages: Record<string, string> = {};
      
      // Save original
      const originalFilename = `${baseFilename}${fileExtension}`;
      const originalPath = path.join(this.uploadDir, originalFilename);
      await fs.writeFile(originalPath, imageBuffer);
      processedImages.original = originalFilename;

      // Process and save different sizes
      for (const [sizeName, sizeConfig] of Object.entries(sizes)) {
        const processedBuffer = await sharp(imageBuffer)
          .resize(sizeConfig.width, sizeConfig.height, {
            fit: 'cover',
            position: 'center',
          })
          .jpeg({ quality: 85 })
          .toBuffer();

        const sizedFilename = `${baseFilename}${sizeConfig.suffix}.jpg`;
        const sizedPath = path.join(this.uploadDir, sizedFilename);
        await fs.writeFile(sizedPath, processedBuffer);
        processedImages[sizeName] = sizedFilename;
      }

      return {
        originalUrl: this.generateFileUrl(processedImages.original),
        thumbnailUrl: this.generateFileUrl(processedImages.thumbnail),
        mediumUrl: this.generateFileUrl(processedImages.medium),
        largeUrl: this.generateFileUrl(processedImages.large),
        originalSize: file.size,
        dimensions: {
          width: metadata.width || 0,
          height: metadata.height || 0,
        },
      };
    } catch (error) {
      console.error('Error processing image:', error);
      throw new InternalServerErrorException('Failed to process image');
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<UploadResult> {
    this.validateFile(file);

    const fileId = uuidv4();
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const filename = `${fileId}${fileExtension}`;
    
    await this.ensureUploadDirectory();

    try {
      const filePath = path.join(this.uploadDir, filename);
      await fs.writeFile(filePath, file.buffer);

      return {
        url: this.generateFileUrl(filename),
        filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date(),
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      const filePath = path.join(this.uploadDir, filename);
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Don't throw error for file deletion failures
    }
  }

  async deleteProfileImageSet(baseFilename: string): Promise<void> {
    const variations = ['', '_thumb', '_medium', '_large'];
    const extensions = ['.jpg', '.jpeg', '.png', '.webp'];

    for (const variation of variations) {
      for (const ext of extensions) {
        try {
          const filename = `${baseFilename}${variation}${ext}`;
          const filePath = path.join(this.uploadDir, filename);
          await fs.unlink(filePath);
        } catch (error) {
          // Ignore errors for non-existent files
        }
      }
    }
  }

  private validateImageFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size ${file.size} exceeds maximum allowed size ${this.maxFileSize}`
      );
    }

    if (!this.allowedImageTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedImageTypes.join(', ')}`
      );
    }

    // Basic image validation
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        `File extension ${fileExtension} is not allowed`
      );
    }
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size ${file.size} exceeds maximum allowed size ${this.maxFileSize}`
      );
    }
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  private generateFileUrl(filename: string): string {
    const baseUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    return `${baseUrl}/uploads/${filename}`;
  }

  // Utility methods for file validation
  isImageFile(mimetype: string): boolean {
    return this.allowedImageTypes.includes(mimetype);
  }

  getMaxFileSize(): number {
    return this.maxFileSize;
  }

  getAllowedImageTypes(): string[] {
    return [...this.allowedImageTypes];
  }

  // Method to extract base filename from URL for deletion
  extractFilenameFromUrl(url: string): string | null {
    try {
      const urlPath = new URL(url).pathname;
      return path.basename(urlPath);
    } catch {
      return null;
    }
  }

  // Method to get file info
  async getFileInfo(filename: string): Promise<{
    exists: boolean;
    size?: number;
    stats?: any;
  }> {
    try {
      const filePath = path.join(this.uploadDir, filename);
      const stats = await fs.stat(filePath);
      return {
        exists: true,
        size: stats.size,
        stats,
      };
    } catch {
      return { exists: false };
    }
  }
}