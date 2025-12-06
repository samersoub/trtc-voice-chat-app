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
  X as CloseIcon
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

const ModernProfile: React.FC = () => {
  const { userId } = useParams();
  const currentUser = AuthService.getCurrentUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'relations'>('profile');
  const [moments, setMoments] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string>('/images/default-cover.jpeg');
  const [profileImage, setProfileImage] = useState<string>('https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan');
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [userInterests, setUserInterests] = useState<Interest[]>([]);
  const coverFileInputRef = React.useRef<HTMLInputElement>(null);
  const profileFileInputRef = React.useRef<HTMLInputElement>(null);

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

  const userName = profile?.username || currentUser?.name || 'أردني~يبحث عنك~!';
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
    // TODO: Update on server
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
            <div className="px-3 py-1.5 rounded-full bg-emerald-500 text-white text-sm font-medium">
              1.0 غرف
            </div>
            <button className="w-10 h-10 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center border border-white/10" aria-label="More options">
              <MoreHorizontal className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-4">
          {/* User ID and Stats */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                <span className="text-white text-sm font-medium">{userCoins} مجبي</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                <span className="text-white text-sm">{userId_display}</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden shadow-2xl ring-4 ring-purple-500/30">
                <img 
                  src={profileImage}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={handleEditProfileClick}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-purple-500 hover:bg-purple-600 border-2 border-white flex items-center justify-center shadow-lg transition-all"
                aria-label="Change profile picture"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>

          {/* Username and Flag */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/80 to-blue-500/80 backdrop-blur-md border border-white/30 shadow-lg">
              <span className="text-white font-medium" dir="rtl">🇯🇴{userName}</span>
            </div>
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
                    <span className="text-white text-sm flex-1" dir="rtl">{interest.label}</span>
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
                <button className="text-purple-400 hover:text-purple-300" aria-label="View all photos">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              {moments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3">
                    <Film className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400 text-sm text-center" dir="rtl">ليست هناك صور بعد</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {moments.map((moment, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10"
                    >
                      <img src={moment} alt={`Moment ${index + 1}`} className="w-full h-full object-cover" />
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
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <Star className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-400 text-center" dir="rtl">لا توجد علاقات قوية</p>
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
