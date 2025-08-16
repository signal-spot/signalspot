import { Entity, PrimaryKey, Property, ManyToOne, Index, Enum } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from './user.entity';
import { SignalSpot } from './signal-spot.entity';
import { Comment } from './comment.entity';

export enum ReportType {
  USER = 'user',
  SIGNAL_SPOT = 'signal_spot',
  COMMENT = 'comment',
  CHAT_MESSAGE = 'chat_message',
}

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  HATE_SPEECH = 'hate_speech',
  VIOLENCE = 'violence',
  SEXUAL_CONTENT = 'sexual_content',
  FALSE_INFORMATION = 'false_information',
  PRIVACY_VIOLATION = 'privacy_violation',
  COPYRIGHT = 'copyright',
  SELF_HARM = 'self_harm',
  OTHER = 'other',
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
  ESCALATED = 'escalated',
}

export enum ReportAction {
  NONE = 'none',
  WARNING_ISSUED = 'warning_issued',
  CONTENT_REMOVED = 'content_removed',
  USER_SUSPENDED = 'user_suspended',
  USER_BANNED = 'user_banned',
}

@Entity()
@Index({ properties: ['reporter', 'status'] })
@Index({ properties: ['reportedUser', 'status'] })
@Index({ properties: ['reportedSpot', 'status'] })
@Index({ properties: ['type', 'status'] })
@Index({ properties: ['createdAt', 'status'] })
export class Report {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => User)
  reporter!: User; // 신고한 사용자

  @Enum(() => ReportType)
  type: ReportType = ReportType.SIGNAL_SPOT;

  @Enum(() => ReportReason)
  reason: ReportReason = ReportReason.OTHER;

  @Property({ columnType: 'text', nullable: true })
  description?: string; // 상세 신고 내용

  // 신고 대상 (하나만 존재)
  @ManyToOne(() => User, { nullable: true })
  reportedUser?: User; // 신고된 사용자

  @ManyToOne(() => SignalSpot, { nullable: true })
  reportedSpot?: SignalSpot; // 신고된 Signal Spot

  @ManyToOne(() => Comment, { nullable: true })
  reportedComment?: Comment; // 신고된 댓글

  @Property({ nullable: true })
  reportedMessageId?: string; // 신고된 채팅 메시지 ID

  @Enum(() => ReportStatus)
  status: ReportStatus = ReportStatus.PENDING;

  @Enum(() => ReportAction)
  actionTaken: ReportAction = ReportAction.NONE;

  @Property({ nullable: true })
  reviewNotes?: string; // 관리자 검토 노트

  @ManyToOne(() => User, { nullable: true })
  reviewedBy?: User; // 검토한 관리자

  @Property({ nullable: true })
  reviewedAt?: Date; // 검토 일시

  @Property({ nullable: true })
  resolvedAt?: Date; // 해결 일시

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  // Helper methods
  isResolved(): boolean {
    return this.status === ReportStatus.RESOLVED || this.status === ReportStatus.REJECTED;
  }

  isPending(): boolean {
    return this.status === ReportStatus.PENDING;
  }

  markAsReviewing(reviewer: User): void {
    this.status = ReportStatus.REVIEWING;
    this.reviewedBy = reviewer;
    this.reviewedAt = new Date();
  }

  resolve(action: ReportAction, notes?: string): void {
    this.status = ReportStatus.RESOLVED;
    this.actionTaken = action;
    this.resolvedAt = new Date();
    if (notes) {
      this.reviewNotes = notes;
    }
  }

  reject(notes?: string): void {
    this.status = ReportStatus.REJECTED;
    this.actionTaken = ReportAction.NONE;
    this.resolvedAt = new Date();
    if (notes) {
      this.reviewNotes = notes;
    }
  }

  escalate(notes?: string): void {
    this.status = ReportStatus.ESCALATED;
    if (notes) {
      this.reviewNotes = notes;
    }
  }
}