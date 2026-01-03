/**
 * Performance Optimization Utilities
 * أدوات تحسين الأداء للتطبيق
 */

import { lazy, ComponentType } from 'react';

/**
 * Lazy load component with retry logic
 * تحميل كسول للمكونات مع إعادة المحاولة عند الفشل
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  componentImport: () => Promise<{ default: T }>,
  retries = 3
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        const component = await componentImport();
        return component;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Failed to load component (attempt ${i + 1}/${retries}):`, error);

        // Wait before retrying (exponential backoff)
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }

    throw lastError || new Error('Failed to load component after retries');
  });
}

/**
 * Preload component
 * تحميل مسبق للمكون
 */
export function preloadComponent(
  componentImport: () => Promise<{ default: ComponentType<unknown> }>
): void {
  componentImport().catch(err => {
    console.warn('Preload failed:', err);
  });
}

/**
 * Debounce function
 * تأخير تنفيذ الدالة حتى توقف الاستدعاءات
 */
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Throttle function
 * تحديد معدل تنفيذ الدالة
 */
export function throttle<T extends (...args: never[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Measure component render time
 * قياس وقت تصيير المكون
 */
export function measurePerformance(componentName: string) {
  if (process.env.NODE_ENV === 'development') {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 16) { // More than one frame (60fps)
        console.warn(`⚠️ ${componentName} took ${duration.toFixed(2)}ms to render`);
      }
    };
  }
  
  return () => {};
}

/**
 * Image lazy loading with intersection observer
 * تحميل كسول للصور
 */
export function setupLazyImages() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

/**
 * Clear cache and reload
 * مسح الذاكرة المؤقتة وإعادة التحميل
 */
export async function clearCacheAndReload() {
  try {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear service worker cache
    if ('serviceWorker' in navigator && 'caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    
    // Reload page
    window.location.reload();
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}

/**
 * Get bundle size info
 * الحصول على معلومات حجم الحزمة
 */
export function getBundleInfo() {
  if (process.env.NODE_ENV === 'development') {
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    
    scripts.forEach(script => {
      const src = (script as HTMLScriptElement).src;
      if (src) {
        // Estimate size (in production, use actual measurements)
        totalSize += 100; // KB (placeholder)
      }
    });
    
    console.log(`📦 Estimated bundle size: ~${totalSize}KB`);
  }
}

/**
 * Monitor memory usage
 * مراقبة استخدام الذاكرة
 */
export function monitorMemory() {
  if ('memory' in performance && process.env.NODE_ENV === 'development') {
    const memory = (performance as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
    if (!memory) return;
    const usedMB = (memory.usedJSHeapSize / 1048576).toFixed(2);
    const totalMB = (memory.jsHeapSizeLimit / 1048576).toFixed(2);
    
    console.log(`💾 Memory: ${usedMB}MB / ${totalMB}MB`);
    
    if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.9) {
      console.warn('⚠️ High memory usage detected!');
    }
  }
}

/**
 * Prefetch route
 * تحميل مسبق للمسار
 */
export function prefetchRoute(path: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = path;
  document.head.appendChild(link);
}

/**
 * Virtual scrolling helper
 * مساعد للتمرير الافتراضي
 */
export function getVisibleItems<T>(
  items: T[],
  scrollTop: number,
  itemHeight: number,
  containerHeight: number
): { visibleItems: T[]; startIndex: number; endIndex: number } {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight)
  );

  return {
    visibleItems: items.slice(startIndex, endIndex + 1),
    startIndex,
    endIndex,
  };
}
