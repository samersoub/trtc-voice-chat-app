import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '@/contexts';
import { AuthService } from '@/services/AuthService';
import { MessagesService, Message, UserMessage, AppNotification, AdminNotification } from '@/services/MessagesService';
import { 
  MessageCircle, 
  Bell, 
  ShieldAlert, 
  Search, 
  Trash2, 
  Check, 
  CheckCheck,
  Circle,
  AlertCircle,
  Gift,
  Trophy,
  Users
} from 'lucide-react';

type TabType = 'user' | 'app' | 'admin';

const Messages = () => {
  const { t, dir } = useLocale();
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const [activeTab, setActiveTab] = useState<TabType>('user');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (currentUser) {
      loadMessages();
    }
  }, [currentUser, activeTab]);

  const loadMessages = () => {
    if (!currentUser) return;
    const allMessages = MessagesService.getMessagesByType(currentUser.id, activeTab);
    setMessages(allMessages);
  };

  const handleMarkAsRead = (messageId: string) => {
    MessagesService.markAsRead(messageId);
    loadMessages();
  };

  const handleMarkAllAsRead = () => {
    if (!currentUser) return;
    MessagesService.markAllAsRead(currentUser.id, activeTab);
    loadMessages();
  };

  const handleDeleteMessage = (messageId: string) => {
    MessagesService.deleteMessage(messageId);
    loadMessages();
  };

  const getUnreadCount = (type: TabType) => {
    if (!currentUser) return 0;
    return MessagesService.getUnreadCount(currentUser.id, type);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return dir === 'rtl' ? 'الآن' : 'now';
    if (minutes < 60) return dir === 'rtl' ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
    if (hours < 24) return dir === 'rtl' ? `منذ ${hours} ساعة` : `${hours}h ago`;
    return dir === 'rtl' ? `منذ ${days} يوم` : `${days}d ago`;
  };

  const getNotificationIcon = (notification: AppNotification | AdminNotification) => {
    const iconMap: { [key: string]: JSX.Element } = {
      '🎁': <Gift className="w-5 h-5 text-pink-400" />,
      '🏆': <Trophy className="w-5 h-5 text-yellow-400" />,
      '👥': <Users className="w-5 h-5 text-blue-400" />,
    };
    return iconMap[notification.icon] || <Bell className="w-5 h-5 text-purple-400" />;
  };

  const filteredMessages = searchQuery 
    ? messages.filter(msg => {
        if (msg.type === 'user') {
          return msg.fromUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 msg.content.toLowerCase().includes(searchQuery.toLowerCase());
        } else {
          return msg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 msg.content.toLowerCase().includes(searchQuery.toLowerCase());
        }
      })
    : messages;

  const renderUserMessage = (msg: UserMessage) => (
    <div
      key={msg.id}
      onClick={() => handleMarkAsRead(msg.id)}
      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
        msg.status === 'unread'
          ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30'
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
      dir={dir}
    >
      <div className="flex items-start gap-3">
        {/* Avatar with online indicator */}
        <div className="relative flex-shrink-0">
          <img
            src={msg.fromUserAvatar}
            alt={msg.fromUserName}
            className="w-12 h-12 rounded-full border-2 border-purple-500/50"
          />
          {msg.isOnline && (
            <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-green-500 text-green-500" />
          )}
        </div>

        {/* Message content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">{msg.fromUserName}</h3>
            <span className="text-xs text-gray-400 whitespace-nowrap">{formatTime(msg.createdAt)}</span>
          </div>
          <p className={`text-sm ${msg.status === 'unread' ? 'text-white' : 'text-gray-400'} line-clamp-2`}>
            {msg.content}
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex-shrink-0">
          {msg.status === 'unread' ? (
            <Circle className="w-2 h-2 fill-blue-500 text-blue-500" />
          ) : (
            <CheckCheck className="w-4 h-4 text-gray-500" />
          )}
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteMessage(msg.id);
          }}
          className="flex-shrink-0 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
          aria-label="Delete message"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </div>
  );

  const renderAppNotification = (notification: AppNotification) => (
    <div
      key={notification.id}
      onClick={() => {
        handleMarkAsRead(notification.id);
        if (notification.actionUrl) {
          navigate(notification.actionUrl);
        }
      }}
      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
        notification.status === 'unread'
          ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/30'
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
      dir={dir}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 p-2 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
          {getNotificationIcon(notification)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-semibold text-white">{notification.title}</h3>
            <span className="text-xs text-gray-400 whitespace-nowrap">{formatTime(notification.createdAt)}</span>
          </div>
          <p className={`text-sm ${notification.status === 'unread' ? 'text-white' : 'text-gray-400'}`}>
            {notification.content}
          </p>
        </div>

        {/* Status & Delete */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {notification.status === 'unread' && (
            <Circle className="w-2 h-2 fill-blue-500 text-blue-500" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteMessage(notification.id);
            }}
            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
            aria-label="Delete notification"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderAdminNotification = (notification: AdminNotification) => {
    const priorityColors = {
      low: 'from-gray-500/20 to-slate-500/20 border-gray-500/30',
      medium: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
      high: 'from-red-500/20 to-pink-500/20 border-red-500/30',
    };

    const priorityIcons = {
      low: <AlertCircle className="w-5 h-5 text-gray-400" />,
      medium: <AlertCircle className="w-5 h-5 text-yellow-400" />,
      high: <ShieldAlert className="w-5 h-5 text-red-400" />,
    };

    return (
      <div
        key={notification.id}
        onClick={() => {
          handleMarkAsRead(notification.id);
          if (notification.actionUrl) {
            navigate(notification.actionUrl);
          }
        }}
        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
          notification.status === 'unread'
            ? `bg-gradient-to-br ${priorityColors[notification.priority]}`
            : 'bg-white/5 border-white/10 hover:bg-white/10'
        }`}
        dir={dir}
      >
        <div className="flex items-start gap-3">
          {/* Priority icon */}
          <div className="flex-shrink-0 p-2 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20">
            {priorityIcons[notification.priority]}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h3 className="font-semibold text-white">{notification.title}</h3>
              {notification.priority === 'high' && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">
                  {dir === 'rtl' ? 'عاجل' : 'Urgent'}
                </span>
              )}
            </div>
            <p className={`text-sm ${notification.status === 'unread' ? 'text-white' : 'text-gray-400'} mb-2`}>
              {notification.content}
            </p>
            <span className="text-xs text-gray-500">{formatTime(notification.createdAt)}</span>
          </div>

          {/* Status & Delete */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {notification.status === 'unread' && (
              <Circle className="w-2 h-2 fill-red-500 text-red-500" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteMessage(notification.id);
              }}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
              aria-label="Delete admin notification"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-20" dir={dir}>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white mb-4">
            {dir === 'rtl' ? 'الرسائل' : 'Messages'}
          </h1>

          {/* Search bar */}
          <div className="relative mb-4">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={dir === 'rtl' ? 'بحث...' : 'Search...'}
              className={`w-full ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('user')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span>{dir === 'rtl' ? 'الرسائل' : 'Messages'}</span>
              {getUnreadCount('user') > 0 && (
                <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {getUnreadCount('user')}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('app')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'app'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Bell className="w-5 h-5" />
              <span>{dir === 'rtl' ? 'الإشعارات' : 'Notifications'}</span>
              {getUnreadCount('app') > 0 && (
                <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {getUnreadCount('app')}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
              <span>{dir === 'rtl' ? 'الإدارة' : 'Admin'}</span>
              {getUnreadCount('admin') > 0 && (
                <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {getUnreadCount('admin')}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mark all as read */}
        {getUnreadCount(activeTab) > 0 && (
          <div className="px-4 pb-3">
            <button
              onClick={handleMarkAllAsRead}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{dir === 'rtl' ? 'تعليم الكل كمقروء' : 'Mark All as Read'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Messages list */}
      <div className="p-4 space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-white/5 mb-4">
              {activeTab === 'user' && <MessageCircle className="w-12 h-12 text-gray-500" />}
              {activeTab === 'app' && <Bell className="w-12 h-12 text-gray-500" />}
              {activeTab === 'admin' && <ShieldAlert className="w-12 h-12 text-gray-500" />}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {dir === 'rtl' ? 'لا توجد رسائل' : 'No messages'}
            </h3>
            <p className="text-gray-400">
              {dir === 'rtl' 
                ? searchQuery ? 'لم يتم العثور على نتائج' : 'لا توجد رسائل بعد'
                : searchQuery ? 'No results found' : 'No messages yet'}
            </p>
          </div>
        ) : (
          <>
            {filteredMessages.map((msg) => {
              if (msg.type === 'user') return renderUserMessage(msg as UserMessage);
              if (msg.type === 'app') return renderAppNotification(msg as AppNotification);
              if (msg.type === 'admin') return renderAdminNotification(msg as AdminNotification);
              return null;
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;