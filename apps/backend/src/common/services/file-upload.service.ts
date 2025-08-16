import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Express } from 'express';
import 'multer';
import { LoggerService } from './logger.service';

export interface FileUploadResult {
  url: string;
  fileName: string;
  originalName: string;
  size: number;
  mimeType: string;
  path: string;
}

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  crop?: boolean;
  blur?: boolean;
}

export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  requireImage?: boolean;
}

/**
 * Service for handling file uploads with image processing and validation
 */
@Injectable()
export class FileUploadService {
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedImageTypes: string[];
  private readonly allowedImageExtensions: string[];

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService
  ) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR') || 'uploads';
    this.maxFileSize = this.configService.get<number>('MAX_FILE_SIZE') || 10 * 1024 * 1024; // 10MB
    this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    this.allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    
    // Ensure upload directory exists
    this.ensureUploadDirectory();
  }

  /**
   * Uploads a file with validation and processing
   */
  async uploadFile(
    file: Express.Multer.File,
    options: FileValidationOptions = {},
    folder = 'general'
  ): Promise<FileUploadResult> {
    // Validate file
    this.validateFile(file, options);

    // Generate unique filename
    const fileName = this.generateFileName(file.originalname);
    const folderPath = path.join(this.uploadDir, folder);
    const filePath = path.join(folderPath, fileName);

    // Ensure folder exists
    await this.ensureDirectoryExists(folderPath);

    // Write file to disk
    await fs.promises.writeFile(filePath, file.buffer);

    // Generate public URL
    const url = this.generatePublicUrl(folder, fileName);

    return {
      url,
      fileName,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      path: filePath,
    };
  }

  /**
   * Uploads and processes a profile image
   */
  async uploadProfileImage(
    file: Express.Multer.File,
    userId: string,
    options: ImageProcessingOptions = {}
  ): Promise<FileUploadResult> {
    // Validate image file
    this.validateFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB for profile images
      allowedMimeTypes: this.allowedImageTypes,
      allowedExtensions: this.allowedImageExtensions,
      requireImage: true,
    });

    // Process image with default profile image settings
    const processedFile = await this.processImage(file);

    // Upload processed image
    const result = await this.uploadFile(processedFile, {}, `profiles/${userId}`);

    return result;
  }

  /**
   * Uploads a verification document
   */
  async uploadVerificationDocument(
    file: Express.Multer.File,
    userId: string
  ): Promise<FileUploadResult> {
    // Validate document file
    this.validateFile(file, {
      maxSize: 10 * 1024 * 1024, // 10MB for documents
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.doc', '.docx'],
    });

    // Upload document
    const result = await this.uploadFile(file, {}, `verification/${userId}`);

    return result;
  }

  /**
   * Deletes a file from storage
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(this.uploadDir, filePath);
      await fs.promises.unlink(fullPath);
    } catch (error) {
      // File might not exist, which is fine
      this.logger.warn(`Failed to delete file: ${filePath}`, 'FileUploadService');
    }
  }

  /**
   * Processes an image with the given options
   */
  private async processImage(
    file: Express.Multer.File
  ): Promise<Express.Multer.File> {
    // For now, return the original file
    // In a real implementation, you would use a library like sharp or jimp
    // to resize, crop, and optimize the image
    
    // TODO: Implement actual image processing
    // This is a placeholder implementation
    return file;
  }

  /**
   * Validates a file against the given options
   */
  private validateFile(file: Express.Multer.File, options: FileValidationOptions): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check file size
    const maxSize = options.maxSize || this.maxFileSize;
    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds maximum of ${maxSize} bytes`);
    }

    // Check MIME type
    if (options.allowedMimeTypes && !options.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
    }

    // Check file extension
    if (options.allowedExtensions) {
      const extension = path.extname(file.originalname).toLowerCase();
      if (!options.allowedExtensions.includes(extension)) {
        throw new BadRequestException(`File extension ${extension} is not allowed`);
      }
    }

    // Check if image is required
    if (options.requireImage && !file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    // Additional security checks
    this.performSecurityChecks(file);
  }

  /**
   * Performs security checks on the uploaded file
   */
  private performSecurityChecks(file: Express.Multer.File): void {
    // Check for malicious file names
    if (this.containsMaliciousPatterns(file.originalname)) {
      throw new BadRequestException('File name contains malicious patterns');
    }

    // Check file content (basic check)
    if (this.containsMaliciousContent(file.buffer)) {
      throw new BadRequestException('File contains malicious content');
    }
  }

  /**
   * Checks if filename contains malicious patterns
   */
  private containsMaliciousPatterns(filename: string): boolean {
    const maliciousPatterns = [
      /\.\./,           // Directory traversal
      /[<>:"|?*]/,      // Invalid characters
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Reserved names
      /\.(exe|bat|cmd|com|pif|scr|vbs|js)$/i,    // Executable extensions
    ];

    return maliciousPatterns.some(pattern => pattern.test(filename));
  }

  /**
   * Checks if file content contains malicious patterns
   */
  private containsMaliciousContent(buffer: Buffer): boolean {
    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1024));
    
    // Check for script tags and other malicious patterns
    const maliciousPatterns = [
      /<script/i,
      /<iframe/i,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i,
    ];

    return maliciousPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Generates a unique filename
   */
  private generateFileName(originalName: string): string {
    const extension = path.extname(originalName);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${random}${extension}`;
  }

  /**
   * Generates a public URL for the file
   */
  private generatePublicUrl(folder: string, fileName: string): string {
    const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
    return `${baseUrl}/uploads/${folder}/${fileName}`;
  }

  /**
   * Ensures the upload directory exists
   */
  private ensureUploadDirectory(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Ensures a directory exists
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.promises.access(dirPath);
    } catch {
      await fs.promises.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Gets file info without downloading
   */
  async getFileInfo(filePath: string): Promise<{
    exists: boolean;
    size?: number;
    mimeType?: string;
    lastModified?: Date;
  }> {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(this.uploadDir, filePath);
      const stats = await fs.promises.stat(fullPath);
      
      return {
        exists: true,
        size: stats.size,
        lastModified: stats.mtime,
        mimeType: this.getMimeTypeFromExtension(path.extname(filePath)),
      };
    } catch {
      return { exists: false };
    }
  }

  /**
   * Gets MIME type from file extension
   */
  private getMimeTypeFromExtension(extension: string): string {
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }
}