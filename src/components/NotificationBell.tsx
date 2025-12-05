import { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Settings } from 'lucide-react';
import { NotificationService, Notification } from '@/services/NotificationService';
import { AuthService } from '@/services/AuthService';
import UserAvatar from '@/components/profile/UserAvatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    if (!currentUser) return;

    const updateNotifications = () => {
      setNotifications(NotificationService.getUserNotifications(currentUser.id));
      setUnreadCount(NotificationService.getUnreadCount(currentUser.id));
    };

    updateNotifications();
    const unsubscribe = NotificationService.subscribe(updateNotifications);
    return unsubscribe;
  }, [currentUser]);

  const handleNotificationClick = (notification: Notification) => {
    if (!currentUser) return;

    NotificationService.markAsRead(currentUser.id, notification.id);
    setIsOpen(false);

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleMarkAllRead = () => {
    if (!currentUser) return;
    NotificationService.markAllAsRead(currentUser.id);
  };

  const handleClearAll = () => {
    if (!currentUser) return;
    NotificationService.clearAll(currentUser.id);
  };

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    if (!currentUser) return;
    NotificationService.deleteNotification(currentUser.id, notificationId);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'follow':
        return '👤';
      case 'room_invite':
        return '🎤';
      case 'mention':
        return '💬';
      case 'gift':
        return '🎁';
      case 'message':
        return '✉️';
      case 'system':
        return '📢';
      default:
        return '🔔';
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-2rem)] bg-background border border-border rounded-lg shadow-xl z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} unread
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={handleMarkAllRead}
                      className="p-2 hover:bg-accent rounded-md transition-colors"
                      title="Mark all as read"
                      aria-label="Mark all as read"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="p-2 hover:bg-accent rounded-md transition-colors"
                      title="Clear all"
                      aria-label="Clear all notifications"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => navigate('/notifications/settings')}
                  className="p-2 hover:bg-accent rounded-md transition-colors"
                  title="Notification settings"
                  aria-label="Notification settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-accent rounded-md transition-colors"
                  aria-label="Close notifications"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    We'll notify you when something happens
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full p-4 text-left transition-colors hover:bg-accent relative group ${
                        !notification.isRead ? 'bg-accent/50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Avatar or Icon */}
                        {notification.fromUserAvatar ? (
                          <UserAvatar
                            userId={notification.fromUserId || ''}
                            userName={notification.fromUserName || ''}
                            avatarUrl={notification.fromUserAvatar}
                            size="md"
                            enableProfileModal={false}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm line-clamp-1">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {NotificationService.formatTime(notification.createdAt)}
                          </p>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => handleDelete(e, notification.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-background rounded-md transition-all flex-shrink-0"
                          aria-label="Delete notification"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/notifications');
                  }}
                  className="w-full"
                >
                  View All Notifications
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
