import { AppDataSource } from '../utils/database';
import { Log } from '../entities/log.entity';
import { Account } from '../entities/account.entity';

export interface GetLogsOptions {
  page?: number;
  limit?: number;
  userId?: string;
}

export interface PaginatedLogsResponse {
  logs: (Log & { user: Account })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class LogService {
  private logRepository = AppDataSource.getRepository(Log);
  private accountRepository = AppDataSource.getRepository(Account);

  async createLog(userId: string, text: string): Promise<Log> {
    const log = this.logRepository.create({
      userId,
      text
    });
    return await this.logRepository.save(log);
  }

  async getLogs(options: GetLogsOptions = {}): Promise<PaginatedLogsResponse> {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .orderBy('log.createdAt', 'DESC');

    if (options.userId) {
      queryBuilder.where('log.userId = :userId', { userId: options.userId });
    }

    const [logs, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      logs: logs as (Log & { user: Account })[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getLogById(id: string): Promise<Log | null> {
    return await this.logRepository.findOne({
      where: { id },
      relations: ['user']
    });
  }

  // Helper methods for common log actions
  async logProfileUpdate(userId: string, username: string): Promise<void> {
    await this.createLog(userId, `updated their profile`);
  }

  async logUserUpdate(adminId: string, targetUsername: string, updateMessages: string[]): Promise<void> {
    await this.createLog(adminId, `updated ${targetUsername}'s details: ${updateMessages.join(', ')}`);
  }

  async logUserBan(adminId: string, targetUsername: string): Promise<void> {
    await this.createLog(adminId, `banned user ${targetUsername}`);
  }

  async logUserUnban(adminId: string, targetUsername: string): Promise<void> {
    await this.createLog(adminId, `unbanned user ${targetUsername}`);
  }

  async logReportStatusChange(adminId: string, reportId: string, status: string): Promise<void> {
    await this.createLog(adminId, `changed report ${reportId} status to ${status.toUpperCase()}`);
  }

  async logReportDelete(adminId: string, reportId: string): Promise<void> {
    await this.createLog(adminId, `deleted report ${reportId}`);
  }

  async logUserLogin(userId: string, username: string): Promise<void> {
    await this.createLog(userId, `logged in`);
  }

  async logFailedLogin(email: string, reason: string): Promise<void> {
    // Note: We don't have a userId for failed logins, so we'll use a system log
    await this.createLog('system', `failed login attempt for ${email}: ${reason}`);
  }

  async logPasswordChange(adminId: string, username: string): Promise<void> {
    await this.createLog(adminId, `changed password for user ${username}`);
  }
} 