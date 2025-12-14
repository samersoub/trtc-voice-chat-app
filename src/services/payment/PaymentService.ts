/**
 * Unified Payment Service
 * Orchestrates all payment methods (Stripe, PayPal, etc.)
 */

import { StripeService, CoinPackage } from './StripeService';
import { PayPalService } from './PayPalService';
import { EconomyService } from '../EconomyService';
import { ActivityLogService } from '../ActivityLogService';

export type PaymentMethod = 'stripe' | 'paypal' | 'google_pay' | 'apple_pay' | 'demo';

export interface PaymentTransaction {
  id: string;
  userId: string;
  packageId: string;
  method: PaymentMethod;
  amount: number;
  currency: string;
  coins: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentId?: string;
  createdAt: Date;
  completedAt?: Date;
  failedReason?: string;
}

class PaymentServiceClass {
  private readonly TRANSACTIONS_KEY = 'payment_transactions';

  /**
   * Get available payment methods
   */
  getAvailablePaymentMethods(): PaymentMethod[] {
    const methods: PaymentMethod[] = [];

    // Check Stripe
    if (import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
      methods.push('stripe');
    }

    // Check PayPal
    if (import.meta.env.VITE_PAYPAL_CLIENT_ID) {
      methods.push('paypal');
    }

    // Demo mode always available
    methods.push('demo');

    return methods;
  }

  /**
   * Get all coin packages
   */
  getPackages(): CoinPackage[] {
    return StripeService.getPackages();
  }

  /**
   * Purchase coins with selected payment method
   */
  async purchaseCoins(
    userId: string,
    packageId: string,
    method: PaymentMethod,
    options?: {
      successUrl?: string;
      cancelUrl?: string;
    }
  ): Promise<{ success: boolean; error?: string; orderId?: string }> {
    try {
      const pkg = StripeService.getPackage(packageId);
      
      if (!pkg) {
        return { success: false, error: 'Package not found' };
      }

      // Create transaction record
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const transaction: PaymentTransaction = {
        id: transactionId,
        userId,
        packageId,
        method,
        amount: pkg.price,
        currency: pkg.currency,
        coins: pkg.coins + pkg.bonus,
        status: 'pending',
        createdAt: new Date()
      };

      this.saveTransaction(transaction);

      // Process based on payment method
      switch (method) {
        case 'stripe':
          return await this.processStripePayment(
            userId,
            packageId,
            transactionId,
            options?.successUrl || window.location.origin + '/payment/success',
            options?.cancelUrl || window.location.origin + '/payment/cancel'
          );

        case 'paypal':
          return await this.processPayPalPayment(userId, packageId, transactionId);

        case 'demo':
          return await this.processDemoPayment(userId, packageId, transactionId, pkg.coins + pkg.bonus);

        default:
          return { success: false, error: 'Payment method not supported' };
      }

    } catch (error) {
      console.error('Payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }

  /**
   * Process Stripe payment
   */
  private async processStripePayment(
    userId: string,
    packageId: string,
    transactionId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ success: boolean; error?: string; orderId?: string }> {
    this.updateTransactionStatus(transactionId, 'processing');

    const result = await StripeService.createCheckoutSession(
      userId,
      packageId,
      successUrl,
      cancelUrl
    );

    if (result.success) {
      this.updateTransaction(transactionId, {
        paymentId: result.sessionId,
        status: 'processing'
      });
    } else {
      this.updateTransaction(transactionId, {
        status: 'failed',
        failedReason: result.error
      });
    }

    return result;
  }

  /**
   * Process PayPal payment
   */
  private async processPayPalPayment(
    userId: string,
    packageId: string,
    transactionId: string
  ): Promise<{ success: boolean; error?: string; orderId?: string }> {
    const pkg = StripeService.getPackage(packageId);
    
    if (!pkg) {
      return { success: false, error: 'Package not found' };
    }

    this.updateTransactionStatus(transactionId, 'processing');

    const result = await PayPalService.createOrder(
      userId,
      packageId,
      pkg.price,
      pkg.currency
    );

    if (result.success) {
      this.updateTransaction(transactionId, {
        paymentId: result.orderId,
        status: 'processing'
      });
    } else {
      this.updateTransaction(transactionId, {
        status: 'failed',
        failedReason: result.error
      });
    }

    return result;
  }

  /**
   * Process demo payment (testing mode)
   */
  private async processDemoPayment(
    userId: string,
    packageId: string,
    transactionId: string,
    coins: number
  ): Promise<{ success: boolean; orderId?: string }> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Add coins to user balance
    EconomyService.addCoins(userId, coins, 'purchase', `Demo purchase: ${packageId}`);

    // Update transaction
    this.updateTransaction(transactionId, {
      status: 'completed',
      completedAt: new Date()
    });

    // Log activity
    ActivityLogService.logActivity({
      userId,
      action: 'coin_purchase',
      category: 'economy',
      details: `Purchased ${coins} coins (demo mode)`,
      metadata: { packageId, transactionId, coins }
    });

    return { success: true, orderId: transactionId };
  }

  /**
   * Complete payment after verification
   */
  async completePayment(transactionId: string): Promise<boolean> {
    try {
      const transaction = this.getTransaction(transactionId);
      
      if (!transaction) {
        console.error('Transaction not found:', transactionId);
        return false;
      }

      if (transaction.status === 'completed') {
        return true; // Already completed
      }

      // Add coins to user balance
      EconomyService.addCoins(
        transaction.userId,
        transaction.coins,
        'purchase',
        `Purchase ${transaction.packageId}`
      );

      // Update transaction
      this.updateTransaction(transactionId, {
        status: 'completed',
        completedAt: new Date()
      });

      // Log activity
      ActivityLogService.logActivity({
        userId: transaction.userId,
        action: 'coin_purchase',
        category: 'economy',
        details: `Purchased ${transaction.coins} coins via ${transaction.method}`,
        metadata: {
          packageId: transaction.packageId,
          transactionId,
          amount: transaction.amount,
          method: transaction.method
        }
      });

      return true;

    } catch (error) {
      console.error('Complete payment error:', error);
      return false;
    }
  }

  /**
   * Save transaction
   */
  private saveTransaction(transaction: PaymentTransaction) {
    try {
      const transactions = this.getTransactions();
      transactions.push(transaction);
      
      localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
  }

  /**
   * Get all transactions
   */
  getTransactions(): PaymentTransaction[] {
    try {
      const data = localStorage.getItem(this.TRANSACTIONS_KEY);
      if (!data) return [];
      
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * Get transaction by ID
   */
  getTransaction(transactionId: string): PaymentTransaction | null {
    return this.getTransactions().find(t => t.id === transactionId) || null;
  }

  /**
   * Update transaction status
   */
  private updateTransactionStatus(transactionId: string, status: PaymentTransaction['status']) {
    this.updateTransaction(transactionId, { status });
  }

  /**
   * Update transaction
   */
  private updateTransaction(transactionId: string, updates: Partial<PaymentTransaction>) {
    try {
      const transactions = this.getTransactions();
      const index = transactions.findIndex(t => t.id === transactionId);
      
      if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updates };
        localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions));
      }
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  }

  /**
   * Get user's transaction history
   */
  getUserTransactions(userId: string): PaymentTransaction[] {
    return this.getTransactions()
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get user's total spent (real money)
   */
  getUserTotalSpent(userId: string): number {
    return this.getUserTransactions(userId)
      .filter(t => t.status === 'completed' && t.method !== 'demo')
      .reduce((total, t) => total + t.amount, 0);
  }

  /**
   * Refund transaction (admin only)
   */
  async refundTransaction(transactionId: string, reason: string): Promise<boolean> {
    try {
      const transaction = this.getTransaction(transactionId);
      
      if (!transaction || transaction.status !== 'completed') {
        return false;
      }

      // Deduct coins
      EconomyService.deductCoins(
        transaction.userId,
        transaction.coins,
        `Refund: ${reason}`
      );

      // Update transaction
      this.updateTransaction(transactionId, {
        status: 'refunded',
        failedReason: reason
      });

      // Log activity
      ActivityLogService.logActivity({
        userId: transaction.userId,
        action: 'payment_refund',
        category: 'economy',
        details: `Refunded ${transaction.coins} coins: ${reason}`,
        metadata: { transactionId, reason }
      });

      return true;

    } catch (error) {
      console.error('Refund error:', error);
      return false;
    }
  }
}

export const PaymentService = new PaymentServiceClass();
