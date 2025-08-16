import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

/**
 * Strict validation pipe with sanitization and security checks
 */
@Injectable()
export class StrictValidationPipe implements PipeTransform<any> {
  private readonly forbiddenPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /data:text\/html/gi,
  ];
  
  private readonly sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b)/gi,
    /(--|\||;|\/\*|\*\/|xp_|sp_|0x)/gi,
    /(\bOR\b\s*\d+\s*=\s*\d+)/gi,
    /(\bAND\b\s*\d+\s*=\s*\d+)/gi,
  ];
  
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    
    // Sanitize input
    const sanitized = this.sanitizeInput(value);
    
    // Check for malicious patterns
    this.checkForMaliciousPatterns(sanitized);
    
    // Transform to class instance
    const object = plainToInstance(metatype, sanitized, {
      enableImplicitConversion: true,
      excludeExtraneousValues: true,
    });
    
    // Validate
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      validationError: {
        target: false,
        value: false,
      },
    });
    
    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }
    
    return object;
  }
  
  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
  
  private sanitizeInput(value: any): any {
    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }
    
    if (Array.isArray(value)) {
      return value.map(item => this.sanitizeInput(item));
    }
    
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = {};
      for (const [key, val] of Object.entries(value)) {
        // Sanitize key
        const sanitizedKey = this.sanitizeString(key);
        
        // Check for prototype pollution
        if (sanitizedKey === '__proto__' || 
            sanitizedKey === 'constructor' || 
            sanitizedKey === 'prototype') {
          continue;
        }
        
        sanitized[sanitizedKey] = this.sanitizeInput(val);
      }
      return sanitized;
    }
    
    return value;
  }
  
  private sanitizeString(str: string): string {
    if (typeof str !== 'string') {
      return str;
    }
    
    // Remove null bytes
    let sanitized = str.replace(/\0/g, '');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Sanitize HTML (allow only safe tags)
    sanitized = sanitizeHtml(sanitized, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      allowedAttributes: {
        'a': ['href'],
      },
      allowedSchemes: ['http', 'https'],
      disallowedTagsMode: 'discard',
    });
    
    // Remove control characters except newlines and tabs
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    return sanitized;
  }
  
  private checkForMaliciousPatterns(value: any): void {
    const valueStr = JSON.stringify(value);
    
    // Check for XSS patterns
    for (const pattern of this.forbiddenPatterns) {
      if (pattern.test(valueStr)) {
        throw new BadRequestException('Potentially malicious content detected');
      }
    }
    
    // Check for SQL injection patterns
    for (const pattern of this.sqlInjectionPatterns) {
      if (pattern.test(valueStr)) {
        throw new BadRequestException('Invalid characters detected in input');
      }
    }
    
    // Check for NoSQL injection patterns
    if (valueStr.includes('$where') || 
        valueStr.includes('$regex') || 
        valueStr.includes('mapReduce')) {
      throw new BadRequestException('Invalid query operators detected');
    }
  }
  
  private formatErrors(errors: any[]): any {
    const formatted: any = {};
    
    for (const error of errors) {
      const property = error.property;
      
      formatted[property] = {
        value: error.value,
        constraints: error.constraints,
        children: error.children?.length 
          ? this.formatErrors(error.children)
          : undefined,
      };
    }
    
    return formatted;
  }
}

/**
 * Options for strict validation
 */
export interface StrictValidationOptions {
  transform?: boolean;
  disableErrorMessages?: boolean;
  whitelist?: boolean;
  forbidNonWhitelisted?: boolean;
  groups?: string[];
  dismissDefaultMessages?: boolean;
  validationError?: {
    target?: boolean;
    value?: boolean;
  };
  forbidUnknownValues?: boolean;
  stopAtFirstError?: boolean;
}