import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '@/contexts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  X,
  Gift,
  Users,
  Calendar,
  Trophy,
  Crown,
  MessageCircle,
  Star,
  Check
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'gift' | 'event' | 'family' | 'achievement' | 'system' | 'friend';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  icon: React.ReactNode;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export default function NotificationsPanel() {
  const navigate = useNavigate();
  const { locale, dir } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    // بيانات تجريبية
    const demoNotifications: Notification[] = [
      {
        id: '1',
        type: 'gift',
        title: 'New Gift Received',
        titleAr: 'هدية جديدة',
        message: 'You received a Rose from Ahmed',
        messageAr: 'استلمت وردة من أحمد',
        icon: <Gift className="w-5 h-5 text-pink-500" />,
        timestamp: new Date(Date.now() - 5 * 60000),
        read: false,
        actionUrl: '/profile'
      },
      {
        id: '2',
        type: 'event',
        title: 'Event Starting Soon',
        titleAr: 'فعالية قريبة',
        message: 'Voice Battle Championship starts in 1 hour',
        messageAr: 'بطولة معركة الأصوات تبدأ خلال ساعة',
        icon: <Calendar className="w-5 h-5 text-purple-500" />,
        timestamp: new Date(Date.now() - 15 * 60000),
        read: false,
        actionUrl: '/events'
      },
      {
        id: '3',
        type: 'family',
        title: 'Family Invitation',
        titleAr: 'دعوة عائلة',
        message: 'You were invited to join Dragons Family',
        messageAr: 'تمت دعوتك للانضمام لعائلة التنانين',
        icon: <Users className="w-5 h-5 text-green-500" />,
        timestamp: new Date(Date.now() - 30 * 60000),
        read: false,
        actionUrl: '/family'
      },
      {
        id: '4',
        type: 'achievement',
        title: 'Achievement Unlocked',
        titleAr: 'إنجاز جديد',
        message: 'You earned "Lucky Winner" badge',
        messageAr: 'حصلت على شارة "الفائز المحظوظ"',
        icon: <Trophy className="w-5 h-5 text-yellow-500" />,
        timestamp: new Date(Date.now() - 60 * 60000),
        read: true,
        actionUrl: '/profile/achievements'
      },
      {
        id: '5',
        type: 'system',
        title: 'Premium Subscription',
        titleAr: 'اشتراك مميز',
        message: 'Your premium subscription expires in 3 days',
        messageAr: 'اشتراكك المميز ينتهي خلال 3 أيام',
        icon: <Crown className="w-5 h-5 text-orange-500" />,
        timestamp: new Date(Date.now() - 2 * 60 * 60000),
        read: true,
        actionUrl: '/premium'
      }
    ];

    setNotifications(demoNotifications);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) {
      return locale === 'ar' ? 'الآن' : 'now';
    }
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return locale === 'ar' ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return locale === 'ar' ? `منذ ${hours} ساعة` : `${hours}h ago`;
    }
    
    const days = Math.floor(hours / 24);
    return locale === 'ar' ? `منذ ${days} يوم` : `${days}d ago`;
  };

  return (
    <>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 rounded-full text-xs flex items-center justify-center text-white font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notifications Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div
            className={`fixed top-16 ${dir === 'rtl' ? 'left-4' : 'right-4'} w-96 max-w-[calc(100vw-2rem)] bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50`}
            dir={dir}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white">
                  {locale === 'ar' ? 'الإشعارات' : 'Notifications'}
                </h3>
                {unreadCount > 0 && (
                  <Badge className="bg-red-600">{unreadCount}</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    {locale === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read'}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <ScrollArea className="h-[500px]">
              {notifications.length > 0 ? (
                <div className="p-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`group relative p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        notification.read
                          ? 'bg-gray-800/50 hover:bg-gray-800'
                          : 'bg-purple-900/20 hover:bg-purple-900/30 border border-purple-500/30'
                      }`}
                    >
                      {/* Unread Indicator */}
                      {!notification.read && (
                        <div className="absolute top-3 right-3 w-2 h-2 bg-purple-500 rounded-full" />
                      )}

                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                            {notification.icon}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white text-sm mb-1">
                            {locale === 'ar' ? notification.titleAr : notification.title}
                          </h4>
                          <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                            {locale === 'ar' ? notification.messageAr : notification.message}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{getTimeAgo(notification.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <Bell className="w-16 h-16 text-gray-600 mb-4" />
                  <p className="text-gray-400">
                    {locale === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
                  </p>
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t border-gray-800">
              <Button
                variant="ghost"
                className="w-full text-purple-400 hover:text-purple-300"
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
              >
                {locale === 'ar' ? 'عرض جميع الإشعارات' : 'View all notifications'}
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
