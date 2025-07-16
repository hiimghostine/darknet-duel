import { AppDataSource } from '../utils/database';
import { Account } from '../entities/account.entity';

export interface CurrencyBalance {
  creds: number;
  crypts: number;
}

export interface CurrencyTransaction {
  userId: string;
  type: 'creds' | 'crypts';
  amount: number;
  operation: 'add' | 'subtract';
  reason?: string;
}

export class CurrencyService {
  private accountRepository = AppDataSource.getRepository(Account);

  /**
   * Get user's currency balances
   */
  async getBalance(userId: string): Promise<CurrencyBalance | null> {
    const account = await this.accountRepository.findOne({
      where: { id: userId },
      select: ['creds', 'crypts']
    });

    if (!account) {
      return null;
    }

    return {
      creds: account.creds,
      crypts: account.crypts
    };
  }

  /**
   * Add currency to user's account
   */
  async addCurrency(userId: string, type: 'creds' | 'crypts', amount: number, reason?: string): Promise<CurrencyBalance | null> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const account = await this.accountRepository.findOne({ where: { id: userId } });
    if (!account) {
      return null;
    }

    if (type === 'creds') {
      account.creds += amount;
    } else {
      account.crypts += amount;
    }

    await this.accountRepository.save(account);

    return {
      creds: account.creds,
      crypts: account.crypts
    };
  }

  /**
   * Subtract currency from user's account
   */
  async subtractCurrency(userId: string, type: 'creds' | 'crypts', amount: number, reason?: string): Promise<CurrencyBalance | null> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const account = await this.accountRepository.findOne({ where: { id: userId } });
    if (!account) {
      return null;
    }

    const currentAmount = type === 'creds' ? account.creds : account.crypts;
    if (currentAmount < amount) {
      throw new Error(`Insufficient ${type}. Current: ${currentAmount}, Required: ${amount}`);
    }

    if (type === 'creds') {
      account.creds -= amount;
    } else {
      account.crypts -= amount;
    }

    await this.accountRepository.save(account);

    return {
      creds: account.creds,
      crypts: account.crypts
    };
  }

  /**
   * Transfer currency between users
   */
  async transferCurrency(fromUserId: string, toUserId: string, type: 'creds' | 'crypts', amount: number): Promise<{ from: CurrencyBalance; to: CurrencyBalance } | null> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const fromAccount = await this.accountRepository.findOne({ where: { id: fromUserId } });
    const toAccount = await this.accountRepository.findOne({ where: { id: toUserId } });

    if (!fromAccount || !toAccount) {
      return null;
    }

    const currentAmount = type === 'creds' ? fromAccount.creds : fromAccount.crypts;
    if (currentAmount < amount) {
      throw new Error(`Insufficient ${type}. Current: ${currentAmount}, Required: ${amount}`);
    }

    // Subtract from sender
    if (type === 'creds') {
      fromAccount.creds -= amount;
      toAccount.creds += amount;
    } else {
      fromAccount.crypts -= amount;
      toAccount.crypts += amount;
    }

    // Save both accounts in a transaction
    await this.accountRepository.save([fromAccount, toAccount]);

    return {
      from: { creds: fromAccount.creds, crypts: fromAccount.crypts },
      to: { creds: toAccount.creds, crypts: toAccount.crypts }
    };
  }

  /**
   * Set currency amount (admin only)
   */
  async setCurrency(userId: string, type: 'creds' | 'crypts', amount: number): Promise<CurrencyBalance | null> {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }

    const account = await this.accountRepository.findOne({ where: { id: userId } });
    if (!account) {
      return null;
    }

    if (type === 'creds') {
      account.creds = amount;
    } else {
      account.crypts = amount;
    }

    await this.accountRepository.save(account);

    return {
      creds: account.creds,
      crypts: account.crypts
    };
  }
} 