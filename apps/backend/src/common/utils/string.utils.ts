export class StringUtils {
  /**
   * Truncate string with ellipsis
   */
  static truncate(str: string, maxLength: number, suffix = '...'): string {
    if (!str || str.length <= maxLength) {
      return str;
    }
    return str.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Generate random string
   */
  static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Sanitize string for safe display
   */
  static sanitize(str: string): string {
    if (!str) return '';
    return str
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Convert string to slug
   */
  static toSlug(str: string): string {
    if (!str) return '';
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s가-힣-]/g, '') // Keep Korean chars, alphanumeric, spaces, and hyphens
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
  }

  /**
   * Extract hashtags from string
   */
  static extractHashtags(str: string): string[] {
    if (!str) return [];
    const regex = /#[^\s#]+/g;
    const matches = str.match(regex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  }

  /**
   * Extract mentions from string
   */
  static extractMentions(str: string): string[] {
    if (!str) return [];
    const regex = /@[^\s@]+/g;
    const matches = str.match(regex);
    return matches ? matches.map(mention => mention.substring(1)) : [];
  }

  /**
   * Mask sensitive data
   */
  static maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email;
    const [name, domain] = email.split('@');
    const maskedName = name.length > 2 
      ? name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
      : name[0] + '*';
    return `${maskedName}@${domain}`;
  }

  /**
   * Mask phone number
   */
  static maskPhoneNumber(phone: string): string {
    if (!phone) return phone;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) return phone;
    
    const lastFour = cleaned.slice(-4);
    const masked = '*'.repeat(cleaned.length - 4) + lastFour;
    
    // Format as Korean phone number if it starts with 82 or is 11 digits
    if (cleaned.startsWith('82')) {
      return `+82-**-****-${lastFour}`;
    } else if (cleaned.length === 11) {
      return `***-****-${lastFour}`;
    }
    
    return masked;
  }

  /**
   * Capitalize first letter
   */
  static capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Check if string is valid UUID
   */
  static isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Parse JSON safely
   */
  static parseJSON<T = any>(str: string, defaultValue: T | null = null): T | null {
    try {
      return JSON.parse(str);
    } catch {
      return defaultValue;
    }
  }
}