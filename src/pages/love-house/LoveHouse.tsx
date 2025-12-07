import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Gift, 
  Crown, 
  Sparkles, 
  Star,
  MessageCircle,
  Calendar,
  Award,
  TrendingUp,
  Lock,
  Unlock,
  ChevronLeft,
  Camera,
  Image as ImageIcon,
  Music,
  Video,
  Flame
} from 'lucide-react';
import { AuthService } from '@/services/AuthService';
import { RelationshipLevelService } from '@/services/RelationshipLevelService';
import { GiftService } from '@/services/GiftService';
import FemaleProfileFrame from '@/components/profile/FemaleProfileFrame';
import { showSuccess, showError } from '@/utils/toast';
import { useLocale } from '@/contexts';

interface LoveActivity {
  id: string;
  type: 'gift' | 'message' | 'milestone' | 'date';
  icon: string;
  title: string;
  description: string;
  timestamp: Date;
  points: number;
}

interface LoveChallenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  icon: string;
}

interface MemoryPhoto {
  id: string;
  url: string;
  caption: string;
  date: Date;
  likes: number;
}

const LoveHouse: React.FC = () => {
  const navigate = useNavigate();
  const { t, locale } = useLocale();
  const currentUser = AuthService.getCurrentUser();

  // States
  const [activeTab, setActiveTab] = useState<'home' | 'memories' | 'activities' | 'challenges'>('home');
  const [partner, setPartner] = useState({
    id: 'partner123',
    name: 'سارة السورية',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=partner123',
    isOnline: true,
    isSpeaking: false
  });

  const [loveStats, setLoveStats] = useState({
    totalPoints: 8500,
    daysTogether: 145,
    giftsExchanged: 83,
    messagesCount: 1247,
    photoMemories: 34,
    loveScore: 92
  });

  const [recentActivities, setRecentActivities] = useState<LoveActivity[]>([
    {
      id: '1',
      type: 'gift',
      icon: '🌹',
      title: 'أرسل هدية وردة',
      description: 'أرسل لك باقة ورود جميلة',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      points: 100
    },
    {
      id: '2',
      type: 'milestone',
      icon: '🎉',
      title: 'معلم جديد!',
      description: 'وصلتم إلى 5 أشهر معاً',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      points: 500
    },
    {
      id: '3',
      type: 'message',
      icon: '💌',
      title: 'رسالة حب',
      description: 'أرسلت لك رسالة رومانسية',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      points: 50
    }
  ]);

  const [challenges, setChallenges] = useState<LoveChallenge[]>([
    {
      id: '1',
      title: 'صباح الخير اليومي',
      description: 'أرسل رسالة صباح الخير لمدة 7 أيام متتالية',
      reward: 200,
      completed: false,
      icon: '☀️'
    },
    {
      id: '2',
      title: 'أسبوع الهدايا',
      description: 'أرسل هدية واحدة على الأقل كل يوم لمدة أسبوع',
      reward: 500,
      completed: false,
      icon: '🎁'
    },
    {
      id: '3',
      title: 'ألبوم الذكريات',
      description: 'أضف 10 صور لألبوم الذكريات المشتركة',
      reward: 300,
      completed: false,
      icon: '📸'
    }
  ]);

  const [memories, setMemories] = useState<MemoryPhoto[]>([
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400',
      caption: 'أول لقاء لنا ❤️',
      date: new Date(Date.now() - 145 * 24 * 60 * 60 * 1000),
      likes: 24
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400',
      caption: 'يوم جميل معاً 🌸',
      date: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
      likes: 31
    }
  ]);

  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [showMemoryDialog, setShowMemoryDialog] = useState(false);
  const [selectedGift, setSelectedGift] = useState<any>(null);

  // Get relationship level
  const relationship = currentUser?.id 
    ? RelationshipLevelService.getRelationship(currentUser.id, partner.id)
    : null;
  
  const currentLevel = currentUser?.id
    ? RelationshipLevelService.getCurrentLevel(currentUser.id, partner.id)
    : null;

  // Handle sending gift
  const handleSendGift = (gift: any) => {
    if (!currentUser?.id) return;
    
    RelationshipLevelService.addGiftPoints(currentUser.id, partner.id, gift.coinCost);
    
    const newActivity: LoveActivity = {
      id: Date.now().toString(),
      type: 'gift',
      icon: gift.icon,
      title: `أرسل هدية ${gift.nameAr}`,
      description: `قيمة ${gift.coinCost} عملة`,
      timestamp: new Date(),
      points: gift.coinCost
    };
    
    setRecentActivities([newActivity, ...recentActivities]);
    setLoveStats({
      ...loveStats,
      totalPoints: loveStats.totalPoints + gift.coinCost,
      giftsExchanged: loveStats.giftsExchanged + 1
    });
    
    showSuccess(`تم إرسال ${gift.nameAr} بنجاح! 💝`);
    setShowGiftDialog(false);
  };

  // Get available gifts
  const gifts = GiftService.getAll();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-white p-4 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold flex items-center gap-2 justify-center">
              <Heart className="w-7 h-7 fill-white animate-pulse" />
              بيت الحب
              <Heart className="w-7 h-7 fill-white animate-pulse" />
            </h1>
            <p className="text-white/90 text-sm mt-1">
              {loveStats.daysTogether} يوم معاً • {currentLevel?.name || 'بداية الحب'}
            </p>
          </div>

          <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all">
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Partners Section */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6 border-4 border-pink-200">
          <div className="flex items-center justify-center gap-8 mb-6">
            {/* Current User */}
            <div className="text-center">
              <FemaleProfileFrame 
                imageUrl={currentUser?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                isSpeaking={false}
                size="medium"
              />
              <p className="text-gray-800 font-bold mt-3">{currentUser?.name || 'أنت'}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Crown className="w-4 h-4 text-purple-500" />
                <span className="text-purple-600 text-sm font-medium">شريك مخلص</span>
              </div>
            </div>

            {/* Love Heart Animation */}
            <div className="relative">
              <div className="relative">
                <Heart className="w-20 h-20 text-pink-500 fill-pink-500 animate-pulse drop-shadow-2xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{loveStats.loveScore}%</span>
                </div>
              </div>
              {/* Floating hearts */}
              <div className="absolute -top-2 -left-2 animate-bounce">
                <Heart className="w-4 h-4 text-red-400 fill-red-400" />
              </div>
              <div className="absolute -bottom-2 -right-2 animate-bounce delay-100">
                <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
              </div>
            </div>

            {/* Partner */}
            <div className="text-center">
              <FemaleProfileFrame 
                imageUrl={partner.avatar}
                isSpeaking={partner.isSpeaking}
                size="medium"
              />
              <p className="text-gray-800 font-bold mt-3">{partner.name}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-orange-600 text-sm font-medium">
                  {partner.isOnline ? 'متصلة الآن' : 'غير متصلة'}
                </span>
              </div>
            </div>
          </div>

          {/* Love Level Progress */}
          {currentLevel && (
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">{currentLevel.name}</span>
                <span className="text-purple-600 font-bold">
                  {loveStats.totalPoints.toLocaleString()} نقطة
                </span>
              </div>
              <div className="h-3 bg-white rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${currentLevel.gradient} transition-all duration-500`}
                  style={{ 
                    width: `${RelationshipLevelService.getProgressToNextLevel(currentUser?.id || '', partner.id)}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-4 text-white text-center shadow-lg">
            <Gift className="w-8 h-8 mx-auto mb-2" />
            <p className="text-3xl font-bold">{loveStats.giftsExchanged}</p>
            <p className="text-sm opacity-90">هدية متبادلة</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl p-4 text-white text-center shadow-lg">
            <MessageCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-3xl font-bold">{loveStats.messagesCount}</p>
            <p className="text-sm opacity-90">رسالة حب</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-4 text-white text-center shadow-lg">
            <Calendar className="w-8 h-8 mx-auto mb-2" />
            <p className="text-3xl font-bold">{loveStats.daysTogether}</p>
            <p className="text-sm opacity-90">يوم معاً</p>
          </div>
          
          <div className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl p-4 text-white text-center shadow-lg">
            <Camera className="w-8 h-8 mx-auto mb-2" />
            <p className="text-3xl font-bold">{loveStats.photoMemories}</p>
            <p className="text-sm opacity-90">ذكرى مصورة</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6">
          <div className="flex gap-2">
            {[
              { id: 'home', label: 'الرئيسية', icon: Heart },
              { id: 'memories', label: 'الذكريات', icon: Camera },
              { id: 'activities', label: 'الأنشطة', icon: TrendingUp },
              { id: 'challenges', label: 'التحديات', icon: Award }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Home Tab */}
          {activeTab === 'home' && (
            <>
              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowGiftDialog(true)}
                  className="bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-2xl p-6 text-center hover:scale-105 transition-transform shadow-lg"
                >
                  <Gift className="w-10 h-10 mx-auto mb-2" />
                  <p className="font-bold">إرسال هدية</p>
                </button>

                <button className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl p-6 text-center hover:scale-105 transition-transform shadow-lg">
                  <MessageCircle className="w-10 h-10 mx-auto mb-2" />
                  <p className="font-bold">رسالة حب</p>
                </button>

                <button
                  onClick={() => setShowMemoryDialog(true)}
                  className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-2xl p-6 text-center hover:scale-105 transition-transform shadow-lg"
                >
                  <Camera className="w-10 h-10 mx-auto mb-2" />
                  <p className="font-bold">إضافة ذكرى</p>
                </button>

                <button className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl p-6 text-center hover:scale-105 transition-transform shadow-lg">
                  <Music className="w-10 h-10 mx-auto mb-2" />
                  <p className="font-bold">أغنيتنا</p>
                </button>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  آخر الأنشطة
                </h3>
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="text-4xl">{activity.icon}</div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.timestamp.toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-600 font-bold">+{activity.points}</p>
                        <p className="text-xs text-gray-500">نقطة</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Memories Tab */}
          {activeTab === 'memories' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">ألبوم الذكريات 📸</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {memories.map((memory) => (
                  <div key={memory.id} className="relative group">
                    <img
                      src={memory.url}
                      alt={memory.caption}
                      className="w-full h-48 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white font-medium text-sm">{memory.caption}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                          <span className="text-white text-xs">{memory.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setShowMemoryDialog(true)}
                  className="h-48 border-4 border-dashed border-pink-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-pink-50 transition-colors"
                >
                  <ImageIcon className="w-10 h-10 text-pink-400" />
                  <p className="text-pink-600 font-medium">إضافة ذكرى</p>
                </button>
              </div>
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">سجل الأنشطة</h3>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl"
                  >
                    <div className="text-4xl">{activity.icon}</div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                    <div className="text-purple-600 font-bold">+{activity.points}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Challenges Tab */}
          {activeTab === 'challenges' && (
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${
                    challenge.completed ? 'border-green-400 bg-green-50' : 'border-purple-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{challenge.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-800 mb-1">{challenge.title}</h4>
                      <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-500" />
                        <span className="text-purple-600 font-bold">+{challenge.reward} نقطة</span>
                      </div>
                    </div>
                    {challenge.completed ? (
                      <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold">
                        مكتمل ✓
                      </div>
                    ) : (
                      <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-full">
                        قيد التقدم
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gift Dialog */}
      {showGiftDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">اختر هدية لشريكك 🎁</h3>
              <button
                onClick={() => setShowGiftDialog(false)}
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gifts.map((gift) => (
                <button
                  key={gift.id}
                  onClick={() => handleSendGift(gift)}
                  className="p-4 border-2 border-pink-200 rounded-2xl hover:border-pink-500 hover:shadow-lg transition-all text-center"
                >
                  <div className="text-5xl mb-2">{gift.icon}</div>
                  <p className="font-bold text-gray-800 mb-1">{gift.nameAr}</p>
                  <p className="text-purple-600 font-bold">{gift.coinCost} عملة</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Memory Dialog */}
      {showMemoryDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">إضافة ذكرى جديدة 📸</h3>
              <button
                onClick={() => setShowMemoryDialog(false)}
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-pink-300 rounded-2xl p-8 text-center cursor-pointer hover:bg-pink-50">
                <Camera className="w-16 h-16 text-pink-400 mx-auto mb-3" />
                <p className="text-pink-600 font-medium">انقر لاختيار صورة</p>
              </div>
              
              <input
                type="text"
                placeholder="أضف تعليق على الصورة..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none"
              />
              
              <button
                onClick={() => {
                  showSuccess('تم إضافة الذكرى بنجاح! 💝');
                  setShowMemoryDialog(false);
                }}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
              >
                حفظ الذكرى
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoveHouse;
