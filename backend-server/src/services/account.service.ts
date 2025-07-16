import { AppDataSource } from '../utils/database';
import { Account } from '../entities/account.entity';
import { validateEmail } from '../utils/validation';
import bcrypt from 'bcrypt';

export class AccountService {
  private accountRepository = AppDataSource.getRepository(Account);

  /**
   * Get account details by ID (without password and avatar)
   */
  async getAccountById(id: string): Promise<Omit<Account, 'password' | 'avatar' | 'avatarMimeType'> | null> {
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      return null;
    }
    
    // Remove password and avatar data from response
    const { password, avatar, avatarMimeType, ...accountWithoutSensitiveData } = account;
    return accountWithoutSensitiveData;
  }

  /**
   * Get avatar data by user ID
   */
  async getAvatarById(id: string): Promise<{ avatar: Buffer; mimeType: string } | null> {
    const account = await this.accountRepository.findOne({ 
      where: { id },
      select: ['avatar', 'avatarMimeType']
    });
    
    if (!account || !account.avatar) {
      return null;
    }
    
    return {
      avatar: account.avatar,
      mimeType: account.avatarMimeType || 'image/jpeg'
    };
  }

  /**
   * Update account details for a user
   */
  async updateAccount(id: string, updateData: Partial<Account>): Promise<Omit<Account, 'password' | 'avatar' | 'avatarMimeType'> | null> {
    // Get current account
    const currentAccount = await this.accountRepository.findOne({ where: { id } });
    if (!currentAccount) {
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

    // Remove sensitive fields that shouldn't be updated via this endpoint
    const { id: _, createdAt, updatedAt, ...allowedUpdates } = updateData;

    // Update the account
    await this.accountRepository.update({ id }, allowedUpdates);

    // Return updated account without password and avatar data
    const updatedAccount = await this.accountRepository.findOne({ where: { id } });
    if (!updatedAccount) {
      return null;
    }

    const { password, avatar, avatarMimeType, ...accountWithoutSensitiveData } = updatedAccount;
    return accountWithoutSensitiveData;
  }

  /**
   * Check if username is available
   */
  async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    const query = this.accountRepository.createQueryBuilder('account')
      .where('account.username = :username', { username });
    
    if (excludeUserId) {
      query.andWhere('account.id != :excludeUserId', { excludeUserId });
    }
    
    const existingAccount = await query.getOne();
    return !existingAccount;
  }

  /**
   * Check if email is available
   */
  async isEmailAvailable(email: string, excludeUserId?: string): Promise<boolean> {
    const query = this.accountRepository.createQueryBuilder('account')
      .where('account.email = :email', { email: email.toLowerCase() });
    
    if (excludeUserId) {
      query.andWhere('account.id != :excludeUserId', { excludeUserId });
    }
    
    const existingAccount = await query.getOne();
    return !existingAccount;
  }
} 