import { AppDataSource } from '../utils/database';
import { Account, AccountType } from '../entities/account.entity';
import { validateEmail } from '../utils/validation';
import bcrypt from 'bcrypt';

export interface GetUsersFilters {
  page: number;
  limit: number;
  search?: string;
  type?: AccountType;
  isActive?: boolean;
}

export interface PaginatedUsersResult {
  users: AdminUserData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminUserData {
  id: string;
  email: string;
  username: string;
  type: AccountType;
  isActive: boolean;
  inactiveReason: string | null;
  lastLogin: Date | null;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  rating: number;
  bio: string | null;
  creds: number;
  crypts: number;
  createdAt: Date;
  updatedAt: Date;
  // Use /api/files/avatar/{id} endpoint for avatars instead of raw buffer
  hasAvatar: boolean;
}

export class AdminService {
  private accountRepository = AppDataSource.getRepository(Account);

  /**
   * Get paginated list of users with search and filtering
   */
  async getUsers(filters: GetUsersFilters): Promise<PaginatedUsersResult> {
    const { page, limit, search, type, isActive } = filters;

    // Build query
    const queryBuilder = this.accountRepository.createQueryBuilder('account');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(account.username LIKE :search OR account.email LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply type filter
    if (type) {
      queryBuilder.andWhere('account.type = :type', { type });
    }

    // Apply isActive filter
    if (isActive !== undefined) {
      queryBuilder.andWhere('account.isActive = :isActive', { isActive });
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Order by creation date (newest first)
    queryBuilder.orderBy('account.createdAt', 'DESC');

    // Execute query
    const [users, total] = await queryBuilder.getManyAndCount();

    // Transform users to admin format (excluding avatar buffer data)
    const adminUsers: AdminUserData[] = users.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      type: user.type,
      isActive: user.isActive,
      inactiveReason: user.inactiveReason,
      lastLogin: user.lastLogin,
      gamesPlayed: user.gamesPlayed,
      gamesWon: user.gamesWon,
      gamesLost: user.gamesLost,
      rating: user.rating,
      bio: user.bio,
      creds: user.creds,
      crypts: user.crypts,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // Use /api/files/avatar/{id} endpoint for avatars instead of raw buffer
      hasAvatar: !!user.avatar
    }));

    return {
      users: adminUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get detailed user information by ID (admin view)
   */
  async getUserById(id: string): Promise<AdminUserData | null> {
    const user = await this.accountRepository.findOne({ where: { id } });
    
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      type: user.type,
      isActive: user.isActive,
      inactiveReason: user.inactiveReason,
      lastLogin: user.lastLogin,
      gamesPlayed: user.gamesPlayed,
      gamesWon: user.gamesWon,
      gamesLost: user.gamesLost,
      rating: user.rating,
      bio: user.bio,
      creds: user.creds,
      crypts: user.crypts,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // Use /api/files/avatar/{id} endpoint for avatars instead of raw buffer
      hasAvatar: !!user.avatar
    };
  }

  /**
   * Update user details (admin only)
   */
  async updateUser(id: string, updateData: Partial<Account>): Promise<AdminUserData | null> {
    // Get current user
    const currentUser = await this.accountRepository.findOne({ where: { id } });
    if (!currentUser) {
      return null;
    }

    // Validate email if being updated
    if (updateData.email && !validateEmail(updateData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate bio length if being updated
    if (updateData.bio && updateData.bio.length > 30) {
      throw new Error('Bio must be 30 characters or less');
    }

    // Check if email or username are already taken by another user
    if (updateData.email || updateData.username) {
      const conflicts = await this.accountRepository.createQueryBuilder('account')
        .where('account.id != :id', { id })
        .andWhere(
          updateData.email && updateData.username 
            ? '(account.email = :email OR account.username = :username)'
            : updateData.email 
              ? 'account.email = :email'
              : 'account.username = :username',
          {
            ...(updateData.email && { email: updateData.email.toLowerCase() }),
            ...(updateData.username && { username: updateData.username })
          }
        )
        .getOne();

      if (conflicts) {
        if (conflicts.email === updateData.email?.toLowerCase()) {
          throw new Error('Email already in use');
        }
        if (conflicts.username === updateData.username) {
          throw new Error('Username already in use');
        }
      }
    }

    // Hash password if being updated
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    // Normalize email to lowercase
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase();
    }

    // Validate numeric fields
    if (updateData.creds !== undefined && updateData.creds < 0) {
      throw new Error('Credits must be non-negative');
    }
    if (updateData.crypts !== undefined && updateData.crypts < 0) {
      throw new Error('Crypts must be non-negative');
    }

    // Update the user
    await this.accountRepository.update({ id }, updateData);

    // Return updated user
    return this.getUserById(id);
  }

  /**
   * Delete user account (admin only)
   */
  async deleteUser(id: string, adminId: string): Promise<boolean> {
    // Get the user to delete
    const userToDelete = await this.accountRepository.findOne({ where: { id } });
    if (!userToDelete) {
      return false;
    }

    // Prevent deleting other admins (additional protection)
    if (userToDelete.type === AccountType.ADMIN && userToDelete.id !== adminId) {
      throw new Error('Cannot delete other administrator accounts');
    }

    // Delete the user (CASCADE should handle related records)
    const result = await this.accountRepository.delete({ id });
    return result.affected === 1;
  }

  /**
   * Get user statistics for admin dashboard
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    modUsers: number;
    regularUsers: number;
  }> {
    const [
      totalUsers,
      activeUsers,
      adminUsers,
      modUsers,
      regularUsers
    ] = await Promise.all([
      this.accountRepository.count(),
      this.accountRepository.count({ where: { isActive: true } }),
      this.accountRepository.count({ where: { type: AccountType.ADMIN } }),
      this.accountRepository.count({ where: { type: AccountType.MOD } }),
      this.accountRepository.count({ where: { type: AccountType.USER } })
    ]);

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      modUsers,
      regularUsers
    };
  }

  /**
   * Ban a user with a reason
   */
  async banUser(id: string, reason: string): Promise<AdminUserData | null> {
    const user = await this.accountRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new Error('User not found');
    }

    // Don't allow banning admin accounts
    if (user.type === AccountType.ADMIN) {
      throw new Error('Cannot ban admin accounts');
    }

    // Update user to inactive with reason
    user.isActive = false;
    user.inactiveReason = reason;
    user.updatedAt = new Date();

    const updatedUser = await this.accountRepository.save(user);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      type: updatedUser.type,
      isActive: updatedUser.isActive,
      inactiveReason: updatedUser.inactiveReason,
      lastLogin: updatedUser.lastLogin,
      gamesPlayed: updatedUser.gamesPlayed,
      gamesWon: updatedUser.gamesWon,
      gamesLost: updatedUser.gamesLost,
      rating: updatedUser.rating,
      bio: updatedUser.bio,
      creds: updatedUser.creds,
      crypts: updatedUser.crypts,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      hasAvatar: !!updatedUser.avatar
    };
  }

  /**
   * Unban a user (reactivate account)
   */
  async unbanUser(id: string): Promise<AdminUserData | null> {
    const user = await this.accountRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new Error('User not found');
    }

    // Reactivate user and clear inactive reason
    user.isActive = true;
    user.inactiveReason = null;
    user.updatedAt = new Date();

    const updatedUser = await this.accountRepository.save(user);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      type: updatedUser.type,
      isActive: updatedUser.isActive,
      inactiveReason: updatedUser.inactiveReason,
      lastLogin: updatedUser.lastLogin,
      gamesPlayed: updatedUser.gamesPlayed,
      gamesWon: updatedUser.gamesWon,
      gamesLost: updatedUser.gamesLost,
      rating: updatedUser.rating,
      bio: updatedUser.bio,
      creds: updatedUser.creds,
      crypts: updatedUser.crypts,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      hasAvatar: !!updatedUser.avatar
    };
  }
} 