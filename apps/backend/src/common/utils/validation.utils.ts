export class ValidationUtils {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate Korean phone number
   */
  static isValidKoreanPhoneNumber(phone: string): boolean {
    const phoneRegex = /^(\+82|0)(10|11|16|17|18|19)-?\d{3,4}-?\d{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('비밀번호는 최소 8자 이상이어야 합니다');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('대문자를 최소 1개 포함해야 합니다');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('소문자를 최소 1개 포함해야 합니다');
    }
    if (!/\d/.test(password)) {
      errors.push('숫자를 최소 1개 포함해야 합니다');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('특수문자를 최소 1개 포함해야 합니다');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate username
   */
  static isValidUsername(username: string): boolean {
    // Allow alphanumeric, Korean characters, underscores, and hyphens
    // Length between 2 and 20 characters
    const usernameRegex = /^[a-zA-Z0-9가-힣_-]{2,20}$/;
    return usernameRegex.test(username);
  }

  /**
   * Validate coordinates
   */
  static isValidCoordinates(lat: number, lng: number): boolean {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  }

  /**
   * Validate URL
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate image file
   */
  static isValidImageFile(filename: string): boolean {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return validExtensions.includes(ext);
  }

  /**
   * Validate file size
   */
  static isValidFileSize(sizeInBytes: number, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return sizeInBytes <= maxSizeInBytes;
  }

  /**
   * Sanitize input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    if (!input) return '';
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  /**
   * Validate age (must be 14 or older)
   */
  static isValidAge(birthDate: Date): boolean {
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return age >= 14;
  }

  /**
   * Validate hex color
   */
  static isValidHexColor(color: string): boolean {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(color);
  }

  /**
   * Check for profanity (basic Korean bad words)
   */
  static containsProfanity(text: string): boolean {
    // This is a basic implementation. In production, use a proper profanity filter service
    const profanityList = [
      '시발', '씨발', '개새끼', '병신', '지랄', '미친', '또라이'
    ];
    
    const lowerText = text.toLowerCase();
    return profanityList.some(word => lowerText.includes(word));
  }

  /**
   * Validate spot radius
   */
  static isValidSpotRadius(radiusInMeters: number): boolean {
    return radiusInMeters > 0 && radiusInMeters <= 1000;
  }

  /**
   * Validate spot duration
   */
  static isValidSpotDuration(durationInHours: number): boolean {
    return durationInHours > 0 && durationInHours <= 168; // Max 1 week
  }
}