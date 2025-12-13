// Service Worker للإشعارات الفورية
/* eslint-disable no-restricted-globals */

// التثبيت
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// التفعيل
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

// استقبال Push Notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  let data = {
    title: 'إشعار جديد',
    body: 'لديك إشعار جديد',
    icon: '/images/logo.png',
    badge: '/images/badge.png',
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/images/logo.png',
    badge: data.badge || '/images/badge.png',
    image: data.image,
    tag: data.tag || 'default',
    data: data.data,
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'فتح' },
      { action: 'close', title: 'إغلاق' },
    ],
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'close') {
    return;
  }

  // فتح التطبيق
  const urlToOpen = data?.actionUrl || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // البحث عن نافذة مفتوحة
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // فتح نافذة جديدة
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// إغلاق الإشعار
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

// رسائل من الصفحة الرئيسية
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
