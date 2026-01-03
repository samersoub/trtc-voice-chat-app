/**
 * PayPal Payment Service
 * Handles real money payments via PayPal
 */

export interface PayPalOrder {
  id: string;
  userId: string;
  packageId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paypalOrderId?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface PayPalResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

class PayPalServiceClass {
  private readonly ORDERS_KEY = 'paypal_orders';
  private clientId: string | null = null;

  constructor() {
    this.clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || null;
    
    if (!this.clientId) {
      console.warn('⚠️ PayPal client ID not configured');
    }
  }

  /**
   * Initialize PayPal SDK
   */
  async initializePayPal(): Promise<boolean> {
    if (!this.clientId) {
      console.error('PayPal client ID not configured');
      return false;
    }

    // Check if PayPal SDK is already loaded
    if (window.paypal) {
      return true;
    }

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${this.clientId}&currency=USD`;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  /**
   * Create PayPal order
   */
  async createOrder(
    userId: string,
    packageId: string,
    amount: number,
    currency: string = 'USD'
  ): Promise<PayPalResult> {
    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          packageId,
          amount,
          currency
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create PayPal order');
      }

      const order = await response.json();

      // Save order locally
      this.saveOrder({
        id: order.orderId,
        userId,
        packageId,
        amount,
        currency,
        status: 'pending',
        paypalOrderId: order.paypalOrderId,
        createdAt: new Date()
      });

      return {
        success: true,
        orderId: order.orderId
      };

    } catch (error) {
      console.error('PayPal order creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Order creation failed'
      };
    }
  }

  /**
   * Capture PayPal payment
   */
  async capturePayment(orderId: string): Promise<PayPalResult> {
    try {
      const response = await fetch('/api/paypal/capture-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId })
      });

      if (!response.ok) {
        throw new Error('Failed to capture payment');
      }

      const result = await response.json();

      if (result.success) {
        this.updateOrderStatus(orderId, 'completed');
      }

      return {
        success: result.success,
        orderId
      };

    } catch (error) {
      console.error('PayPal capture error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment capture failed'
      };
    }
  }

  /**
   * Save order locally
   */
  private saveOrder(order: PayPalOrder) {
    try {
      const orders = this.getOrders();
      orders.push(order);
      
      // Keep only last 50 orders
      const recentOrders = orders.slice(-50);
      
      localStorage.setItem(this.ORDERS_KEY, JSON.stringify(recentOrders));
    } catch (error) {
      console.error('Failed to save order:', error);
    }
  }

  /**
   * Get all orders
   */
  getOrders(): PayPalOrder[] {
    try {
      const data = localStorage.getItem(this.ORDERS_KEY);
      if (!data) return [];
      
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * Update order status
   */
  private updateOrderStatus(orderId: string, status: PayPalOrder['status']) {
    try {
      const orders = this.getOrders();
      const order = orders.find(o => o.id === orderId);
      
      if (order) {
        order.status = status;
        if (status === 'completed') {
          order.completedAt = new Date();
        }
        
        localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  }

  /**
   * Get user's order history
   */
  getUserOrderHistory(userId: string): PayPalOrder[] {
    return this.getOrders()
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Demo mode: Simulate payment
   */
  async simulatePayment(userId: string, packageId: string, amount: number): Promise<PayPalResult> {
    const orderId = `paypal_demo_${Date.now()}`;
    
    this.saveOrder({
      id: orderId,
      userId,
      packageId,
      amount,
      currency: 'USD',
      status: 'completed',
      createdAt: new Date(),
      completedAt: new Date()
    });

    return {
      success: true,
      orderId
    };
  }
}

export const PayPalService = new PayPalServiceClass();

// Extend Window interface for PayPal SDK
declare global {
  interface Window {
    paypal?: any;
  }
}
