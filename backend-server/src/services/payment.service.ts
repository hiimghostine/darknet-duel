import axios from 'axios';
import { CurrencyService } from './currency.service';

export interface PaymentRequest {
  userId: string;
  packageId: string;
  crypts: number;
  amount: number; // Amount in PHP
}

export interface PaymentResponse {
  invoiceId: string;
  invoiceUrl: string;
  status: string;
}

export interface PaymentStatus {
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  invoiceId: string;
}

export class PaymentService {
  private currencyService = new CurrencyService();
  private xenditApiKey: string;
  private xenditBaseUrl = 'https://api.xendit.co';

  constructor() {
    this.xenditApiKey = process.env.XENDIT_API_KEY || '';
    
    if (!this.xenditApiKey) {
      console.warn('XENDIT_API_KEY not found in environment variables');
    }
  }

  /**
   * Get the package details from package ID
   */
  private getPackageDetails(packageId: string): { crypts: number; price: number } | null {
    const packages: Record<string, { crypts: number; price: number }> = {
      'starter': { crypts: 15, price: 20.50 },
      'small': { crypts: 50, price: 53 },
      'medium': { crypts: 150, price: 159 },
      'large': { crypts: 250, price: 264 },
      'xl': { crypts: 500, price: 530 },
      'xxl': { crypts: 1000, price: 1070 },
      'mega': { crypts: 1500, price: 1600 },
      'ultra': { crypts: 2500, price: 2650 },
      'supreme': { crypts: 5000, price: 5300 }
    };

    return packages[packageId] || null;
  }

  /**
   * Create a payment invoice with Xendit
   */
  async createPayment(userId: string, packageId: string): Promise<PaymentResponse> {
    if (!this.xenditApiKey) {
      throw new Error('Xendit API key not configured');
    }

    const packageDetails = this.getPackageDetails(packageId);
    if (!packageDetails) {
      throw new Error('Invalid package ID');
    }

    try {
      const headers = {
        'Authorization': `Basic ${Buffer.from(this.xenditApiKey + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      };

      const requestBody = {
        external_id: `darknet-duel-${userId}-${packageId}-${Date.now()}`,
        amount: packageDetails.price,
        description: `Darknet Duel - ${packageDetails.crypts} Crypts Package`,
        invoice_duration: 86400, // 24 hours expiry
        customer: {
          given_names: 'Player',
          email: `player${userId.substring(0, 8)}@darknetduel.game`
        },
        currency: 'PHP',
        success_redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/topup?success=true`,
        failure_redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/topup?success=false`
      };

      console.log('Creating Xendit payment for user:', userId, 'package:', packageId);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await axios.post(`${this.xenditBaseUrl}/v2/invoices`, requestBody, { headers });

      const { id: invoiceId, invoice_url: invoiceUrl, status } = response.data;

      if (!invoiceId || !invoiceUrl) {
        console.error('Invalid response from Xendit:', response.data);
        throw new Error('Failed to get invoice details from Xendit');
      }

      console.log('Xendit payment created successfully:', { invoiceId, status });

      return {
        invoiceId,
        invoiceUrl,
        status
      };
    } catch (error) {
      console.error('Xendit payment creation error:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Xendit API error details:', error.response?.data);
        throw new Error(`Payment service error: ${error.response?.data?.error_code || error.message}`);
      }
      
      throw new Error(`Failed to create payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check payment status with Xendit
   */
  async checkPaymentStatus(invoiceId: string): Promise<PaymentStatus> {
    if (!this.xenditApiKey) {
      throw new Error('Xendit API key not configured');
    }

    try {
      const headers = {
        'Authorization': `Basic ${Buffer.from(this.xenditApiKey + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      };

      console.log('Checking payment status for invoice:', invoiceId);

      const response = await axios.get(`${this.xenditBaseUrl}/v2/invoices/${invoiceId}`, { headers });

      const { status } = response.data;
      console.log('Xendit payment status:', status);

      // Map Xendit status to our status
      let mappedStatus: PaymentStatus['status'];
      switch (status.toUpperCase()) {
        case 'PAID':
        case 'SETTLED':
          mappedStatus = 'PAID';
          break;
        case 'PENDING':
          mappedStatus = 'PENDING';
          break;
        case 'EXPIRED':
          mappedStatus = 'EXPIRED';
          break;
        default:
          mappedStatus = 'CANCELLED';
      }

      return {
        status: mappedStatus,
        invoiceId
      };
    } catch (error) {
      console.error('Payment status check error:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Xendit API error details:', error.response?.data);
        throw new Error(`Payment status check failed: ${error.response?.data?.error_code || error.message}`);
      }
      
      throw new Error(`Failed to check payment status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process successful payment - add crypts to user account
   */
  async processSuccessfulPayment(userId: string, packageId: string, invoiceId: string): Promise<{ crypts: number; newBalance: number }> {
    const packageDetails = this.getPackageDetails(packageId);
    if (!packageDetails) {
      throw new Error('Invalid package ID');
    }

    try {
      console.log(`Processing successful payment for user ${userId}: ${packageDetails.crypts} crypts`);
      
      const newBalance = await this.currencyService.addCurrency(
        userId, 
        'crypts', 
        packageDetails.crypts, 
        `Purchase: ${packageId} package - Invoice: ${invoiceId}`
      );

      if (!newBalance) {
        throw new Error('Failed to update user balance');
      }

      console.log(`Successfully added ${packageDetails.crypts} crypts to user ${userId}. New balance: ${newBalance.crypts}`);

      return {
        crypts: packageDetails.crypts,
        newBalance: newBalance.crypts
      };
    } catch (error) {
      console.error('Error processing successful payment:', error);
      throw new Error(`Failed to process payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 