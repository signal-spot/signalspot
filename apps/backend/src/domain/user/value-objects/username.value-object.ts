import { InvalidValueObjectException } from '../../shared/exceptions/domain.exception';

export class Username {
  private readonly value: string;

  private constructor(username: string) {
    this.value = username;
  }

  static create(username: string): Username {
    if (!username) {
      throw new InvalidValueObjectException('Username', 'Username is required');
    }

    const trimmedUsername = username.trim();
    
    if (trimmedUsername.length < 2 || trimmedUsername.length > 30) {
      throw new InvalidValueObjectException('Username', 'Username must be between 2 and 30 characters');
    }

    if (this.isReserved(trimmedUsername)) {
      throw new InvalidValueObjectException('Username', 'This username is reserved');
    }

    return new Username(trimmedUsername);
  }

  private static isValidFormat(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return usernameRegex.test(username);
  }

  private static isReserved(username: string): boolean {
    const reservedUsernames = ['admin', 'root', 'api', 'www', 'mail', 'ftp', 'localhost', 'signalspot'];
    return reservedUsernames.includes(username.toLowerCase());
  }

  equals(other: Username): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  getValue(): string {
    return this.value;
  }
}