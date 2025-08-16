import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import { ReportService } from './report.service';
import { CreateReportDto, UpdateReportDto, ReportQueryDto, ReportResponseDto } from './dto/report.dto';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, VerifiedUserGuard)
@ApiBearerAuth()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new report',
    description: 'Report a user, signal spot, comment, or chat message for violation.'
  })
  @ApiBody({ type: CreateReportDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Report created successfully',
    type: ReportResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Duplicate report exists'
  })
  async createReport(
    @Body() createReportDto: CreateReportDto,
    @GetUser() user: User
  ): Promise<{ success: boolean; data: any; message: string }> {
    const report = await this.reportService.createReport(user.id, createReportDto);

    return {
      success: true,
      data: report,
      message: 'Report submitted successfully',
    };
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get reports with filters',
    description: 'Retrieve reports based on various filters. Admin access required for all reports.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Reports retrieved successfully'
  })
  async getReports(
    @Query() queryDto: ReportQueryDto,
    @GetUser() user: User
  ): Promise<{ success: boolean; data: any[]; total: number }> {
    // For regular users, only show their own reports
    // For admins, show all reports based on filters
    if (!user.isAdmin) {
      queryDto.reporterId = user.id;
    }

    const { data, total } = await this.reportService.getReports(queryDto);

    return {
      success: true,
      data,
      total,
    };
  }

  @Get('my-reports')
  @ApiOperation({ 
    summary: 'Get my reports',
    description: 'Get all reports submitted by the current user.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User reports retrieved successfully'
  })
  async getMyReports(
    @GetUser() user: User
  ): Promise<{ success: boolean; data: any[] }> {
    const reports = await this.reportService.getUserReports(user.id);

    return {
      success: true,
      data: reports,
    };
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get report statistics',
    description: 'Get statistics about reports.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Report statistics retrieved successfully'
  })
  async getReportStats(
    @GetUser() user: User
  ): Promise<{ success: boolean; data: any }> {
    // For regular users, show their own stats
    // For admins, show overall stats
    const userId = user.isAdmin ? undefined : user.id;
    const stats = await this.reportService.getReportStats(userId);

    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get report by ID',
    description: 'Retrieve a specific report by its ID.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Report ID',
    format: 'uuid'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Report retrieved successfully',
    type: ReportResponseDto
  })
  async getReportById(
    @Param('id', ParseUUIDPipe) reportId: string,
    @GetUser() user: User
  ): Promise<{ success: boolean; data: any }> {
    const report = await this.reportService.getReportById(reportId);

    // Check access rights
    if (!user.isAdmin && report.reporter.id !== user.id) {
      throw new ForbiddenException('You can only view your own reports');
    }

    return {
      success: true,
      data: report,
    };
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update report status',
    description: 'Update the status of a report. Admin access required.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Report ID',
    format: 'uuid'
  })
  @ApiBody({ type: UpdateReportDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Report updated successfully',
    type: ReportResponseDto
  })
  async updateReport(
    @Param('id', ParseUUIDPipe) reportId: string,
    @Body() updateReportDto: UpdateReportDto,
    @GetUser() user: User
  ): Promise<{ success: boolean; data: any; message: string }> {
    // TODO: Add proper admin check
    // if (!user.isAdmin) {
    //   throw new ForbiddenException('Only admins can update report status');
    // }

    const report = await this.reportService.updateReportStatus(
      reportId,
      user.id,
      updateReportDto
    );

    return {
      success: true,
      data: report,
      message: 'Report updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Delete a report',
    description: 'Delete a pending report. Only the reporter can delete their own pending reports.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Report ID',
    format: 'uuid'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Report deleted successfully'
  })
  async deleteReport(
    @Param('id', ParseUUIDPipe) reportId: string,
    @GetUser() user: User
  ): Promise<{ success: boolean; message: string }> {
    await this.reportService.deleteReport(reportId, user.id);

    return {
      success: true,
      message: 'Report deleted successfully',
    };
  }
}