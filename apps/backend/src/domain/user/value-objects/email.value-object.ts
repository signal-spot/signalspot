import { InvalidValueObjectException } from '../../shared/exceptions/domain.exception';

export class Email {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email;
  }

  static create(email: string): Email {
    if (!email) {
      throw new InvalidValueObjectException('Email', 'Email is required');
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    if (!this.isValidFormat(trimmedEmail)) {
      throw new InvalidValueObjectException('Email', 'Invalid email format');
    }

    if (this.isDisposableEmail(trimmedEmail)) {
      throw new InvalidValueObjectException('Email', 'Disposable email addresses are not allowed');
    }

    return new Email(trimmedEmail);
  }

  private static isValidFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isDisposableEmail(email: string): boolean {
    const disposableDomains = ['tempmail.org', '10minutemail.com', 'guerrillamail.com'];
    const domain = email.split('@')[1];
    return disposableDomains.includes(domain);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  getDomain(): string {
    return this.value.split('@')[1];
  }

  toString(): string {
    return this.value;
  }

  getValue(): string {
    return this.value;
  }
}