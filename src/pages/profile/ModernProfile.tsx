import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Check
} from 'lucide-react';
import { AuthService } from '@/services/AuthService';
import { ProfileService, type Profile } from '@/services/ProfileService';

// ===================================================================
// Modern Profile Component - Matches Mobile App Design
// ===================================================================

interface Badge {
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

const ModernProfile: React.FC = () => {
  const { userId } = useParams();
  const currentUser = AuthService.getCurrentUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // userName needs to be defined before states that use it
  const userName = profile?.username || currentUser?.name || 'أردني~يبحث عنك~!';
  
  const [activeTab, setActiveTab] = useState<'profile' | 'relations'>('profile');
  const [moments, setMoments] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string>('/images/default-cover.jpeg');
  const [profileImage, setProfileImage] = useState<string>('https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan');
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
  const userBadges: Badge[] = [
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
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
        // TODO: Upload to server and update profile
        // ProfileService.updateCoverImage(currentUser?.id, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        // TODO: Upload to server and update profile
        // ProfileService.updateProfileImage(currentUser?.id, reader.result as string);
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
    setUserInterests(userInterests.filter(tag => tag.id !== tagId));
    // TODO: Update on server
  };

  const handleAddTag = () => {
    const newTag: Interest = {
      id: Date.now().toString(),
      icon: <Star className="w-4 h-4" />,
      label: 'علامة جديدة'
    };
    setUserInterests([...userInterests, newTag]);
    setEditingTagId(newTag.id);
    setEditingTagText(newTag.label);
    // TODO: Update on server
  };

  const handleEditTag = (tagId: string, currentLabel: string) => {
    setEditingTagId(tagId);
    setEditingTagText(currentLabel);
  };

  const handleSaveTag = (tagId: string) => {
    setUserInterests(userInterests.map(tag => 
      tag.id === tagId ? { ...tag, label: editingTagText } : tag
    ));
    setEditingTagId(null);
    setEditingTagText('');
    // TODO: Update on server
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMoments(prev => [reader.result as string, ...prev]);
          // TODO: Upload to server
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleDeletePhoto = (index: number) => {
    setMoments(moments.filter((_, i) => i !== index));
    // TODO: Delete from server
  };

  const handleUploadPhotosClick = () => {
    photoFileInputRef.current?.click();
  };

  const handleAddPartner = () => {
    setShowPartnerSearch(true);
  };

  const handleSearchPartner = () => {
    if (searchId.trim()) {
      // TODO: Search for user by ID on server
      setPartner({
        id: searchId,
        name: `مستخدم ${searchId}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${searchId}`
      });
      setShowPartnerSearch(false);
      setSearchId('');
      // TODO: Update on server
    }
  };

  const handleRemovePartner = () => {
    setPartner(null);
    // TODO: Update on server
  };

  const handleAddFriend = () => {
    if (closeFriends.length >= 4) {
      setShowPremiumDialog(true);
      return;
    }
    setShowFriendSearch(true);
  };

  const handleSearchFriend = () => {
    if (searchId.trim() && closeFriends.length < 4) {
      // TODO: Search for user by ID on server
      const newFriend: Friend = {
        id: searchId,
        name: `مستخدم ${searchId}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${searchId}`
      };
      setCloseFriends([...closeFriends, newFriend]);
      setShowFriendSearch(false);
      setSearchId('');
      // TODO: Update on server
    }
  };

  const handleRemoveFriend = (friendId: string) => {
    setCloseFriends(closeFriends.filter(f => f.id !== friendId));
    // TODO: Update on server
  };

  const handleSaveName = () => {
    if (editedName.trim()) {
      // TODO: Update on server
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
    // TODO: Update on server
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
      setHighlights(highlights.map(h => 
        h.id === editingHighlightId ? { ...h, text: editingHighlightText } : h
      ));
      setEditingHighlightId(null);
      setEditingHighlightText('');
      // TODO: Update on server
    }
  };

  const handleAddHighlight = () => {
    const newHighlight: Highlight = {
      id: Date.now().toString(),
      text: 'نقطة بارزة جديدة'
    };
    setHighlights([...highlights, newHighlight]);
    // Start editing immediately
    setEditingHighlightId(newHighlight.id);
    setEditingHighlightText(newHighlight.text);
    // TODO: Update on server
  };

  const handleRemoveHighlight = (id: string) => {
    setHighlights(highlights.filter(h => h.id !== id));
    // TODO: Update on server
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Partner Search Dialog */}
      {showPartnerSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-purple-500/30 shadow-2xl">
            <h3 className="text-white font-bold text-xl mb-4 text-center" dir="rtl">بحث عن شريك</h3>
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchPartner()}
                  placeholder="أدخل ID المستخدم"
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
                disabled={!searchId.trim()}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                بحت
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
            <div className="w-36 h-36 rounded-full border-4 border-white/30 overflow-hidden shadow-2xl ring-4 ring-purple-500/30 bg-white">
              <img 
                src={profileImage}
                alt={userName}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={handleEditProfileClick}
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-purple-500 hover:bg-purple-600 border-2 border-white flex items-center justify-center shadow-lg transition-all"
              aria-label="Change profile picture"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
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
            {userBadges.map((badge) => (
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
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            الملف الشخصي
          </button>
          <button
            onClick={() => setActiveTab('relations')}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'relations'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            علاقة قوية
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
              <h3 className="text-white font-semibold text-lg mb-6" dir="rtl">الشريك</h3>
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

                    {/* Heart Icon in Center */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-lg animate-pulse">
                        <Heart className="w-8 h-8 text-white fill-white" />
                      </div>
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
                  <div className="text-center">
                    <p className="text-white font-semibold text-lg mb-1" dir="rtl">{partner.name}</p>
                    <p className="text-purple-300 text-sm" dir="rtl">علاقة قوية</p>
                  </div>
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
      </div>

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
