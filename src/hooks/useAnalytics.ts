import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AnalyticsService from '@/services/AnalyticsService';

/**
 * useAnalytics Hook - تتبع الصفحات والأحداث تلقائياً
 * Automatically tracks page views and provides event tracking methods
 */
export function useAnalytics() {
  const location = useLocation();

  // Track page views automatically
  useEffect(() => {
    AnalyticsService.trackPageView({
      page_path: location.pathname,
      page_title: document.title,
    });
  }, [location]);

  return {
    trackEvent: AnalyticsService.trackEvent.bind(AnalyticsService),
    trackVoiceRoom: AnalyticsService.trackVoiceRoom,
    trackAuth: AnalyticsService.trackAuth,
    trackGift: AnalyticsService.trackGift,
    trackSearch: AnalyticsService.trackSearch,
    trackError: AnalyticsService.trackError.bind(AnalyticsService),
    trackPerformance: AnalyticsService.trackPerformance.bind(AnalyticsService),
  };
}

/**
 * Initialize analytics in main app
 * استخدام: ضع في App.tsx
 * 
 * @example
 * initializeAnalytics('G-XXXXXXXXXX');
 */
export function initializeAnalytics(measurementId: string) {
  AnalyticsService.initialize(measurementId);
}

/**
 * Set user ID for tracking
 * تعيين معرف المستخدم
 */
export function setAnalyticsUserId(userId: string) {
  AnalyticsService.setUserId(userId);
}

/**
 * Clear user ID
 * مسح معرف المستخدم
 */
export function clearAnalyticsUserId() {
  AnalyticsService.clearUserId();
}
