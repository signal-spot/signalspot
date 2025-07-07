import {
  Controller,
  Post,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UploadService, ProcessedImage, UploadResult } from './upload.service';
import { RateLimitGuard, RateLimit } from '../common/guards/rate-limit.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../entities/user.entity';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('profile-image')
  @UseGuards(AuthGuard('jwt'), RateLimitGuard)
  @RateLimit({ max: 5, windowMs: 60 * 1000 }) // 5 uploads per minute
  @UseInterceptors(FileInterceptor('image', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload profile image' })
  @ApiResponse({
    status: 201,
    description: 'Profile image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        originalUrl: { type: 'string' },
        thumbnailUrl: { type: 'string' },
        mediumUrl: { type: 'string' },
        largeUrl: { type: 'string' },
        originalSize: { type: 'number' },
        dimensions: {
          type: 'object',
          properties: {
            width: { type: 'number' },
            height: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large' })
  @ApiResponse({ status: 429, description: 'Too many upload requests' })
  async uploadProfileImage(
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ProcessedImage> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    return this.uploadService.processProfileImage(file);
  }

  @Post('file')
  @UseGuards(AuthGuard('jwt'), RateLimitGuard)
  @RateLimit({ max: 10, windowMs: 60 * 1000 }) // 10 uploads per minute
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB for general files
    },
  }))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload general file' })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        filename: { type: 'string' },
        originalName: { type: 'string' },
        size: { type: 'number' },
        mimeType: { type: 'string' },
        uploadedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large' })
  @ApiResponse({ status: 429, description: 'Too many upload requests' })
  async uploadFile(
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.uploadService.uploadFile(file);
  }

  @Delete('file/:filename')
  @UseGuards(AuthGuard('jwt'), RateLimitGuard)
  @RateLimit({ max: 20, windowMs: 60 * 1000 }) // 20 deletions per minute
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete uploaded file' })
  @ApiResponse({ status: 204, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 429, description: 'Too many delete requests' })
  async deleteFile(
    @GetUser() user: User,
    @Param('filename') filename: string,
  ): Promise<void> {
    await this.uploadService.deleteFile(filename);
  }

  @Delete('profile-image/:baseFilename')
  @UseGuards(AuthGuard('jwt'), RateLimitGuard)
  @RateLimit({ max: 10, windowMs: 60 * 1000 }) // 10 deletions per minute
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete profile image set (all sizes)' })
  @ApiResponse({ status: 204, description: 'Profile image set deleted successfully' })
  @ApiResponse({ status: 429, description: 'Too many delete requests' })
  async deleteProfileImageSet(
    @GetUser() user: User,
    @Param('baseFilename') baseFilename: string,
  ): Promise<void> {
    await this.uploadService.deleteProfileImageSet(baseFilename);
  }

  @Post('validate-image')
  @UseGuards(AuthGuard('jwt'), RateLimitGuard)
  @RateLimit({ max: 20, windowMs: 60 * 1000 }) // 20 validations per minute
  @UseInterceptors(FileInterceptor('image', {
    limits: {
      fileSize: 1024 * 1024, // 1MB for validation
    },
  }))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Validate image file without uploading' })
  @ApiResponse({
    status: 200,
    description: 'Image validation result',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        message: { type: 'string' },
        fileInfo: {
          type: 'object',
          properties: {
            size: { type: 'number' },
            mimeType: { type: 'string' },
            isImage: { type: 'boolean' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 429, description: 'Too many validation requests' })
  async validateImage(
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{
    valid: boolean;
    message: string;
    fileInfo?: {
      size: number;
      mimeType: string;
      isImage: boolean;
    };
  }> {
    if (!file) {
      return {
        valid: false,
        message: 'No file provided',
      };
    }

    try {
      const isImage = this.uploadService.isImageFile(file.mimetype);
      const maxSize = this.uploadService.getMaxFileSize();

      if (!isImage) {
        return {
          valid: false,
          message: 'File is not a valid image type',
          fileInfo: {
            size: file.size,
            mimeType: file.mimetype,
            isImage: false,
          },
        };
      }

      if (file.size > maxSize) {
        return {
          valid: false,
          message: `File size ${file.size} exceeds maximum allowed size ${maxSize}`,
          fileInfo: {
            size: file.size,
            mimeType: file.mimetype,
            isImage: true,
          },
        };
      }

      return {
        valid: true,
        message: 'Image is valid',
        fileInfo: {
          size: file.size,
          mimeType: file.mimetype,
          isImage: true,
        },
      };
    } catch (error) {
      return {
        valid: false,
        message: error.message || 'Image validation failed',
        fileInfo: {
          size: file.size,
          mimeType: file.mimetype,
          isImage: false,
        },
      };
    }
  }

  @Post('upload-info')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get upload configuration info' })
  @ApiResponse({
    status: 200,
    description: 'Upload configuration information',
    schema: {
      type: 'object',
      properties: {
        maxFileSize: { type: 'number' },
        allowedImageTypes: { type: 'array', items: { type: 'string' } },
        uploadLimits: {
          type: 'object',
          properties: {
            profileImage: { type: 'string' },
            generalFile: { type: 'string' },
          },
        },
      },
    },
  })
  async getUploadInfo(): Promise<{
    maxFileSize: number;
    allowedImageTypes: string[];
    uploadLimits: {
      profileImage: string;
      generalFile: string;
    };
  }> {
    return {
      maxFileSize: this.uploadService.getMaxFileSize(),
      allowedImageTypes: this.uploadService.getAllowedImageTypes(),
      uploadLimits: {
        profileImage: '5MB',
        generalFile: '10MB',
      },
    };
  }
}