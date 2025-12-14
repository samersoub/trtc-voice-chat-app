/**
 * Stripe Payment Service
 * Handles real money payments via Stripe
 */

import { loadStripe, Stripe, StripeError } from '@stripe/stripe-js';

export interface CoinPackage {
  id: string;
  name: string;
  nameAr: string;
  coins: number;
  price: number; // USD
  currency: string;
  bonus: number; // Extra coins
  popular?: boolean;
  bestValue?: boolean;
}

export interface PaymentResult {
  success: boolean;
  sessionId?: string;
  error?: string;
  orderId?: string;
}

export interface PaymentSession {
  id: string;
  userId: string;
  packageId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  stripeSessionId?: string;
  createdAt: Date;
  completedAt?: Date;
}

class StripeServiceClass {
  private stripePromise: Promise<Stripe | null> | null = null;
  private readonly SESSIONS_KEY = 'payment_sessions';
  
  // Coin packages
  private readonly PACKAGES: CoinPackage[] = [
    {
      id: 'pkg_100',
      name: '100 Coins',
      nameAr: '100 عملة',
      coins: 100,
      price: 0.99,
      currency: 'USD',
      bonus: 0
    },
    {
      id: 'pkg_500',
      name: '500 Coins',
      nameAr: '500 عملة',
      coins: 500,
      price: 4.99,
      currency: 'USD',
      bonus: 50,
      popular: true
    },
    {
      id: 'pkg_1200',
      name: '1,200 Coins',
      nameAr: '1,200 عملة',
      coins: 1200,
      price: 9.99,
      currency: 'USD',
      bonus: 200,
      bestValue: true
    },
    {
      id: 'pkg_2500',
      name: '2,500 Coins',
      nameAr: '2,500 عملة',
      coins: 2500,
      price: 19.99,
      currency: 'USD',
      bonus: 500
    },
    {
      id: 'pkg_6500',
      name: '6,500 Coins',
      nameAr: '6,500 عملة',
      coins: 6500,
      price: 49.99,
      currency: 'USD',
      bonus: 1500
    },
    {
      id: 'pkg_14000',
      name: '14,000 Coins',
      nameAr: '14,000 عملة',
      coins: 14000,
      price: 99.99,
      currency: 'USD',
      bonus: 4000
    }
  ];

  constructor() {
    this.initializeStripe();
  }

  private initializeStripe() {
    // Get Stripe public key from environment
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    
    if (stripeKey) {
      this.stripePromise = loadStripe(stripeKey);
    } else {
      console.warn('⚠️ Stripe public key not configured');
    }
  }

  /**
   * Get all available coin packages
   */
  getPackages(): CoinPackage[] {
    return this.PACKAGES;
  }

  /**
   * Get a specific package by ID
   */
  getPackage(packageId: string): CoinPackage | null {
    return this.PACKAGES.find(pkg => pkg.id === packageId) || null;
  }

  /**
   * Create a Stripe checkout session
   */
  async createCheckoutSession(
    userId: string,
    packageId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<PaymentResult> {
    try {
      const pkg = this.getPackage(packageId);
      
      if (!pkg) {
        return {
          success: false,
          error: 'Package not found'
        };
      }

      // Check if Stripe is initialized
      if (!this.stripePromise) {
        return {
          success: false,
          error: 'Stripe not configured. Please set VITE_STRIPE_PUBLIC_KEY'
        };
      }

      // Create checkout session via backend API
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          packageId,
          amount: pkg.price,
          currency: pkg.currency,
          coins: pkg.coins + pkg.bonus,
          successUrl,
          cancelUrl
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const session = await response.json();

      // Save session locally
      this.saveSession({
        id: session.orderId,
        userId,
        packageId,
        amount: pkg.price,
        currency: pkg.currency,
        status: 'pending',
        stripeSessionId: session.sessionId,
        createdAt: new Date()
      });

      // Redirect to Stripe Checkout
      const stripe = await this.stripePromise;
      
      if (stripe) {
        const result = await stripe.redirectToCheckout({
          sessionId: session.sessionId
        });

        if (result.error) {
          return {
            success: false,
            error: result.error.message
          };
        }
      }

      return {
        success: true,
        sessionId: session.sessionId,
        orderId: session.orderId
      };

    } catch (error) {
      console.error('Stripe checkout error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }

  /**
   * Verify payment completion (called after redirect from Stripe)
   */
  async verifyPayment(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/stripe/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId })
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      
      // Update session status
      if (result.success) {
        this.updateSessionStatus(sessionId, 'completed');
      }

      return result.success;

    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  /**
   * Save payment session locally
   */
  private saveSession(session: PaymentSession) {
    try {
      const sessions = this.getSessions();
      sessions.push(session);
      
      // Keep only last 50 sessions
      const recentSessions = sessions.slice(-50);
      
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(recentSessions));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  /**
   * Get all payment sessions
   */
  getSessions(): PaymentSession[] {
    try {
      const data = localStorage.getItem(this.SESSIONS_KEY);
      if (!data) return [];
      
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * Update session status
   */
  private updateSessionStatus(sessionId: string, status: PaymentSession['status']) {
    try {
      const sessions = this.getSessions();
      const session = sessions.find(s => s.stripeSessionId === sessionId);
      
      if (session) {
        session.status = status;
        if (status === 'completed') {
          session.completedAt = new Date();
        }
        
        localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
      }
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  }

  /**
   * Get user's payment history
   */
  getUserPaymentHistory(userId: string): PaymentSession[] {
    return this.getSessions()
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Calculate total spent by user
   */
  getUserTotalSpent(userId: string): number {
    return this.getUserPaymentHistory(userId)
      .filter(session => session.status === 'completed')
      .reduce((total, session) => total + session.amount, 0);
  }

  /**
   * Demo mode: Simulate payment (for testing without Stripe)
   */
  async simulatePayment(userId: string, packageId: string): Promise<PaymentResult> {
    const pkg = this.getPackage(packageId);
    
    if (!pkg) {
      return {
        success: false,
        error: 'Package not found'
      };
    }

    // Create fake session
    const orderId = `demo_${Date.now()}`;
    
    this.saveSession({
      id: orderId,
      userId,
      packageId,
      amount: pkg.price,
      currency: pkg.currency,
      status: 'completed',
      createdAt: new Date(),
      completedAt: new Date()
    });

    return {
      success: true,
      orderId,
      sessionId: 'demo_session'
    };
  }
}

export const StripeService = new StripeServiceClass();
