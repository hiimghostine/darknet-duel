import { AppDataSource } from '../utils/database';
import { Account } from '../entities/account.entity';

export class AuthService {
  private accountRepository = AppDataSource.getRepository(Account);
  
  // Create a new user
  async createUser(userData: Partial<Account>): Promise<Account> {
    const user = this.accountRepository.create(userData);
    return this.accountRepository.save(user);
  }
  
  // Find user by email
  async findByEmail(email: string): Promise<Account | null> {
    return this.accountRepository.findOne({ where: { email } });
  }
  
  // Find user by ID
  async findById(id: string): Promise<Account | null> {
    return this.accountRepository.findOne({ where: { id } });
  }
  
  // Find user by email or username
  async findByEmailOrUsername(email: string, username: string): Promise<Account | null> {
    return this.accountRepository.findOne({
      where: [
        { email },
        { username }
      ]
    });
  }
  
  // Update last login timestamp
  async updateLastLogin(id: string): Promise<void> {
    await this.accountRepository.update(
      { id },
      { lastLogin: new Date() }
    );
  }
  
  // Update user data
  async updateUser(id: string, userData: Partial<Account>): Promise<void> {
    await this.accountRepository.update({ id }, userData);
  }
}
