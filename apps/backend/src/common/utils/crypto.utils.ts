import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

export class CryptoUtils {
  /**
   * Generate random token
   */
  static generateToken(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate OTP code
   */
  static generateOTP(length = 6): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  /**
   * Hash password
   */
  static async hashPassword(password: string, rounds = 12): Promise<string> {
    return bcrypt.hash(password, rounds);
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate UUID v4
   */
  static generateUUID(): string {
    return crypto.randomUUID();
  }

  /**
   * Create hash from string
   */
  static createHash(data: string, algorithm = 'sha256'): string {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }

  /**
   * Create HMAC
   */
  static createHMAC(data: string, secret: string, algorithm = 'sha256'): string {
    return crypto.createHmac(algorithm, secret).update(data).digest('hex');
  }

  /**
   * Encrypt data using AES
   */
  static encrypt(text: string, secret: string): string {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(secret, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt data using AES
   */
  static decrypt(encryptedData: string, secret: string): string {
    const algorithm = 'aes-256-gcm';
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const key = crypto.scryptSync(secret, 'salt', 32);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate secure random string for tokens
   */
  static generateSecureToken(): string {
    return crypto.randomBytes(48).toString('base64url');
  }

  /**
   * Create verification code (6 digits)
   */
  static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Hash email for privacy
   */
  static hashEmail(email: string): string {
    return this.createHash(email.toLowerCase().trim());
  }

  /**
   * Generate API key
   */
  static generateApiKey(): string {
    const prefix = 'sk_';
    const token = crypto.randomBytes(32).toString('base64url');
    return `${prefix}${token}`;
  }

  /**
   * Verify API key format
   */
  static isValidApiKey(apiKey: string): boolean {
    return /^sk_[A-Za-z0-9_-]{43,}$/.test(apiKey);
  }
}