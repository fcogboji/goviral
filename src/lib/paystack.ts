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
    const reference = data.reference || `ref_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
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

  // Charge authorization - for recurring payments
  async chargeAuthorization(data: {
    email: string;
    amount: number;
    authorization_code: string;
    reference?: string;
    metadata?: Record<string, unknown>;
  }) {
    try {
      const reference = data.reference || `charge_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

      const response = await this.makeRequest('/transaction/charge_authorization', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
          amount: data.amount,
          authorization_code: data.authorization_code,
          reference,
          metadata: data.metadata
        }),
      });

      return response;
    } catch (error) {
      console.error('Charge authorization error:', error);
      throw error;
    }
  }

  // Create customer
  async createCustomer(data: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    metadata?: Record<string, unknown>;
  }) {
    try {
      const response = await this.makeRequest('/customer', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return response;
    } catch (error) {
      console.error('Create customer error:', error);
      throw error;
    }
  }

  // Get customer
  async getCustomer(emailOrCode: string) {
    try {
      const response = await this.makeRequest(`/customer/${emailOrCode}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get customer error:', error);
      throw error;
    }
  }

  // Create subscription plan
  async createPlan(data: {
    name: string;
    interval: 'daily' | 'weekly' | 'monthly' | 'annually';
    amount: number;
    description?: string;
    currency?: string;
  }) {
    try {
      const response = await this.makeRequest('/plan', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          currency: data.currency || 'NGN'
        }),
      });

      return response;
    } catch (error) {
      console.error('Create plan error:', error);
      throw error;
    }
  }

  // Create subscription
  async createSubscription(data: {
    customer: string;
    plan: string;
    authorization?: string;
    start_date?: string;
  }) {
    try {
      const response = await this.makeRequest('/subscription', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return response;
    } catch (error) {
      console.error('Create subscription error:', error);
      throw error;
    }
  }

  // Disable subscription
  async disableSubscription(code: string, token: string) {
    try {
      const response = await this.makeRequest('/subscription/disable', {
        method: 'POST',
        body: JSON.stringify({
          code,
          token
        }),
      });

      return response;
    } catch (error) {
      console.error('Disable subscription error:', error);
      throw error;
    }
  }

  // Get subscription
  async getSubscription(idOrCode: string) {
    try {
      const response = await this.makeRequest(`/subscription/${idOrCode}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get subscription error:', error);
      throw error;
    }
  }
}