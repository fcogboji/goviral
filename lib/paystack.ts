// lib/paystack.ts
export default class PaystackAPI {
  private secretKey: string;
  private baseUrl: string = 'https://api.paystack.co';

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY!;
    
    if (!this.secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not defined in environment variables');
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Paystack API error: ${errorData.message || response.statusText}`);
    }

    return response.json();
  }

  async verifyPayment(reference: string): Promise<{
    status: boolean
    data?: Record<string, unknown>
    message?: string
  }> {
    try {
      const response = await this.makeRequest(`/transaction/verify/${reference}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  async initializePayment(data: {
    email: string;
    amount: number;
    reference: string;
    callback_url: string;
    metadata?: Record<string, unknown>;
  }) {
    try {
      const response = await this.makeRequest('/transaction/initialize', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return response;
    } catch (error) {
      console.error('Payment initialization error:', error);
      throw error;
    }
  }

  // Fixed method that handles optional parameters properly
  async initializeTransaction(data: {
    email: string;
    amount: number;
    reference?: string;
    callback_url?: string;
    metadata?: Record<string, unknown>;
  }) {
    // Generate reference if not provided
    const reference = data.reference || `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate callback URL if not provided
    const callback_url = data.callback_url || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/callback`;

    // Create properly typed data for initializePayment
    const paymentData = {
      email: data.email,
      amount: data.amount,
      reference,
      callback_url,
      metadata: data.metadata
    };

    return this.initializePayment(paymentData);
  }

  async getTransaction(transactionId: string) {
    try {
      const response = await this.makeRequest(`/transaction/${transactionId}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get transaction error:', error);
      throw error;
    }
  }

  async listTransactions(params?: {
    perPage?: number;
    page?: number;
    customer?: string;
    status?: 'failed' | 'success' | 'abandoned';
    from?: string;
    to?: string;
    amount?: number;
  }) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const endpoint = `/transaction${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.makeRequest(endpoint, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('List transactions error:', error);
      throw error;
    }
  }
}