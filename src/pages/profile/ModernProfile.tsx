import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Link as LinkIcon, 
  Edit, 
  ChevronLeft,
  Star,
  Award,
  Film,
  Coffee,
  Music,
  Plane,
  Crown,
  MoreHorizontal,
  Camera,
  Image,
  Plus,
  X as CloseIcon,
  Upload,
  Trash2,
  Heart,
  UserPlus,
  Search,
  Users,
  Lock,
  Sparkles,
  Type,
  Check,
  Radio,
  Volume2,
  MessageCircle,
  Share2
} from 'lucide-react';
import { AuthService } from '@/services/AuthService';
import { ProfileService, type Profile } from '@/services/ProfileService';
import { UserPresenceService } from '@/services/UserPresenceService';
import { MomentsService, type MomentPost, type MomentComment } from '@/services/MomentsService';
import { RelationshipLevelService } from '@/services/RelationshipLevelService';
import { BadgeService, type Badge } from '@/services/BadgeService';
import RoomStarBadge from '@/components/profile/RoomStarBadge';
import FemaleProfileFrame from '@/components/profile/FemaleProfileFrame';
import { showSuccess, showError } from '@/utils/toast';
import { useLocale } from '@/contexts';

// ===================================================================
// Modern Profile Component - Matches Mobile App Design
// ===================================================================

interface ProfileBadge {
  id: string;
  icon: string;
  label?: string;
  color?: string;
}

interface Interest {
  id: string;
  icon: React.ReactNode;
  label: string;
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
}

interface Highlight {
  id: string;
  text: string;
}

// Love Animation Component
import Lottie from 'lottie-react';
import loveAnimation from '/lottie/love.json';

const LoveAnimation: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Lottie 
        animationData={loveAnimation}
        loop={true}
        autoplay={true}
      />
    </div>
  );
  }, []);

  return (
    <div className="relative flex items-center justify-center">
      <div 
        ref={lottieContainer}
        className="w-32 h-32 scale-125"
      />
    </div>
  );
};

// Relationship Level Display Component
const RelationshipLevelDisplay: React.FC<{ userId: string; partnerId: string }> = ({ userId, partnerId }) => {
  const { locale } = useLocale();
  const relationship = RelationshipLevelService.getRelationship(userId, partnerId);
  const currentLevel = RelationshipLevelService.getCurrentLevel(userId, partnerId);
  const nextLevel = RelationshipLevelService.getNextLevel(userId, partnerId);
  const progress = RelationshipLevelService.getProgressToNextLevel(userId, partnerId);
  const daysTogether = RelationshipLevelService.getDaysTogether(userId, partnerId);

  if (!relationship || !currentLevel) return null;

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Current Level Card */}
      <div className={`bg-gradient-to-r ${currentLevel.gradient} p-4 rounded-2xl shadow-xl`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{currentLevel.icon}</span>
            <div>
              <p className="text-white font-bold text-lg" dir="rtl">
                {locale === 'ar' ? currentLevel.name : currentLevel.nameEn}
              </p>
              <p className="text-white/80 text-sm">
                {locale === 'ar' ? `المستوى ${currentLevel.level}` : `Level ${currentLevel.level}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-2xl">{relationship.currentPoints.toLocaleString()}</p>
            <p className="text-white/80 text-xs">{locale === 'ar' ? 'نقطة' : 'Points'}</p>
          </div>
        </div>

        {/* Progress Bar */}
        {nextLevel && (
          <div>
            <div className="flex justify-between text-white/90 text-xs mb-1">
              <span>{locale === 'ar' ? 'التقدم للمستوى التالي' : 'Progress to next level'}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-white/70 text-xs mt-1">
              <span>{relationship.currentPoints.toLocaleString()}</span>
              <span>{nextLevel.minPoints.toLocaleString()}</span>
            </div>
          </div>
        )}

        {nextLevel && (
          <div className="mt-3 flex items-center gap-2 text-white/90 text-sm">
            <span>{nextLevel.icon}</span>
            <span dir="rtl">
              {locale === 'ar' ? `المستوى التالي: ${nextLevel.name}` : `Next: ${nextLevel.nameEn}`}
            </span>
          </div>
        )}

        {!nextLevel && (
          <div className="mt-3 text-center text-white font-bold">
            {locale === 'ar' ? '🎉 المستوى الأقصى!' : '🎉 Max Level!'}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center">
          <p className="text-2xl font-bold text-white">{relationship.giftsGiven}</p>
          <p className="text-xs text-gray-300" dir="rtl">{locale === 'ar' ? 'هدية مُرسلة' : 'Gifts Sent'}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center">
          <p className="text-2xl font-bold text-white">{relationship.giftsReceived}</p>
          <p className="text-xs text-gray-300" dir="rtl">{locale === 'ar' ? 'هدية مُستلمة' : 'Gifts Received'}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center">
          <p className="text-2xl font-bold text-white">{daysTogether}</p>
          <p className="text-xs text-gray-300" dir="rtl">{locale === 'ar' ? 'يوم معاً' : 'Days Together'}</p>
        </div>
      </div>

      {/* Benefits List */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2" dir="rtl">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          {locale === 'ar' ? 'مزايا المستوى الحالي' : 'Current Level Benefits'}
        </h4>
        <ul className="space-y-2">
          {(locale === 'ar' ? currentLevel.benefits : currentLevel.benefitsEn).map((benefit, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-300" dir="rtl">
              <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* All Levels Preview */}
      <details className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <summary className="p-4 text-white font-semibold cursor-pointer hover:bg-white/5 transition-all" dir="rtl">
          {locale === 'ar' ? 'عرض جميع المستويات' : 'View All Levels'}
        </summary>
        <div className="p-4 pt-0 space-y-3">
          {RelationshipLevelService.getAllLevels().map((level) => (
            <div 
              key={level.level}
              className={`p-3 rounded-xl border-2 transition-all ${
                level.level === currentLevel.level
                  ? `border-${level.color} bg-gradient-to-r ${level.gradient} bg-opacity-20`
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{level.icon}</span>
                  <div>
                    <p className={`font-bold ${level.level === currentLevel.level ? 'text-white' : 'text-gray-300'}`} dir="rtl">
                      {locale === 'ar' ? level.name : level.nameEn}
                    </p>
                    <p className="text-xs text-gray-400">
                      {level.minPoints.toLocaleString()} - {level.maxPoints === Infinity ? '∞' : level.maxPoints.toLocaleString()} {locale === 'ar' ? 'نقطة' : 'pts'}
                    </p>
                  </div>
                </div>
                {level.level === currentLevel.level && (
                  <span className="px-2 py-1 bg-white/20 rounded-full text-xs text-white font-medium">
                    {locale === 'ar' ? 'الحالي' : 'Current'}
                  </span>
                )}
                {level.level < currentLevel.level && (
                  <Check className="w-5 h-5 text-green-400" />
                )}
                {level.level > currentLevel.level && (
                  <Lock className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

const ModernProfile: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const nav = navigate; // alias for consistency
  const { locale, dir } = useLocale();
  const currentUser = AuthService.getCurrentUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // userName needs to be defined before states that use it
  const userName = profile?.username || currentUser?.name || 'أردني~يبحث عنك~!';
  
  const [activeTab, setActiveTab] = useState<'profile' | 'relations' | 'moments' | 'badges'>('profile');
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [featuredBadge, setFeaturedBadge] = useState<Badge | null>(null);
  const [showBadgeDetail, setShowBadgeDetail] = useState<Badge | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [moments, setMoments] = useState<string[]>([]);
  
  // Moments state
  const [userPosts, setUserPosts] = useState<MomentPost[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<{[key: string]: string}>({});
  
  const [coverImage, setCoverImage] = useState<string>('/images/default-cover.jpeg');
  const [profileImage, setProfileImage] = useState<string>('https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan');
  const [userGender, setUserGender] = useState<'male' | 'female'>('female'); // افتراضياً أنثى لعرض الإطار
  const [isSpeaking, setIsSpeaking] = useState(false); // حالة التحدث
  const [wealthLevel, setWealthLevel] = useState<any>(null); // مستوى الثروة
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [userInterests, setUserInterests] = useState<Interest[]>([]);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagText, setEditingTagText] = useState<string>('');
  const [partner, setPartner] = useState<{name: string; avatar: string; id: string} | null>(null);
  const [closeFriends, setCloseFriends] = useState<Friend[]>([]);
  const [showPartnerSearch, setShowPartnerSearch] = useState(false);
  const [showFriendSearch, setShowFriendSearch] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(userName);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState('مرحباً! أنا أحب التواصل مع الأصدقاء وقضاء وقت ممتع في غرف الدردشة الصوتية.');
  const [editedBio, setEditedBio] = useState(bio);
  const [highlights, setHighlights] = useState<Highlight[]>([
    { id: '1', text: '🎵 محب للموسيقى' },
    { id: '2', text: '🎮 لاعب محترف' },
    { id: '3', text: '📚 قارئ نهم' }
  ]);
  const [editingHighlightId, setEditingHighlightId] = useState<string | null>(null);
  const [editingHighlightText, setEditingHighlightText] = useState('');
  const coverFileInputRef = React.useRef<HTMLInputElement>(null);
  const profileFileInputRef = React.useRef<HTMLInputElement>(null);
  const photoFileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (currentUser?.id) {
        const p = await ProfileService.getByUserId(currentUser.id);
        setProfile(p);
      }
    };
    loadProfile();
  }, [currentUser?.id]);

  // Mock data based on the image
  const profileBadges: ProfileBadge[] = [
    { id: '1', icon: '🏆', color: 'from-green-400 to-emerald-500' },
    { id: '2', icon: '🎬', label: 'LV.1', color: 'from-amber-400 to-orange-500' },
    { id: '3', icon: '💎', color: 'from-blue-400 to-cyan-500' },
    { id: '4', icon: '📱', label: '300', color: 'from-purple-400 to-pink-500' },
    { id: '5', icon: '👑', color: 'from-yellow-400 to-orange-500' },
    { id: '6', icon: '⭐', color: 'from-red-400 to-pink-500' },
    { id: '7', icon: '💚', label: '150', color: 'from-green-400 to-teal-500' },
  ];

  // Initialize user interests from profile or defaults
  React.useEffect(() => {
    const defaultInterests: Interest[] = [
      { id: '1', icon: <Film className="w-4 h-4" />, label: 'أفلام' },
      { id: '2', icon: <Music className="w-4 h-4" />, label: 'برامج تلفزيونية' },
      { id: '3', icon: <Music className="w-4 h-4" />, label: 'غناء' },
      { id: '4', icon: <Award className="w-4 h-4" />, label: 'لودو' },
      { id: '5', icon: <Coffee className="w-4 h-4" />, label: 'كرة قدم' },
      { id: '6', icon: <Coffee className="w-4 h-4" />, label: 'قهوة' },
      { id: '7', icon: <Plane className="w-4 h-4" />, label: 'السفر إلى العديد من البلدان' },
      { id: '8', icon: <Crown className="w-4 h-4" />, label: 'عضو ملكي' },
    ];
    setUserInterests(defaultInterests);
    
    // Load profile image if exists
    if (profile?.profile_image) {
      setProfileImage(profile.profile_image);
    }
  }, [profile]);

  // Load user posts
  useEffect(() => {
    const profileUserId = userId || currentUser?.id || '';
    if (profileUserId) {
      const posts = MomentsService.getUserPosts(profileUserId);
      setUserPosts(posts);
    }
  }, [userId, currentUser?.id, activeTab]);

  // Load badges
  useEffect(() => {
    const profileUserId = userId || currentUser?.id || '';
    if (profileUserId) {
      const badges = BadgeService.getActiveBadges(profileUserId);
      setEarnedBadges(badges);
      
      const featured = BadgeService.getFeaturedBadge(profileUserId);
      setFeaturedBadge(featured);
    }
  }, [userId, currentUser?.id, activeTab]);

  // Load wealth level
  useEffect(() => {
    const loadWealthLevel = async () => {
      const profileUserId = userId || currentUser?.id || '';
      if (profileUserId) {
        const { WealthLevelService } = await import('@/services/WealthLevelService');
        const level = WealthLevelService.getCurrentLevel(profileUserId);
        setWealthLevel(level);
      }
    };
    loadWealthLevel();
  }, [userId, currentUser?.id]);

  // Load partner from relationship service (for demo data)
  useEffect(() => {
    if (currentUser?.id && !partner) {
      // Check if there's a relationship in the service
      const allLevels = RelationshipLevelService.getAllLevels();
      // Try to find a relationship (demo data will be initialized from Index.tsx)
      // For now, we'll check if demo relationship exists
      const demoPartnerId = 'partner123';
      const relationship = RelationshipLevelService.getRelationship(currentUser.id, demoPartnerId);
      
      if (relationship) {
        setPartner({
          id: relationship.partnerId,
          name: relationship.partnerName,
          avatar: relationship.partnerAvatar
        });
      }
    }
  }, [currentUser?.id, partner]);

  const userId_display = 'ID:101089646';
  const userLevel = 'LV.28';
  const userCoins = profile?.coins || 1200;
  const userLocation = '🇯🇴 الأردن';
  const userWebsite = 'https://hamsalrooo7.blogspot.com/';
  const userBio = 'مدونتي';

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageData = reader.result as string;
        setCoverImage(imageData);
        
        // Upload to server
        if (currentUser?.id) {
          try {
            await ProfileService.updateCoverImage(currentUser.id, imageData);
            showSuccess('تم تحديث صورة الغلاف');
          } catch (error) {
            showError('فشل تحديث صورة الغلاف');
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageData = reader.result as string;
        setProfileImage(imageData);
        
        // Upload to server
        if (currentUser?.id) {
          try {
            await ProfileService.updateProfileImage(currentUser.id, imageData);
            showSuccess('تم تحديث الصورة الشخصية');
          } catch (error) {
            showError('فشل تحديث الصورة الشخصية');
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditCoverClick = () => {
    coverFileInputRef.current?.click();
  };

  const handleEditProfileClick = () => {
    profileFileInputRef.current?.click();
  };

  const handleRemoveTag = (tagId: string) => {
    const updated = userInterests.filter(tag => tag.id !== tagId);
    setUserInterests(updated);
    
    // Save to localStorage
    if (currentUser?.id) {
      const key = `profile:interests:${currentUser.id}`;
      localStorage.setItem(key, JSON.stringify(updated));
    }
  };

  const handleAddTag = () => {
    const newTag: Interest = {
      id: Date.now().toString(),
      icon: <Star className="w-4 h-4" />,
      label: 'علامة جديدة'
    };
    const updated = [...userInterests, newTag];
    setUserInterests(updated);
    setEditingTagId(newTag.id);
    setEditingTagText(newTag.label);
    
    // Save to localStorage
    if (currentUser?.id) {
      const key = `profile:interests:${currentUser.id}`;
      localStorage.setItem(key, JSON.stringify(updated));
    }
  };

  const handleEditTag = (tagId: string, currentLabel: string) => {
    setEditingTagId(tagId);
    setEditingTagText(currentLabel);
  };

  const handleSaveTag = (tagId: string) => {
    const updated = userInterests.map(tag => 
      tag.id === tagId ? { ...tag, label: editingTagText } : tag
    );
    setUserInterests(updated);
    setEditingTagId(null);
    setEditingTagText('');
    
    // Save to localStorage
    if (currentUser?.id) {
      const key = `profile:interests:${currentUser.id}`;
      localStorage.setItem(key, JSON.stringify(updated));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageData = reader.result as string;
          setMoments(prev => [imageData, ...prev]);
          
          // Save to localStorage
          if (currentUser?.id) {
            const key = `profile:moments:${currentUser.id}`;
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            localStorage.setItem(key, JSON.stringify([imageData, ...existing]));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleDeletePhoto = (index: number) => {
    const updated = moments.filter((_, i) => i !== index);
    setMoments(updated);
    
    // Delete from localStorage
    if (currentUser?.id) {
      const key = `profile:moments:${currentUser.id}`;
      localStorage.setItem(key, JSON.stringify(updated));
    }
  };

  const handleUploadPhotosClick = () => {
    photoFileInputRef.current?.click();
  };

  const handleAddPartner = () => {
    setShowPartnerSearch(true);
  };

  const handleSearchPartner = () => {
    if (!currentUser) {
      console.error('❌ No current user found');
      showError('يرجى تسجيل الدخول أولاً');
      return;
    }
    
    // If no ID entered, use default demo partner
    const partnerId = searchId.trim() || 'partner123';
    const partnerName = searchId.trim() 
      ? `مستخدم ${searchId}` 
      : 'سارة السورية';
    const partnerAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${partnerId}`;
    
    console.log('🔍 Creating partner:', { partnerId, partnerName, partnerAvatar });
    
    // Create new partner
    const newPartner = {
      id: partnerId,
      name: partnerName,
      avatar: partnerAvatar
    };
    
    setPartner(newPartner);
    console.log('✅ Partner set in state:', newPartner);
    
    // Initialize relationship in RelationshipLevelService
    const relationship = RelationshipLevelService.createRelationship(
      currentUser.id,
      newPartner.id,
      newPartner.name,
      newPartner.avatar
    );
    console.log('📊 Relationship created:', relationship);
    
    // If using demo partner, add demo points and stats
    if (partnerId === 'partner123') {
      console.log('🎁 Adding demo data for partner123...');
      
      // Use addGiftPoints to properly add points (this also updates the level)
      RelationshipLevelService.addGiftPoints(currentUser.id, newPartner.id, 8500);
      
      // Manually update additional demo stats
      const key = `${currentUser.id}_${newPartner.id}`;
      const updatedRelationship = RelationshipLevelService['relationships'].get(key);
      console.log('🔑 Relationship key:', key);
      console.log('📈 Updated relationship:', updatedRelationship);
      
      if (updatedRelationship) {
        updatedRelationship.giftsGiven = 45;
        updatedRelationship.giftsReceived = 38;
        updatedRelationship.startDate = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000); // 45 days ago
        RelationshipLevelService['relationships'].set(key, updatedRelationship);
        console.log('✨ Demo stats updated:', {
          points: updatedRelationship.currentPoints,
          level: updatedRelationship.currentLevel,
          giftsGiven: updatedRelationship.giftsGiven,
          giftsReceived: updatedRelationship.giftsReceived,
          days: Math.floor((Date.now() - updatedRelationship.startDate.getTime()) / (1000 * 60 * 60 * 24))
        });
      } else {
        console.error('❌ Could not find updated relationship');
      }
    }
    
    setShowPartnerSearch(false);
    setSearchId('');
    showSuccess(partnerId === 'partner123' 
      ? 'تم إضافة الشريك التجريبي بنجاح ✨' 
      : 'تم إضافة الشريك بنجاح'
    );
    console.log('✅ Partner search completed successfully');
    
    // Save to localStorage
    if (currentUser?.id) {
      const key = `profile:partner:${currentUser.id}`;
      localStorage.setItem(key, JSON.stringify(partner));
    }
  };

  const handleRemovePartner = () => {
    setPartner(null);
    
    // Remove from localStorage
    if (currentUser?.id) {
      const key = `profile:partner:${currentUser.id}`;
      localStorage.removeItem(key);
    }
  };

  const handleAddFriend = () => {
    if (closeFriends.length >= 4) {
      setShowPremiumDialog(true);
      return;
    }
    setShowFriendSearch(true);
  };

  const handleSearchFriend = async () => {
    if (searchId.trim() && closeFriends.length < 4) {
      // Search for user by ID
      const profile = await ProfileService.getByUserId(searchId);
      
      const newFriend: Friend = {
        id: searchId,
        name: profile?.username || `مستخدم ${searchId}`,
        avatar: profile?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${searchId}`
      };
      
      const updated = [...closeFriends, newFriend];
      setCloseFriends(updated);
      setShowFriendSearch(false);
      setSearchId('');
      
      // Save to localStorage
      if (currentUser?.id) {
        const key = `profile:friends:${currentUser.id}`;
        localStorage.setItem(key, JSON.stringify(updated));
      }
    }
  };

  const handleRemoveFriend = (friendId: string) => {
    const updated = closeFriends.filter(f => f.id !== friendId);
    setCloseFriends(updated);
    
    // Save to localStorage
    if (currentUser?.id) {
      const key = `profile:friends:${currentUser.id}`;
      localStorage.setItem(key, JSON.stringify(updated));
    }
  };

  const handleSaveName = async () => {
    if (editedName.trim() && currentUser?.id) {
      try {
        const profile = await ProfileService.getByUserId(currentUser.id);
        if (profile) {
          await ProfileService.updateCoins(currentUser.id, { username: editedName.trim() } as any);
          setUserName(editedName.trim());
          showSuccess('تم تحديث الاسم');
        }
      } catch (error) {
        showError('فشل تحديث الاسم');
      }
      setIsEditingName(false);
    }
  };

  const handleCancelNameEdit = () => {
    setEditedName(userName);
    setIsEditingName(false);
  };

  const handleSaveBio = () => {
    setBio(editedBio);
    setIsEditingBio(false);
    
    // Save to localStorage
    if (currentUser?.id) {
      const key = `profile:bio:${currentUser.id}`;
      localStorage.setItem(key, editedBio);
    }
  };

  const handleCancelBioEdit = () => {
    setEditedBio(bio);
    setIsEditingBio(false);
  };

  const handleEditHighlight = (id: string, text: string) => {
    setEditingHighlightId(id);
    setEditingHighlightText(text);
  };

  const handleSaveHighlight = () => {
    if (editingHighlightText.trim() && editingHighlightId) {
      const updated = highlights.map(h => 
        h.id === editingHighlightId ? { ...h, text: editingHighlightText } : h
      );
      setHighlights(updated);
      setEditingHighlightId(null);
      setEditingHighlightText('');
      
      // Save to localStorage
      if (currentUser?.id) {
        const key = `profile:highlights:${currentUser.id}`;
        localStorage.setItem(key, JSON.stringify(updated));
      }
    }
  };

  const handleAddHighlight = () => {
    const newHighlight: Highlight = {
      id: Date.now().toString(),
      text: 'نقطة بارزة جديدة'
    };
    const updated = [...highlights, newHighlight];
    setHighlights(updated);
    // Start editing immediately
    setEditingHighlightId(newHighlight.id);
    setEditingHighlightText(newHighlight.text);
    
    // Save to localStorage
    if (currentUser?.id) {
      const key = `profile:highlights:${currentUser.id}`;
      localStorage.setItem(key, JSON.stringify(updated));
    }
  };

  const handleFollowUser = () => {
    // Check if user is in a room
    const profileUserId = userId || currentUser?.id || '';
    const userRoom = UserPresenceService.getUserCurrentRoom(profileUserId);
    
    if (userRoom) {
      // User is in a room, navigate to it
      showSuccess(`جاري الانضمام إلى ${userRoom.roomTitle || 'الغرفة'}...`);
      navigate(`/voice/rooms/${userRoom.roomId}/join`);
    } else {
      // User is not in a room
      showError('المستخدم غير متواجد في أي غرفة حالياً');
    }
  };

  const handleToggleFollow = () => {
    setIsFollowing(!isFollowing);
    if (!isFollowing) {
      showSuccess('تم التتبع بنجاح');
    } else {
      showSuccess('تم إلغاء التتبع');
    }
  };

  // Moments handlers
  const handleCreatePost = () => {
    if (!newPostContent.trim() && newPostImages.length === 0) {
      showError('الرجاء كتابة محتوى أو إضافة صورة');
      return;
    }

    const post = MomentsService.createPost(
      currentUser?.id || '',
      currentUser?.name || 'المستخدم',
      currentUser?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.id}`,
      newPostContent,
      newPostImages
    );

    setUserPosts([post, ...userPosts]);
    setNewPostContent('');
    setNewPostImages([]);
    setShowCreatePost(false);
    showSuccess('تم نشر البوست بنجاح');
  };

  const handleLikePost = (postId: string) => {
    const isLiked = MomentsService.toggleLike(postId, currentUser?.id || '');
    setUserPosts([...MomentsService.getUserPosts(userId || currentUser?.id || '')]);
    if (isLiked) {
      showSuccess('تم الإعجاب');
    }
  };

  const handleAddComment = (postId: string) => {
    const content = commentInput[postId];
    if (!content?.trim()) return;

    MomentsService.addComment(
      postId,
      currentUser?.id || '',
      currentUser?.name || 'المستخدم',
      currentUser?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.id}`,
      content
    );

    setUserPosts([...MomentsService.getUserPosts(userId || currentUser?.id || '')]);
    setCommentInput({ ...commentInput, [postId]: '' });
    showSuccess('تم إضافة التعليق');
  };

  const handleSharePost = (postId: string) => {
    MomentsService.sharePost(postId);
    setUserPosts([...MomentsService.getUserPosts(userId || currentUser?.id || '')]);
    showSuccess('تم مشاركة البوست');
  };

  const handleDeletePost = (postId: string) => {
    if (MomentsService.deletePost(postId, currentUser?.id || '')) {
      setUserPosts(userPosts.filter(p => p.id !== postId));
      showSuccess('تم حذف البوست');
    }
  };

  const handlePostImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewPostImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveHighlight = (id: string) => {
    const updated = highlights.filter(h => h.id !== id);
    setHighlights(updated);
    
    // Delete from localStorage
    if (currentUser?.id) {
      const key = `profile:highlights:${currentUser.id}`;
      localStorage.setItem(key, JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Partner Search Dialog */}
      {showPartnerSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-purple-500/30 shadow-2xl">
            <h3 className="text-white font-bold text-xl mb-4 text-center" dir="rtl">بحث عن شريك</h3>
            
            {/* Helper text */}
            <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <p className="text-purple-300 text-sm text-center" dir="rtl">
                💡 اتركه فارغاً للحصول على شريك تجريبي مع مستويات جاهزة
              </p>
            </div>
            
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchPartner()}
                  placeholder="أدخل ID المستخدم (اختياري)"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  dir="rtl"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowPartnerSearch(false); setSearchId(''); }}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                إلغاء
              </button>
              <button
                onClick={handleSearchPartner}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all"
              >
                {searchId.trim() ? 'بحث' : 'شريك تجريبي'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Friend Search Dialog */}
      {showFriendSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-purple-500/30 shadow-2xl">
            <h3 className="text-white font-bold text-xl mb-4 text-center" dir="rtl">إضافة صديق</h3>
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchFriend()}
                  placeholder="أدخل ID المستخدم"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  dir="rtl"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowFriendSearch(false); setSearchId(''); }}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                إلغاء
              </button>
              <button
                onClick={handleSearchFriend}
                disabled={!searchId.trim()}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إضافة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Upgrade Dialog */}
      {showPremiumDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-yellow-500/30 shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-white font-bold text-xl mb-3" dir="rtl">الحد الأقصى للأصدقاء</h3>
              <p className="text-gray-300 mb-6" dir="rtl">
                يمكنك إضافة 4 أصدقاء فقط في النسخة المجانية.<br />
                للحصول على المزيد من الأصدقاء، يجب شراء النسخة المميزة.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPremiumDialog(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => {
                    setShowPremiumDialog(false);
                    // TODO: Navigate to premium purchase page
                    window.location.href = '/store';
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium transition-all"
                >
                  اشتراء الآن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Cover Section with Background Image */}
      <div className="relative h-80 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          {/* Gradient Fallback matching the fluid art colors */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-cyan-300 to-pink-400 opacity-80"></div>
          {/* User's Cover Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${coverImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80"></div>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={coverFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverImageChange}
          className="hidden"
          aria-label="Upload cover image"
        />
        <input
          ref={profileFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleProfileImageChange}
          className="hidden"
          aria-label="Upload profile image"
        />
        <input
          ref={photoFileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          className="hidden"
          aria-label="Upload photos"
        />

        {/* Top Navigation Bar */}
        <div className="relative z-10 flex items-center justify-between px-4 py-3">
          <button className="w-10 h-10 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center border border-white/10" aria-label="Back">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleEditCoverClick}
              className="px-3 py-1.5 rounded-full bg-purple-500/80 hover:bg-purple-600/80 backdrop-blur-sm text-white text-sm font-medium flex items-center gap-2 border border-white/20 transition-all"
              aria-label="Edit cover image"
            >
              <Camera className="w-4 h-4" />
              <span>تغيير الغلاف</span>
            </button>
            <button className="w-10 h-10 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center border border-white/10" aria-label="More options">
              <MoreHorizontal className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Profile Picture - Positioned separately */}
        <div className="absolute top-32 left-4 z-20">
          <div className="relative">
            {userGender === 'female' ? (
              <FemaleProfileFrame 
                imageUrl={profileImage}
                isSpeaking={isSpeaking}
                size="large"
              />
            ) : (
              <div className="w-36 h-36 rounded-full border-4 border-white/30 overflow-hidden shadow-2xl ring-4 ring-purple-500/30 bg-white">
                <img 
                  src={profileImage}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {/* Status Indicator - Show if user is in a room */}
            {(() => {
              const profileUserId = userId || currentUser?.id || '';
              const userRoom = UserPresenceService.getUserCurrentRoom(profileUserId);
              const userStatus = UserPresenceService.getUserStatus(profileUserId);
              
              if (userRoom) {
                return (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-auto px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 border-2 border-white shadow-lg flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-white animate-pulse" />
                    <span className="text-white text-xs font-medium whitespace-nowrap">في غرفة</span>
                  </div>
                );
              } else if (userStatus === 'online') {
                return (
                  <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-green-500 border-2 border-white shadow-lg"></div>
                );
              }
              return null;
            })()}
            <button
              onClick={handleEditProfileClick}
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-purple-500 hover:bg-purple-600 border-2 border-white flex items-center justify-center shadow-lg transition-all"
              aria-label="Change profile picture"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
            
            {/* زر تبديل حالة التحدث (للتجربة) */}
            {userGender === 'female' && (
              <button
                onClick={() => setIsSpeaking(!isSpeaking)}
                className={`absolute bottom-0 left-0 w-9 h-9 rounded-full ${isSpeaking ? 'bg-pink-500' : 'bg-gray-500'} hover:bg-pink-600 border-2 border-white flex items-center justify-center shadow-lg transition-all`}
                aria-label="Toggle speaking"
                title={isSpeaking ? 'إيقاف التحدث' : 'تفعيل التحدث'}
              >
                <Volume2 className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-4">
          {/* User ID and Stats */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                <span className="text-white text-sm font-medium">{userCoins} مجبي</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                <span className="text-white text-sm">{userId_display}</span>
              </div>
              {/* عرض مستوى الثروة */}
              {wealthLevel && (
                <button
                  onClick={() => nav('/wealth')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${wealthLevel.gradient} text-white border-2 border-white/30 shadow-lg hover:scale-105 transition-transform`}
                  title={dir === 'rtl' ? wealthLevel.name : wealthLevel.nameEn}
                >
                  <span className="text-base">{wealthLevel.icon}</span>
                  <span className="text-xs font-bold">{dir === 'rtl' ? wealthLevel.badge : wealthLevel.nameEn}</span>
                </button>
              )}
              {/* زر تغيير الجنس (للتجربة) */}
              <button
                onClick={() => setUserGender(userGender === 'female' ? 'male' : 'female')}
                className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/50 transition-all"
                title="تبديل الجنس"
              >
                <span className="text-white text-sm">{userGender === 'female' ? '👩 أنثى' : '👨 ذكر'}</span>
              </button>
            </div>
          </div>

          {/* Username and Flag */}
          <div className="flex items-center gap-2 mb-3">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                  className="px-4 py-2 bg-white/20 border border-white/30 rounded-xl text-white font-medium focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                  dir="rtl"
                  autoFocus
                  placeholder="أدخل الاسم"
                />
                <button
                  onClick={handleSaveName}
                  className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-all"
                  aria-label="Save name"
                >
                  <Check className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={handleCancelNameEdit}
                  className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all"
                  aria-label="Cancel"
                >
                  <CloseIcon className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/80 to-blue-500/80 backdrop-blur-md border border-white/30 shadow-lg group">
                <span className="text-white font-medium" dir="rtl">🇯🇴{editedName}</span>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  aria-label="Edit name"
                >
                  <Edit className="w-3 h-3 text-white" />
                </button>
              </div>
            )}
          </div>

          {/* Badges Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button className="flex-shrink-0 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20" aria-label="Previous badges">
              <ChevronLeft className="w-4 h-4 text-white rotate-180" />
            </button>
            {profileBadges.map((badge) => (
              <div
                key={badge.id}
                className={`flex-shrink-0 relative w-16 h-16 rounded-xl bg-gradient-to-br ${badge.color || 'from-purple-500 to-pink-500'} flex flex-col items-center justify-center border-2 border-white/30 shadow-lg`}
              >
                <span className="text-2xl">{badge.icon}</span>
                {badge.label && (
                  <span className="absolute bottom-0.5 text-white text-[10px] font-bold">{badge.label}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Level Badge */}
        <div className="absolute bottom-4 right-4 z-20">
          <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 border-2 border-white/30 shadow-lg">
            <span className="text-white font-bold text-sm">{userLevel}</span>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="sticky top-0 z-30 bg-gradient-to-b from-slate-900 to-slate-900/95 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-center gap-1 p-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            الملف الشخصي
          </button>
          <button
            onClick={() => setActiveTab('moments')}
            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'moments'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Moments
          </button>
          <button
            onClick={() => setActiveTab('relations')}
            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'relations'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            بيت الحب
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'badges'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            المداليات
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-4">
        {activeTab === 'profile' && (
          <>
            {/* Location and Website */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white" dir="rtl">
                <MapPin className="w-5 h-5 text-purple-400" />
                <span className="text-sm">{userLocation}</span>
              </div>
              <div className="flex items-start gap-3" dir="rtl">
                <LinkIcon className="w-5 h-5 text-purple-400 mt-0.5" />
                <div className="flex-1">
                  <a 
                    href={userWebsite} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-cyan-400 hover:text-cyan-300 underline break-all"
                  >
                    {userWebsite}
                  </a>
                  <p className="text-gray-400 text-sm mt-1" dir="rtl">{userBio}</p>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-semibold" dir="rtl">نبذة عني</h3>
                </div>
                {!isEditingBio && (
                  <button
                    onClick={() => setIsEditingBio(true)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-purple-400 text-sm transition-all"
                  >
                    <Edit className="w-3 h-3" />
                    <span dir="rtl">تعديل</span>
                  </button>
                )}
              </div>
              {isEditingBio ? (
                <div className="space-y-3">
                  <textarea
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 resize-none"
                    rows={4}
                    dir="rtl"
                    placeholder="اكتب نبذة عن نفسك..."
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={handleCancelBioEdit}
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleSaveBio}
                      className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-all"
                    >
                      حفظ
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300 leading-relaxed" dir="rtl">{bio}</p>
              )}
            </div>

            {/* Follow and Track Section - Only show if viewing someone else's profile */}
            {userId && userId !== currentUser?.id && (
              <div className="flex gap-3">
                <button
                  onClick={handleToggleFollow}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    isFollowing
                      ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFollowing ? 'fill-current text-red-400' : ''}`} />
                  <span dir="rtl">{isFollowing ? 'متابَع' : 'متابعة'}</span>
                </button>
                
                {(() => {
                  const profileUserId = userId || '';
                  const userRoom = UserPresenceService.getUserCurrentRoom(profileUserId);
                  const buttonText = userRoom ? `انضم: ${userRoom.roomTitle?.substring(0, 15) || 'الغرفة'}` : 'انضم لغرفته';
                  const isDisabled = !userRoom;
                  
                  return (
                    <button
                      onClick={handleFollowUser}
                      disabled={isDisabled}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                        isDisabled
                          ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
                      }`}
                    >
                      <Radio className={`w-5 h-5 ${userRoom ? 'animate-pulse' : ''}`} />
                      <span dir="rtl" className="truncate">{buttonText}</span>
                    </button>
                  );
                })()}
              </div>
            )}

            {/* Highlights Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-white font-semibold" dir="rtl">النقاط البارزة</h3>
                </div>
                <button
                  onClick={handleAddHighlight}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span dir="rtl">إضافة</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {highlights.map((highlight) => (
                  <div key={highlight.id} className="relative group">
                    {editingHighlightId === highlight.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editingHighlightText}
                          onChange={(e) => setEditingHighlightText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveHighlight()}
                          onBlur={handleSaveHighlight}
                          className="px-3 py-1.5 bg-white/10 border border-purple-400 rounded-full text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                          dir="rtl"
                          autoFocus
                          placeholder="اكتب النقطة البارزة"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-full border border-purple-400/30">
                        <span 
                          className="text-white text-sm cursor-pointer" 
                          dir="rtl" 
                          onClick={() => handleEditHighlight(highlight.id, highlight.text)}
                        >
                          {highlight.text}
                        </span>
                        <button
                          onClick={() => handleRemoveHighlight(highlight.id)}
                          className="w-4 h-4 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                          aria-label="Remove highlight"
                        >
                          <CloseIcon className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg" dir="rtl">العلامات الشخصية</h3>
                <button 
                  onClick={() => setIsEditingTags(!isEditingTags)}
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-2" 
                  aria-label="Edit tags"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">{isEditingTags ? 'حفظ' : 'تعديل'}</span>
                </button>
              </div>

              {/* Interests Grid */}
              <div className="grid grid-cols-2 gap-3">
                {userInterests.map((interest) => (
                  <div
                    key={interest.id}
                    className="relative flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="text-purple-400">{interest.icon}</div>
                    {editingTagId === interest.id ? (
                      <input
                        type="text"
                        value={editingTagText}
                        onChange={(e) => setEditingTagText(e.target.value)}
                        onBlur={() => handleSaveTag(interest.id)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveTag(interest.id)}
                        className="flex-1 bg-transparent text-white text-sm outline-none border-b border-purple-400"
                        dir="rtl"
                        placeholder="اكتب العلامة..."
                        autoFocus
                      />
                    ) : (
                      <span 
                        className="text-white text-sm flex-1 cursor-pointer" 
                        dir="rtl"
                        onClick={() => isEditingTags && handleEditTag(interest.id, interest.label)}
                      >
                        {interest.label}
                      </span>
                    )}
                    {isEditingTags && (
                      <button
                        onClick={() => handleRemoveTag(interest.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 border-2 border-white flex items-center justify-center shadow-lg transition-all"
                        aria-label="Remove tag"
                      >
                        <CloseIcon className="w-3 h-3 text-white" />
                      </button>
                    )}
                  </div>
                ))}
                
                {/* Add Tag Button */}
                {isEditingTags && (
                  <button
                    onClick={handleAddTag}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-500/20 backdrop-blur-sm border-2 border-dashed border-purple-400 hover:bg-purple-500/30 transition-all"
                  >
                    <Plus className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-400 text-sm font-medium" dir="rtl">إضافة علامة</span>
                  </button>
                )}
              </div>
            </div>

            {/* Moments Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg" dir="rtl">صور</h3>
                <button 
                  onClick={handleUploadPhotosClick}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm transition-all" 
                  aria-label="Upload photos"
                >
                  <Upload className="w-4 h-4" />
                  <span>رفع صور</span>
                </button>
              </div>

              {moments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3">
                    <Film className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400 text-sm text-center mb-3" dir="rtl">ليست هناك صور بعد</p>
                  <button
                    onClick={handleUploadPhotosClick}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-400 text-purple-400 hover:bg-purple-500/30 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">رفع صور</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {moments.map((moment, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 group"
                    >
                      <img src={moment} alt={`Moment ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleDeletePhoto(index)}
                        className="absolute top-1 right-1 w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 border-2 border-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                        aria-label="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 12 Moments Indicator */}
            <div className="text-right">
              <span className="text-gray-400 text-sm font-medium">12 Moment</span>
            </div>
          </>
        )}

        {activeTab === 'relations' && (
          <div className="space-y-8">
            {/* Partner Section */}
            <div className="flex flex-col items-center justify-center py-8">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                <h3 className="text-white font-semibold text-lg">بيت الحب</h3>
                <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
              </div>
              {partner ? (
                <div className="relative">
                  {/* Partner Relationship Display */}
                  <div className="flex items-center gap-4 mb-6">
                    {/* Current User Avatar */}
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full border-4 border-purple-500 overflow-hidden shadow-xl">
                        <img 
                          src={profileImage}
                          alt={userName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Love Animation in Center */}
                    <div className="flex flex-col items-center">
                      <LoveAnimation />
                    </div>

                    {/* Partner Avatar */}
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full border-4 border-pink-500 overflow-hidden shadow-xl">
                        <img 
                          src={partner.avatar}
                          alt={partner.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={handleRemovePartner}
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 border-2 border-white flex items-center justify-center shadow-lg transition-all"
                        aria-label="Remove partner"
                      >
                        <CloseIcon className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Partner Info */}
                  <div className="text-center mb-6">
                    <p className="text-white font-semibold text-lg mb-1" dir="rtl">{partner.name}</p>
                    <p className="text-purple-300 text-sm" dir="rtl">شريك حياة</p>
                  </div>

                  {/* Button to Love House */}
                  <div className="flex justify-center mb-6">
                    <button
                      onClick={() => navigate('/love-house')}
                      className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-white font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                    >
                      <Heart className="w-5 h-5 fill-white" />
                      دخول بيت الحب
                      <Sparkles className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Relationship Level Progress */}
                  {currentUser && <RelationshipLevelDisplay userId={currentUser.id} partnerId={partner.id} />}
                </div>
              ) : (
                <div className="text-center">
                  {/* Empty State with Add Partner */}
                  <div className="flex items-center justify-center gap-4 mb-6">
                    {/* Current User Avatar */}
                    <div className="w-24 h-24 rounded-full border-4 border-purple-500/50 overflow-hidden shadow-xl">
                      <img 
                        src={profileImage}
                        alt={userName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Heart Icon */}
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                      <Heart className="w-8 h-8 text-gray-400" />
                    </div>

                    {/* Add Partner Button */}
                    <button
                      onClick={handleAddPartner}
                      className="w-24 h-24 rounded-full border-4 border-dashed border-purple-400/50 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all group"
                      aria-label="Add partner"
                    >
                      <UserPlus className="w-10 h-10 text-purple-400 group-hover:text-purple-300" />
                    </button>
                  </div>

                  <p className="text-gray-400 text-center mb-4" dir="rtl">لا توجد علاقة قوية</p>
                  <button
                    onClick={handleAddPartner}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-lg transition-all"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span dir="rtl">إضافة شريك</span>
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-white/10"></div>

            {/* Close Friends Section */}
            <div>
              <div className="flex items-center justify-between mb-6 px-4">
                <h3 className="text-white font-semibold text-lg" dir="rtl">الأصدقاء المقربين</h3>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm" dir="rtl">{closeFriends.length}/4</span>
                  <button
                    onClick={handleAddFriend}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span dir="rtl">إضافة</span>
                  </button>
                </div>
              </div>

              {closeFriends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400 text-center mb-4" dir="rtl">لم تتم إضافة أصدقاء بعد</p>
                  <button
                    onClick={handleAddFriend}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500/20 border border-purple-400 text-purple-400 hover:bg-purple-500/30 transition-all"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span dir="rtl">إضافة صديق</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 px-4">
                  {closeFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className="relative flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-purple-400 overflow-hidden shadow-lg">
                          <img 
                            src={friend.avatar}
                            alt={friend.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveFriend(friend.id)}
                          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 border-2 border-white flex items-center justify-center shadow-lg transition-all"
                          aria-label="Remove friend"
                        >
                          <CloseIcon className="w-3 h-3 text-white" />
                        </button>
                      </div>
                      <p className="text-white text-sm font-medium text-center" dir="rtl">{friend.name}</p>
                      <p className="text-gray-400 text-xs" dir="rtl">ID: {friend.id}</p>
                    </div>
                  ))}
                  
                  {/* Add More Button (if under 4) */}
                  {closeFriends.length < 4 && (
                    <button
                      onClick={handleAddFriend}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-purple-500/10 border-2 border-dashed border-purple-400 hover:bg-purple-500/20 transition-all"
                    >
                      <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <UserPlus className="w-8 h-8 text-purple-400" />
                      </div>
                      <span className="text-purple-400 text-sm font-medium" dir="rtl">إضافة</span>
                    </button>
                  )}
                </div>
              )}

              {/* Premium Hint */}
              {closeFriends.length >= 4 && (
                <div className="mt-4 px-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                    <Lock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <p className="text-yellow-200 text-sm flex-1" dir="rtl">
                      لإضافة المزيد من الأصدقاء، يجب شراء النسخة المميزة
                    </p>
                    <button
                      onClick={() => setShowPremiumDialog(true)}
                      className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium transition-all whitespace-nowrap"
                    >
                      ترقية
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Moments Tab Content */}
        {activeTab === 'moments' && (
          <div className="space-y-4">
            {/* Create Post Button */}
            {(!userId || userId === currentUser?.id) && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-400" dir="rtl">ماذا تريد أن تشارك؟</span>
                </button>
              </div>
            )}

            {/* Create Post Modal */}
            {showCreatePost && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-lg w-full mx-4 border border-purple-500/30 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-xl" dir="rtl">إنشاء منشور</h3>
                    <button
                      onClick={() => {
                        setShowCreatePost(false);
                        setNewPostContent('');
                        setNewPostImages([]);
                      }}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                      aria-label="Close"
                    >
                      <CloseIcon className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 resize-none mb-4"
                    rows={4}
                    dir="rtl"
                    placeholder="اكتب شيئاً..."
                  />

                  {/* Image Preview */}
                  {newPostImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {newPostImages.map((img, idx) => (
                        <div key={idx} className="relative">
                          <img src={img} alt="" className="w-full h-32 object-cover rounded-lg" />
                          <button
                            onClick={() => setNewPostImages(newPostImages.filter((_, i) => i !== idx))}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center"
                            aria-label="Remove image"
                          >
                            <CloseIcon className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePostImageUpload}
                      className="hidden"
                      id="post-image-upload"
                    />
                    <label
                      htmlFor="post-image-upload"
                      className="flex-1 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all cursor-pointer text-center flex items-center justify-center gap-2"
                    >
                      <Image className="w-5 h-5" />
                      <span dir="rtl">إضافة صور</span>
                    </label>
                    <button
                      onClick={handleCreatePost}
                      className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all"
                    >
                      نشر
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Posts List */}
            {userPosts.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 text-center">
                <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <Image className="w-10 h-10 text-purple-400" />
                </div>
                <p className="text-gray-400" dir="rtl">لا توجد منشورات بعد</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <div key={post.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                    {/* Post Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.userAvatar}
                          alt={post.userName}
                          className="w-12 h-12 rounded-full border-2 border-purple-500/30"
                        />
                        <div>
                          <h4 className="text-white font-semibold" dir="rtl">{post.userName}</h4>
                          <p className="text-gray-400 text-xs">
                            {new Date(post.createdAt).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                      </div>
                      {post.userId === currentUser?.id && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-all"
                          aria-label="Delete post"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>

                    {/* Post Content */}
                    <p className="text-white mb-3 leading-relaxed" dir="rtl">{post.content}</p>

                    {/* Post Images */}
                    {post.images.length > 0 && (
                      <div className={`grid gap-2 mb-3 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {post.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt=""
                            className="w-full h-48 object-cover rounded-xl"
                          />
                        ))}
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center gap-4 pt-3 border-t border-white/10">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                          post.likes.includes(currentUser?.id || '')
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${post.likes.includes(currentUser?.id || '') ? 'fill-current' : ''}`} />
                        <span>{post.likes.length}</span>
                      </button>

                      <button
                        onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-all"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>{post.comments.length}</span>
                      </button>

                      <button
                        onClick={() => handleSharePost(post.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-all"
                      >
                        <Share2 className="w-5 h-5" />
                        <span>{post.shares}</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {showComments === post.id && (
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                        {/* Comments List */}
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <img
                              src={comment.userAvatar}
                              alt={comment.userName}
                              className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1 bg-white/5 rounded-xl p-3">
                              <h5 className="text-white font-semibold text-sm mb-1" dir="rtl">
                                {comment.userName}
                              </h5>
                              <p className="text-gray-300 text-sm" dir="rtl">{comment.content}</p>
                            </div>
                          </div>
                        ))}

                        {/* Add Comment */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={commentInput[post.id] || ''}
                            onChange={(e) => setCommentInput({ ...commentInput, [post.id]: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            placeholder="اكتب تعليقاً..."
                            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-sm"
                            dir="rtl"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white transition-all"
                          >
                            إرسال
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            {/* Featured Badge - Room Star */}
            {featuredBadge && featuredBadge.type === 'room_star' && (
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30 shadow-xl">
                <h3 className="text-white font-bold text-xl mb-4 text-center" dir="rtl">
                  🏆 الميدالية المميزة
                </h3>
                <div className="flex justify-center">
                  <RoomStarBadge 
                    userName={userName}
                    description={featuredBadge.description}
                  />
                </div>
                <div className="mt-6 text-center space-y-2">
                  <p className="text-amber-200 text-sm" dir="rtl">
                    حصلت على هذه الميدالية بتاريخ: {featuredBadge.earnedDate?.toLocaleDateString('ar-EG')}
                  </p>
                  {featuredBadge.stats?.giftsValue && (
                    <p className="text-yellow-300 font-semibold" dir="rtl">
                      قيمة الهدايا المرسلة: {featuredBadge.stats.giftsValue.toLocaleString()} عملة 💰
                    </p>
                  )}
                  {featuredBadge.expiryDate && (
                    <p className="text-gray-400 text-xs" dir="rtl">
                      ينتهي في: {featuredBadge.expiryDate.toLocaleDateString('ar-EG')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* All Badges Grid */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-white font-bold text-lg mb-4" dir="rtl">
                جميع المداليات ({earnedBadges.length})
              </h3>
              
              {earnedBadges.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400" dir="rtl">
                    لم تحصل على أي مداليات بعد
                  </p>
                  <p className="text-gray-500 text-sm mt-2" dir="rtl">
                    أرسل الهدايا وشارك في الغرف للحصول على المداليات!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {earnedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      onClick={() => setShowBadgeDetail(badge)}
                      className={`bg-gradient-to-br ${badge.gradient} p-1 rounded-xl cursor-pointer hover:scale-105 transition-transform`}
                    >
                      <div className="bg-slate-900 rounded-lg p-4">
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-4xl">{badge.icon}</div>
                          <div className="text-center">
                            <p className="text-white font-semibold text-sm" dir="rtl">
                              {badge.name}
                            </p>
                            <p className="text-gray-400 text-xs mt-1" dir="rtl">
                              {badge.rarity === 'legendary' && '🌟 أسطوري'}
                              {badge.rarity === 'epic' && '💜 ملحمي'}
                              {badge.rarity === 'rare' && '💙 نادر'}
                              {badge.rarity === 'common' && '⚪ عادي'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Leaderboard */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2" dir="rtl">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                لوحة المتصدرين
              </h3>
              
              <div className="space-y-3">
                {BadgeService.getLeaderboard(10).map((entry, index) => {
                  const isCurrentUser = entry.userId === currentUser?.id;
                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        isCurrentUser
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                          : 'bg-white/5'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                        index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                        'bg-white/10 text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium" dir="rtl">
                          {isCurrentUser ? userName : `مستخدم ${entry.userId.slice(0, 8)}`}
                        </p>
                        <p className="text-gray-400 text-xs" dir="rtl">
                          {entry.totalGifts.toLocaleString()} عملة
                        </p>
                      </div>
                      {index === 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-yellow-400 text-xs font-bold">نجم الغرفة</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Badge Detail Dialog */}
      {showBadgeDetail && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowBadgeDetail(null)}
        >
          <div 
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md w-full border border-purple-500/30 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-white font-bold text-xl" dir="rtl">{showBadgeDetail.name}</h3>
              <button
                onClick={() => setShowBadgeDetail(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                aria-label="Close"
              >
                <CloseIcon className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="flex justify-center my-6">
              {showBadgeDetail.type === 'room_star' ? (
                <RoomStarBadge compact />
              ) : (
                <div className={`text-8xl p-6 rounded-full bg-gradient-to-br ${showBadgeDetail.gradient}`}>
                  {showBadgeDetail.icon}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-2" dir="rtl">الوصف:</p>
                <p className="text-white" dir="rtl">{showBadgeDetail.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-gray-400 text-sm" dir="rtl">الندرة:</p>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  showBadgeDetail.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                  showBadgeDetail.rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                  showBadgeDetail.rarity === 'rare' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                  'bg-gradient-to-r from-gray-500 to-gray-600'
                } text-white`}>
                  {showBadgeDetail.rarity === 'legendary' && '🌟 أسطوري'}
                  {showBadgeDetail.rarity === 'epic' && '💜 ملحمي'}
                  {showBadgeDetail.rarity === 'rare' && '💙 نادر'}
                  {showBadgeDetail.rarity === 'common' && '⚪ عادي'}
                </span>
              </div>

              {showBadgeDetail.earnedDate && (
                <div>
                  <p className="text-gray-400 text-sm" dir="rtl">
                    تاريخ الحصول: {showBadgeDetail.earnedDate.toLocaleDateString('ar-EG')}
                  </p>
                </div>
              )}

              {showBadgeDetail.expiryDate && (
                <div>
                  <p className="text-amber-300 text-sm" dir="rtl">
                    ⏰ ينتهي في: {showBadgeDetail.expiryDate.toLocaleDateString('ar-EG')}
                  </p>
                </div>
              )}

              {showBadgeDetail.stats && (
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-2" dir="rtl">الإحصائيات:</p>
                  <div className="space-y-1">
                    {showBadgeDetail.stats.giftsValue && (
                      <p className="text-white text-sm" dir="rtl">
                        💰 قيمة الهدايا: {showBadgeDetail.stats.giftsValue.toLocaleString()} عملة
                      </p>
                    )}
                    {showBadgeDetail.stats.daysActive && (
                      <p className="text-white text-sm" dir="rtl">
                        📅 أيام النشاط: {showBadgeDetail.stats.daysActive} يوم
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <button className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-2xl shadow-cyan-500/50 border-2 border-white/30">
          <img 
            src={profile?.profile_image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan'}
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
          />
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">×</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ModernProfile;
