import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PaymentService, PaymentMethod } from '@/services/payment/PaymentService';
import { StripeService, CoinPackage } from '@/services/payment/StripeService';
import { AuthService } from '@/services/AuthService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Sparkles, 
  Check, 
  ArrowLeft,
  Zap,
  Crown,
  Gift,
  AlertCircle
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useLocale } from '@/contexts';

const CoinPurchaseEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, locale } = useLocale();
  const currentUser = AuthService.getCurrentUser();
  
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('demo');
  const [loading, setLoading] = useState(false);
  const [availableMethods, setAvailableMethods] = useState<PaymentMethod[]>([]);

  const isRTL = locale === 'ar';

  useEffect(() => {
    // Load packages
    const pkgs = StripeService.getPackages();
    setPackages(pkgs);

    // Load available payment methods
    const methods = PaymentService.getAvailablePaymentMethods();
    setAvailableMethods(methods);

    // Check if returning from payment
    const status = searchParams.get('status');
    const sessionId = searchParams.get('session_id');
    const transactionId = searchParams.get('transaction_id');

    if (status === 'success' && transactionId) {
      handlePaymentSuccess(transactionId);
    } else if (status === 'cancelled') {
      showError(isRTL ? 'تم إلغاء عملية الدفع' : 'Payment cancelled');
    }
  }, [searchParams, isRTL]);

  const handlePaymentSuccess = async (transactionId: string) => {
    setLoading(true);
    try {
      const success = await PaymentService.completePayment(transactionId);
      
      if (success) {
        showSuccess(isRTL ? 'تم شحن العملات بنجاح! 🎉' : 'Coins added successfully! 🎉');
        setTimeout(() => navigate('/wallet'), 2000);
      } else {
        showError(isRTL ? 'فشل تأكيد الدفع' : 'Payment verification failed');
      }
    } catch (error) {
      showError(isRTL ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!currentUser?.id) {
      showError(isRTL ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
      navigate('/auth/login');
      return;
    }

    if (!selectedPackage) {
      showError(isRTL ? 'اختر باقة أولاً' : 'Please select a package');
      return;
    }

    setLoading(true);

    try {
      const result = await PaymentService.purchaseCoins(
        currentUser.id,
        selectedPackage,
        selectedMethod,
        {
          successUrl: `${window.location.origin}/store/coins?status=success&transaction_id=`,
          cancelUrl: `${window.location.origin}/store/coins?status=cancelled`
        }
      );

      if (result.success) {
        if (selectedMethod === 'demo') {
          showSuccess(isRTL ? 'تم شحن العملات بنجاح (وضع تجريبي)' : 'Coins added (demo mode)');
          setTimeout(() => navigate('/wallet'), 1500);
        }
        // For Stripe/PayPal, user will be redirected
      } else {
        showError(result.error || (isRTL ? 'فشلت عملية الدفع' : 'Payment failed'));
      }
    } catch (error) {
      showError(isRTL ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'stripe':
        return '💳';
      case 'paypal':
        return '🅿️';
      case 'google_pay':
        return '🅖';
      case 'apple_pay':
        return '🍎';
      case 'demo':
        return '🎮';
      default:
        return '💰';
    }
  };

  const getMethodName = (method: PaymentMethod) => {
    const names = {
      stripe: isRTL ? 'بطاقة ائتمان' : 'Credit Card',
      paypal: 'PayPal',
      google_pay: 'Google Pay',
      apple_pay: 'Apple Pay',
      demo: isRTL ? 'وضع تجريبي' : 'Demo Mode'
    };
    return names[method] || method;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                {isRTL ? 'شراء العملات' : 'Purchase Coins'}
              </h1>
              <p className="text-sm text-gray-400">
                {isRTL ? 'اختر الباقة المناسبة لك' : 'Choose the package that suits you'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {packages.map((pkg) => {
            const isSelected = selectedPackage === pkg.id;
            const totalCoins = pkg.coins + pkg.bonus;

            return (
              <Card
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={`
                  relative overflow-hidden cursor-pointer transition-all
                  ${isSelected
                    ? 'bg-gradient-to-br from-purple-600/30 to-blue-600/30 border-purple-400 scale-105'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }
                `}
              >
                {/* Badges */}
                <div className="absolute top-3 right-3 flex gap-2">
                  {pkg.popular && (
                    <Badge className="bg-yellow-500 text-black">
                      <Zap className="w-3 h-3 mr-1" />
                      {isRTL ? 'شائع' : 'Popular'}
                    </Badge>
                  )}
                  {pkg.bestValue && (
                    <Badge className="bg-green-500 text-black">
                      <Crown className="w-3 h-3 mr-1" />
                      {isRTL ? 'الأفضل' : 'Best Value'}
                    </Badge>
                  )}
                </div>

                <CardHeader className="pt-12">
                  <div className="text-center">
                    <div className="text-5xl mb-2">💰</div>
                    <CardTitle className="text-2xl font-bold">
                      {totalCoins.toLocaleString(isRTL ? 'ar' : 'en')}
                    </CardTitle>
                    <p className="text-gray-400 text-sm mt-1">
                      {isRTL ? 'عملة' : 'Coins'}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="text-center space-y-4">
                  {/* Price */}
                  <div className="text-3xl font-bold text-yellow-400">
                    ${pkg.price}
                  </div>

                  {/* Bonus */}
                  {pkg.bonus > 0 && (
                    <div className="flex items-center justify-center gap-2 text-green-400">
                      <Gift className="w-4 h-4" />
                      <span className="text-sm">
                        +{pkg.bonus} {isRTL ? 'عملة مجانية' : 'bonus coins'}
                      </span>
                    </div>
                  )}

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="flex items-center justify-center gap-2 text-green-400">
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-semibold">
                        {isRTL ? 'محدد' : 'Selected'}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Payment Methods */}
        {selectedPackage && (
          <Card className="bg-white/5 border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {isRTL ? 'اختر طريقة الدفع' : 'Select Payment Method'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableMethods.map((method) => (
                  <button
                    key={method}
                    onClick={() => setSelectedMethod(method)}
                    className={`
                      p-4 rounded-xl border-2 transition-all
                      ${selectedMethod === method
                        ? 'border-purple-400 bg-purple-500/20'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }
                    `}
                  >
                    <div className="text-4xl mb-2">{getMethodIcon(method)}</div>
                    <div className="text-sm font-semibold">{getMethodName(method)}</div>
                    {method === 'demo' && (
                      <div className="text-xs text-yellow-400 mt-1">
                        {isRTL ? 'للاختبار فقط' : 'Testing only'}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Demo Warning */}
              {selectedMethod === 'demo' && (
                <div className="mt-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-200">
                    <p className="font-semibold mb-1">
                      {isRTL ? 'وضع تجريبي' : 'Demo Mode'}
                    </p>
                    <p className="text-yellow-300/80">
                      {isRTL 
                        ? 'هذا وضع اختباري فقط. لن يتم خصم أي مبلغ حقيقي. للمدفوعات الحقيقية، قم بإعداد Stripe أو PayPal.'
                        : 'This is demo mode only. No real money will be charged. For real payments, configure Stripe or PayPal.'
                      }
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Purchase Button */}
        {selectedPackage && (
          <div className="flex justify-center">
            <Button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full max-w-md h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? (
                <span>{isRTL ? 'جارٍ المعالجة...' : 'Processing...'}</span>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  {isRTL ? 'شراء الآن' : 'Purchase Now'}
                </>
              )}
            </Button>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-semibold mb-1">
                {isRTL ? 'دفع آمن' : 'Secure Payment'}
              </h3>
              <p className="text-sm text-gray-400">
                {isRTL ? 'معاملات مشفرة بتقنية SSL' : 'SSL encrypted transactions'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold mb-1">
                {isRTL ? 'شحن فوري' : 'Instant Delivery'}
              </h3>
              <p className="text-sm text-gray-400">
                {isRTL ? 'العملات تصل فوراً بعد الدفع' : 'Coins added immediately'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">💎</div>
              <h3 className="font-semibold mb-1">
                {isRTL ? 'عملات إضافية' : 'Bonus Coins'}
              </h3>
              <p className="text-sm text-gray-400">
                {isRTL ? 'احصل على عملات إضافية مع كل شراء' : 'Get extra coins with every purchase'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CoinPurchaseEnhanced;
