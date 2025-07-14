import api from './api';

export interface PaymentResponse {
  invoiceId: string;
  invoiceUrl: string;
  status: string;
}

export interface PaymentStatus {
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  invoiceId: string;
}

export interface PaymentResult {
  crypts: number;
  newBalance: number;
}

class PaymentService {
  /**
   * Create a payment invoice for a package
   */
  async createPayment(packageId: string): Promise<PaymentResponse> {
    try {
      const response = await api.post('/payment/create', { packageId });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create payment');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Payment creation error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create payment');
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(invoiceId: string): Promise<PaymentStatus> {
    try {
      const response = await api.get(`/payment/status/${invoiceId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to check payment status');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Payment status check error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to check payment status');
    }
  }

  /**
   * Process successful payment
   */
  async processPayment(invoiceId: string, packageId: string): Promise<PaymentResult> {
    try {
      const response = await api.post('/payment/process', { invoiceId, packageId });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to process payment');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Payment processing error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to process payment');
    }
  }

  /**
   * Open payment window and return a promise that resolves when payment is completed
   */
  async openPaymentWindow(paymentUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const paymentWindow = window.open(
        paymentUrl,
        'payment',
        'width=800,height=600,scrollbars=yes,resizable=yes'
      );

      if (!paymentWindow) {
        resolve(false);
        return;
      }

      // Poll to check if window is closed
      const pollTimer = setInterval(() => {
        if (paymentWindow.closed) {
          clearInterval(pollTimer);
          resolve(true);
        }
      }, 1000);

      // Auto-close after 30 minutes
      setTimeout(() => {
        if (!paymentWindow.closed) {
          paymentWindow.close();
        }
        clearInterval(pollTimer);
        resolve(false);
      }, 30 * 60 * 1000);
    });
  }

  /**
   * Complete payment flow: create payment, open window, poll status, process payment
   */
  async completePurchase(
    packageId: string,
    onStatusUpdate?: (status: string) => void
  ): Promise<PaymentResult> {
    try {
      // Step 1: Create payment
      onStatusUpdate?.('Creating payment...');
      const payment = await this.createPayment(packageId);

      // Step 2: Open payment window
      onStatusUpdate?.('Opening payment window...');
      const windowOpened = await this.openPaymentWindow(payment.invoiceUrl);

      if (!windowOpened) {
        throw new Error('Failed to open payment window or payment was cancelled');
      }

      // Step 3: Poll payment status
      onStatusUpdate?.('Checking payment status...');
      const maxAttempts = 60; // 5 minutes max (5 second intervals)
      let attempts = 0;

      while (attempts < maxAttempts) {
        try {
          const status = await this.checkPaymentStatus(payment.invoiceId);
          
          if (status.status === 'PAID') {
            // Step 4: Process successful payment
            onStatusUpdate?.('Processing payment...');
            const result = await this.processPayment(payment.invoiceId, packageId);
            return result;
          } else if (status.status === 'EXPIRED' || status.status === 'CANCELLED') {
            throw new Error(`Payment ${status.status.toLowerCase()}`);
          }

          // Still pending, wait and try again
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          attempts++;
        } catch (error) {
          console.error('Error checking payment status:', error);
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      throw new Error('Payment verification timeout. Please check your account balance.');
    } catch (error) {
      console.error('Complete purchase error:', error);
      throw error;
    }
  }
}

export default new PaymentService(); 