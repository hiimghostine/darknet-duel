import { AppDataSource } from '../utils/database';
import { Session } from '../entities/session.entity';
import { v4 as uuidv4 } from 'uuid';

export class SessionService {
  private sessionRepository = AppDataSource.getRepository(Session);

  /**
   * Create a new session for a user
   * @param userId User ID
   * @param ipAddress Optional IP address
   * @param userAgent Optional user agent
   * @param expiresInMinutes Session expiration time in minutes (default: 7 days)
   * @returns Session ID (token)
   */
  async createSession(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
    expiresInMinutes: number = 7 * 24 * 60 // Default: 7 days
  ): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

    const session = this.sessionRepository.create({
      id: token,
      userId,
      expiresAt,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      isActive: true,
      createdAt: new Date(),
      lastActivity: new Date(),
    });

    await this.sessionRepository.save(session);
    return token;
  }

  /**
   * Validate a session and return user ID if valid
   * @param token Session ID (token)
   * @returns User ID if valid, null otherwise
   */
  async validateSession(token: string): Promise<string | null> {
    const session = await this.sessionRepository.findOne({
      where: {
        id: token,
        isActive: true,
      },
    });

    if (!session) {
      return null;
    }

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      // Mark as inactive
      await this.invalidateSession(token);
      return null;
    }

    // Update last activity
    session.lastActivity = new Date();
    await this.sessionRepository.save(session);

    return session.userId;
  }

  /**
   * Get session by ID
   * @param token Session ID (token)
   * @returns Session entity or null
   */
  async getSession(token: string): Promise<Session | null> {
    return await this.sessionRepository.findOne({
      where: { id: token },
      relations: ['user'],
    });
  }

  /**
   * Invalidate a session (logout)
   * @param token Session ID (token)
   */
  async invalidateSession(token: string): Promise<void> {
    await this.sessionRepository.update(
      { id: token },
      { isActive: false }
    );
  }

  /**
   * Invalidate all sessions for a user (force logout from all devices)
   * @param userId User ID
   */
  async invalidateAllUserSessions(userId: string): Promise<void> {
    await this.sessionRepository.update(
      { userId, isActive: true },
      { isActive: false }
    );
  }

  /**
   * Extend session expiration
   * @param token Session ID (token)
   * @param expiresInMinutes New expiration time in minutes
   */
  async extendSession(token: string, expiresInMinutes: number): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

    await this.sessionRepository.update(
      { id: token },
      { expiresAt, lastActivity: new Date() }
    );
  }

  /**
   * Clean up expired sessions (for scheduled cleanup job)
   * @returns Number of sessions cleaned up
   */
  async cleanupExpiredSessions(): Promise<number> {
    const now = new Date();
    const result = await this.sessionRepository
      .createQueryBuilder()
      .update(Session)
      .set({ isActive: false })
      .where('expiresAt < :now', { now })
      .andWhere('isActive = :isActive', { isActive: true })
      .execute();
    return result.affected || 0;
  }

  /**
   * Get all active sessions for a user
   * @param userId User ID
   * @returns Array of active sessions
   */
  async getUserSessions(userId: string): Promise<Session[]> {
    const now = new Date();
    return await this.sessionRepository
      .createQueryBuilder('session')
      .where('session.userId = :userId', { userId })
      .andWhere('session.isActive = :isActive', { isActive: true })
      .andWhere('session.expiresAt > :now', { now })
      .orderBy('session.lastActivity', 'DESC')
      .getMany();
  }
}

