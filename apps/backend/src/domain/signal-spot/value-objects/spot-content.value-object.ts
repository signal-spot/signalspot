import { InvalidValueObjectException } from '../../shared/exceptions/domain.exception';

export class SpotContent {
  private readonly title: string;
  private readonly description: string;

  private constructor(title: string, description: string) {
    this.title = title;
    this.description = description;
  }

  static create(title: string, description: string): SpotContent {
    if (!title || title.trim().length === 0) {
      throw new InvalidValueObjectException('SpotContent', 'Title is required');
    }

    if (title.trim().length < 3 || title.trim().length > 100) {
      throw new InvalidValueObjectException('SpotContent', 'Title must be between 3 and 100 characters');
    }

    if (!description || description.trim().length === 0) {
      throw new InvalidValueObjectException('SpotContent', 'Description is required');
    }

    if (description.trim().length < 10 || description.trim().length > 500) {
      throw new InvalidValueObjectException('SpotContent', 'Description must be between 10 and 500 characters');
    }

    if (this.containsInappropriateContent(title) || this.containsInappropriateContent(description)) {
      throw new InvalidValueObjectException('SpotContent', 'Content contains inappropriate language');
    }

    return new SpotContent(title.trim(), description.trim());
  }

  private static containsInappropriateContent(content: string): boolean {
    const inappropriateWords = ['spam', 'scam', 'fraud']; // 실제로는 더 많은 단어들
    const lowerContent = content.toLowerCase();
    return inappropriateWords.some(word => lowerContent.includes(word));
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string {
    return this.description;
  }

  getPreview(maxLength: number = 50): string {
    return this.description.length > maxLength 
      ? this.description.substring(0, maxLength) + '...'
      : this.description;
  }

  getWordCount(): number {
    return this.description.split(/\s+/).length;
  }

  equals(other: SpotContent): boolean {
    return this.title === other.title && this.description === other.description;
  }
}