import api from './api';

export interface CurrencyBalance {
  creds: number;
  crypts: number;
}

export interface CurrencyResponse {
  success: boolean;
  data: CurrencyBalance;
  message?: string;
  error?: string;
}

export interface TransferResponse {
  success: boolean;
  data: {
    yourBalance: CurrencyBalance;
    recipientBalance: CurrencyBalance;
  };
  message?: string;
  error?: string;
}

class CurrencyService {
  /**
   * Get user's currency balance
   */
  async getBalance(): Promise<CurrencyBalance> {
    const response = await api.get<CurrencyResponse>('/currency/balance');
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch currency balance');
    }
    
    return response.data.data;
  }

  /**
   * Transfer currency to another user
   */
  async transferCurrency(toUserId: string, type: 'creds' | 'crypts', amount: number): Promise<{ yourBalance: CurrencyBalance; recipientBalance: CurrencyBalance }> {
    const response = await api.post<TransferResponse>('/currency/transfer', {
      toUserId,
      type,
      amount
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to transfer currency');
    }
    
    return response.data.data;
  }

  /**
   * Format currency amount with proper styling
   */
  formatCurrency(amount: number, type: 'creds' | 'crypts'): string {
    const emoji = type === 'creds' ? '💰' : '💎';
    const formatted = amount.toLocaleString();
    return `${emoji} ${formatted}`;
  }

  /**
   * Get currency display info
   */
  getCurrencyInfo(type: 'creds' | 'crypts') {
    if (type === 'creds') {
      return {
        name: 'Creds',
        emoji: '💰',
        color: 'text-yellow-400',
        description: 'Standard virtual currency earned through gameplay'
      };
    } else {
      return {
        name: 'Crypts',
        emoji: '💎',
        color: 'text-purple-400',
        description: 'Premium virtual currency for special purchases'
      };
    }
  }
}

const currencyService = new CurrencyService();
export default currencyService; 