import { AppDataSource } from '../utils/database';
import { Report, ReportType, ReportStatus } from '../entities/report.entity';
import { Account } from '../entities/account.entity';
import { LogService } from './log.service';

export interface CreateReportData {
  reporterId: string;
  reporteeId: string;
  reason: string;
  content?: string;
  reportType: ReportType;
}

export interface GetReportsOptions {
  page?: number;
  limit?: number;
  status?: ReportStatus;
  reportType?: ReportType;
  search?: string;
}

export interface ReportWithUsers {
  id: string;
  reporterId: string;
  reporteeId: string;
  reason: string;
  content: string | null;
  reportType: ReportType;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
  reporter: {
    id: string;
    username: string;
    email: string;
  };
  reportee: {
    id: string;
    username: string;
    email: string;
  };
}

export class ReportService {
  private reportRepository = AppDataSource.getRepository(Report);
  private accountRepository = AppDataSource.getRepository(Account);
  private logService = new LogService();

  /**
   * Create a new report
   */
  async createReport(data: CreateReportData): Promise<Report> {
    const report = this.reportRepository.create({
      reporterId: data.reporterId,
      reporteeId: data.reporteeId,
      reason: data.reason,
      content: data.content,
      reportType: data.reportType,
      status: ReportStatus.PENDING
    });

    return await this.reportRepository.save(report);
  }

  /**
   * Get reports with pagination and filtering for admin
   */
  async getReports(options: GetReportsOptions = {}): Promise<{
    reports: ReportWithUsers[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const offset = (page - 1) * limit;

    // Build query
    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reporter', 'reporter')
      .leftJoinAndSelect('report.reportee', 'reportee')
      .select([
        'report.id',
        'report.reporterId',
        'report.reporteeId',
        'report.reason',
        'report.content',
        'report.reportType',
        'report.status',
        'report.createdAt',
        'report.updatedAt',
        'reporter.id',
        'reporter.username',
        'reporter.email',
        'reportee.id',
        'reportee.username',
        'reportee.email'
      ])
      .orderBy('report.createdAt', 'DESC');

    // Apply filters
    if (options.status) {
      queryBuilder.andWhere('report.status = :status', { status: options.status });
    }

    if (options.reportType) {
      queryBuilder.andWhere('report.reportType = :reportType', { reportType: options.reportType });
    }

    if (options.search) {
      queryBuilder.andWhere(
        '(reporter.username LIKE :search OR reportee.username LIKE :search OR report.reason LIKE :search)',
        { search: `%${options.search}%` }
      );
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Get paginated results
    const reports = await queryBuilder
      .skip(offset)
      .take(limit)
      .getRawMany();

    // Transform to proper format
    const transformedReports: ReportWithUsers[] = reports.map((row: any) => ({
      id: row.report_id,
      reporterId: row.report_reporterId,
      reporteeId: row.report_reporteeId,
      reason: row.report_reason,
      content: row.report_content,
      reportType: row.report_reportType,
      status: row.report_status,
      createdAt: row.report_createdAt,
      updatedAt: row.report_updatedAt,
      reporter: {
        id: row.reporter_id,
        username: row.reporter_username,
        email: row.reporter_email
      },
      reportee: {
        id: row.reportee_id,
        username: row.reportee_username,
        email: row.reportee_email
      }
    }));

    return {
      reports: transformedReports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get a single report by ID
   */
  async getReportById(id: string): Promise<ReportWithUsers | null> {
    const report = await this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reporter', 'reporter')
      .leftJoinAndSelect('report.reportee', 'reportee')
      .select([
        'report.id',
        'report.reporterId',
        'report.reporteeId',
        'report.reason',
        'report.content',
        'report.reportType',
        'report.status',
        'report.createdAt',
        'report.updatedAt',
        'reporter.id',
        'reporter.username',
        'reporter.email',
        'reportee.id',
        'reportee.username',
        'reportee.email'
      ])
      .where('report.id = :id', { id })
      .getRawOne();

    if (!report) return null;

    return {
      id: report.report_id,
      reporterId: report.report_reporterId,
      reporteeId: report.report_reporteeId,
      reason: report.report_reason,
      content: report.report_content,
      reportType: report.report_reportType,
      status: report.report_status,
      createdAt: report.report_createdAt,
      updatedAt: report.report_updatedAt,
      reporter: {
        id: report.reporter_id,
        username: report.reporter_username,
        email: report.reporter_email
      },
      reportee: {
        id: report.reportee_id,
        username: report.reportee_username,
        email: report.reportee_email
      }
    };
  }

  /**
   * Update report status
   */
  async updateReportStatus(id: string, status: ReportStatus, adminId: string): Promise<Report | null> {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) return null;

    report.status = status;
    const updatedReport = await this.reportRepository.save(report);

    // Log the status change
    await this.logService.logReportStatusChange(adminId, id, status);

    return updatedReport;
  }

  /**
   * Delete a report
   */
  async deleteReport(id: string, adminId: string): Promise<boolean> {
    const result = await this.reportRepository.delete(id);
    
    if (result.affected !== 0) {
      // Log the deletion
      await this.logService.logReportDelete(adminId, id);
      return true;
    }
    
    return false;
  }

  /**
   * Get report statistics for admin dashboard
   */
  async getReportStats(): Promise<{
    totalReports: number;
    pendingReports: number;
    resolvedReports: number;
    dismissedReports: number;
    profileReports: number;
    chatReports: number;
  }> {
    const [
      totalReports,
      pendingReports,
      resolvedReports,
      dismissedReports,
      profileReports,
      chatReports
    ] = await Promise.all([
      this.reportRepository.count(),
      this.reportRepository.count({ where: { status: ReportStatus.PENDING } }),
      this.reportRepository.count({ where: { status: ReportStatus.RESOLVED } }),
      this.reportRepository.count({ where: { status: ReportStatus.DISMISSED } }),
      this.reportRepository.count({ where: { reportType: ReportType.PROFILE } }),
      this.reportRepository.count({ where: { reportType: ReportType.CHAT } })
    ]);

    return {
      totalReports,
      pendingReports,
      resolvedReports,
      dismissedReports,
      profileReports,
      chatReports
    };
  }
} 