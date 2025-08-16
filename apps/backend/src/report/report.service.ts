import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../entities/user.entity';
import { Report, ReportType, ReportReason, ReportStatus, ReportAction } from '../entities/report.entity';
import { SignalSpot } from '../entities/signal-spot.entity';
import { Comment } from '../entities/comment.entity';
import { CreateReportDto, UpdateReportDto, ReportQueryDto } from './dto/report.dto';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: EntityRepository<Report>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(SignalSpot)
    private readonly signalSpotRepository: EntityRepository<SignalSpot>,
    @InjectRepository(Comment)
    private readonly commentRepository: EntityRepository<Comment>,
    private readonly em: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new report
   */
  async createReport(reporterId: string, createReportDto: CreateReportDto): Promise<Report> {
    // Check if reporter exists
    const reporter = await this.userRepository.findOne({ id: reporterId });
    if (!reporter) {
      throw new NotFoundException('Reporter not found');
    }

    // Note: Duplicate report check removed to allow users to report multiple times

    // Create the report
    const report = this.reportRepository.create({
      reporter,
      type: createReportDto.type,
      reason: createReportDto.reason,
      description: createReportDto.description,
    });

    // Set the reported target based on type
    switch (createReportDto.type) {
      case ReportType.USER:
        const reportedUser = await this.userRepository.findOne({ id: createReportDto.targetId });
        if (!reportedUser) {
          throw new NotFoundException('Reported user not found');
        }
        if (reportedUser.id === reporterId) {
          throw new BadRequestException('You cannot report yourself');
        }
        report.reportedUser = reportedUser;
        break;

      case ReportType.SIGNAL_SPOT:
        const reportedSpot = await this.signalSpotRepository.findOne(
          { id: createReportDto.targetId },
          { populate: ['creator'] }
        );
        if (!reportedSpot) {
          throw new NotFoundException('Reported signal spot not found');
        }
        // Prevent self-reporting of own signal spots
        if (reportedSpot.creator.id === reporterId) {
          throw new BadRequestException('You cannot report your own signal spot');
        }
        report.reportedSpot = reportedSpot;
        break;

      case ReportType.COMMENT:
        const reportedComment = await this.commentRepository.findOne(
          { id: createReportDto.targetId },
          { populate: ['author'] }
        );
        if (!reportedComment) {
          throw new NotFoundException('Reported comment not found');
        }
        // Prevent self-reporting of own comments
        if (reportedComment.author.id === reporterId) {
          throw new BadRequestException('You cannot report your own comment');
        }
        report.reportedComment = reportedComment;
        break;

      case ReportType.CHAT_MESSAGE:
        report.reportedMessageId = createReportDto.targetId;
        break;

      default:
        throw new BadRequestException('Invalid report type');
    }

    await this.em.persistAndFlush(report);

    // Emit event for notifications and further processing
    this.eventEmitter.emit('report.created', {
      reportId: report.id,
      reporterId,
      type: createReportDto.type,
      targetId: createReportDto.targetId,
      reason: createReportDto.reason,
    });

    this.logger.log(`Report created: ${report.id} by user ${reporterId}`);

    return report;
  }

  /**
   * Check if a duplicate report exists
   */
  private async checkDuplicateReport(
    reporterId: string,
    type: ReportType,
    targetId: string
  ): Promise<Report | null> {
    const query: any = {
      reporter: reporterId,
      type,
      status: { $in: [ReportStatus.PENDING, ReportStatus.REVIEWING] },
    };

    switch (type) {
      case ReportType.USER:
        query.reportedUser = targetId;
        break;
      case ReportType.SIGNAL_SPOT:
        query.reportedSpot = targetId;
        break;
      case ReportType.COMMENT:
        query.reportedComment = targetId;
        break;
      case ReportType.CHAT_MESSAGE:
        query.reportedMessageId = targetId;
        break;
    }

    return this.reportRepository.findOne(query);
  }

  /**
   * Get reports with filters
   */
  async getReports(queryDto: ReportQueryDto): Promise<{ data: Report[]; total: number }> {
    const where: any = {};

    if (queryDto.type) {
      where.type = queryDto.type;
    }

    if (queryDto.status) {
      where.status = queryDto.status;
    }

    if (queryDto.reason) {
      where.reason = queryDto.reason;
    }

    if (queryDto.reporterId) {
      where.reporter = queryDto.reporterId;
    }

    if (queryDto.from || queryDto.to) {
      where.createdAt = {};
      if (queryDto.from) {
        where.createdAt.$gte = new Date(queryDto.from);
      }
      if (queryDto.to) {
        where.createdAt.$lte = new Date(queryDto.to);
      }
    }

    const [data, total] = await this.reportRepository.findAndCount(
      where,
      {
        populate: ['reporter', 'reportedUser', 'reportedSpot', 'reportedComment', 'reviewedBy'],
        orderBy: { createdAt: 'DESC' },
        limit: queryDto.limit || 20,
        offset: queryDto.offset || 0,
      }
    );

    return { data, total };
  }

  /**
   * Get a single report by ID
   */
  async getReportById(reportId: string): Promise<Report> {
    const report = await this.reportRepository.findOne(
      { id: reportId },
      { populate: ['reporter', 'reportedUser', 'reportedSpot', 'reportedComment', 'reviewedBy'] }
    );

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  /**
   * Get reports by user (as reporter)
   */
  async getUserReports(userId: string): Promise<Report[]> {
    return this.reportRepository.find(
      { reporter: userId },
      {
        populate: ['reportedUser', 'reportedSpot', 'reportedComment'],
        orderBy: { createdAt: 'DESC' },
      }
    );
  }

  /**
   * Get reports against a user
   */
  async getReportsAgainstUser(userId: string): Promise<Report[]> {
    return this.reportRepository.find(
      { reportedUser: userId },
      {
        populate: ['reporter'],
        orderBy: { createdAt: 'DESC' },
      }
    );
  }

  /**
   * Update report status (for admins)
   */
  async updateReportStatus(
    reportId: string,
    reviewerId: string,
    updateDto: UpdateReportDto
  ): Promise<Report> {
    const report = await this.reportRepository.findOne(
      { id: reportId },
      { populate: ['reporter', 'reportedUser', 'reportedSpot'] }
    );

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const reviewer = await this.userRepository.findOne({ id: reviewerId });
    if (!reviewer) {
      throw new NotFoundException('Reviewer not found');
    }

    // Check if reviewer has admin privileges (you should implement proper role checking)
    // if (!reviewer.isAdmin) {
    //   throw new ForbiddenException('Only admins can review reports');
    // }

    // Update report based on status
    switch (updateDto.status) {
      case ReportStatus.REVIEWING:
        report.markAsReviewing(reviewer);
        break;

      case ReportStatus.RESOLVED:
        report.resolve(updateDto.actionTaken || ReportAction.NONE, updateDto.notes);
        report.reviewedBy = reviewer;
        break;

      case ReportStatus.REJECTED:
        report.reject(updateDto.notes);
        report.reviewedBy = reviewer;
        break;

      case ReportStatus.ESCALATED:
        report.escalate(updateDto.notes);
        report.reviewedBy = reviewer;
        break;

      default:
        throw new BadRequestException('Invalid status update');
    }

    await this.em.persistAndFlush(report);

    // Emit event for further processing
    this.eventEmitter.emit('report.updated', {
      reportId: report.id,
      status: report.status,
      actionTaken: report.actionTaken,
      reviewerId,
    });

    // If action was taken, emit specific events
    if (report.status === ReportStatus.RESOLVED && report.actionTaken !== ReportAction.NONE) {
      this.handleReportAction(report);
    }

    this.logger.log(`Report ${reportId} updated to status ${report.status} by ${reviewerId}`);

    return report;
  }

  /**
   * Handle actions based on report resolution
   */
  private async handleReportAction(report: Report): Promise<void> {
    switch (report.actionTaken) {
      case ReportAction.CONTENT_REMOVED:
        if (report.reportedSpot) {
          // Mark spot as removed/hidden
          this.eventEmitter.emit('content.remove', {
            type: 'signal_spot',
            id: report.reportedSpot.id,
          });
        } else if (report.reportedComment) {
          // Mark comment as removed
          this.eventEmitter.emit('content.remove', {
            type: 'comment',
            id: report.reportedComment.id,
          });
        }
        break;

      case ReportAction.USER_SUSPENDED:
      case ReportAction.USER_BANNED:
        if (report.reportedUser) {
          this.eventEmitter.emit('user.sanctioned', {
            userId: report.reportedUser.id,
            action: report.actionTaken,
            reason: report.reason,
          });
        }
        break;

      case ReportAction.WARNING_ISSUED:
        if (report.reportedUser) {
          this.eventEmitter.emit('user.warned', {
            userId: report.reportedUser.id,
            reason: report.reason,
          });
        }
        break;
    }
  }

  /**
   * Get report statistics
   */
  async getReportStats(userId?: string): Promise<any> {
    const where: any = {};
    
    if (userId) {
      where.reporter = userId;
    }

    const totalReports = await this.reportRepository.count(where);
    const pendingReports = await this.reportRepository.count({ ...where, status: ReportStatus.PENDING });
    const resolvedReports = await this.reportRepository.count({ ...where, status: ReportStatus.RESOLVED });
    const rejectedReports = await this.reportRepository.count({ ...where, status: ReportStatus.REJECTED });

    // Get reports by type
    const reportsByType = await Promise.all([
      { type: ReportType.USER, count: await this.reportRepository.count({ ...where, type: ReportType.USER }) },
      { type: ReportType.SIGNAL_SPOT, count: await this.reportRepository.count({ ...where, type: ReportType.SIGNAL_SPOT }) },
      { type: ReportType.COMMENT, count: await this.reportRepository.count({ ...where, type: ReportType.COMMENT }) },
      { type: ReportType.CHAT_MESSAGE, count: await this.reportRepository.count({ ...where, type: ReportType.CHAT_MESSAGE }) },
    ]);

    return {
      total: totalReports,
      pending: pendingReports,
      resolved: resolvedReports,
      rejected: rejectedReports,
      byType: reportsByType,
    };
  }

  /**
   * Delete a report (soft delete by marking as deleted)
   */
  async deleteReport(reportId: string, userId: string): Promise<void> {
    const report = await this.reportRepository.findOne({ id: reportId });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Only allow reporter to delete their own pending reports
    if (report.reporter.id !== userId) {
      throw new ForbiddenException('You can only delete your own reports');
    }

    if (report.status !== ReportStatus.PENDING) {
      throw new BadRequestException('Can only delete pending reports');
    }

    await this.em.removeAndFlush(report);

    this.logger.log(`Report ${reportId} deleted by user ${userId}`);
  }
}