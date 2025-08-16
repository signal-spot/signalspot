export class DateUtils {
  /**
   * Format date to Korean time string
   */
  static toKoreanTimeString(date: Date): string {
    return date.toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * Get relative time string (e.g., "2시간 전", "3일 전")
   */
  static getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
      return `${years}년 전`;
    } else if (months > 0) {
      return `${months}개월 전`;
    } else if (days > 0) {
      return `${days}일 전`;
    } else if (hours > 0) {
      return `${hours}시간 전`;
    } else if (minutes > 0) {
      return `${minutes}분 전`;
    } else {
      return '방금 전';
    }
  }

  /**
   * Add hours to a date
   */
  static addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }

  /**
   * Add days to a date
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Check if date is expired
   */
  static isExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate;
  }

  /**
   * Get start of day
   */
  static getStartOfDay(date: Date = new Date()): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Get end of day
   */
  static getEndOfDay(date: Date = new Date()): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Format duration in milliseconds to human readable string
   */
  static formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}일 ${hours % 24}시간`;
    } else if (hours > 0) {
      return `${hours}시간 ${minutes % 60}분`;
    } else if (minutes > 0) {
      return `${minutes}분 ${seconds % 60}초`;
    } else {
      return `${seconds}초`;
    }
  }

  /**
   * Parse ISO string to Date safely
   */
  static parseISO(dateString: string): Date | null {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }
}