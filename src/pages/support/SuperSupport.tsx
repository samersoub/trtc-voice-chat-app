import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Zap,
  Gift,
  Users,
  Share2,
  Copy,
  Check,
  Trophy,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { AuthService } from '@/services/AuthService';
import { InviteRewardsService } from '@/services/InviteRewardsService';
import { showSuccess, showError } from '@/utils/toast';

const SuperSupport: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const [stats, setStats] = useState(InviteRewardsService.getUserStats(currentUser?.id || ''));
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentUser?.id) {
      const userStats = InviteRewardsService.getUserStats(currentUser.id);
      setStats(userStats);
      setInviteCode(InviteRewardsService.getUserInviteCode(currentUser.id));
      setProgress(InviteRewardsService.getProgressToNextReward(currentUser.id));
    }
  }, [currentUser?.id]);

  const shareMessage = `انضم إلى دندنة شات! 🎉\nاستخدم كود الدعوة الخاص بي: ${inviteCode}\nرابط التطبيق: https://dandana-chat.app/invite/${inviteCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    showSuccess('تم نسخ الكود');
    InviteRewardsService.sendInvitation(currentUser?.id || '', 'copy');
    updateStats();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
    InviteRewardsService.sendInvitation(currentUser?.id || '', 'whatsapp');
    updateStats();
    showSuccess('تم فتح WhatsApp');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://dandana-chat.app')}&quote=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
    InviteRewardsService.sendInvitation(currentUser?.id || '', 'facebook');
    updateStats();
    showSuccess('تم فتح Facebook');
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
    InviteRewardsService.sendInvitation(currentUser?.id || '', 'twitter');
    updateStats();
    showSuccess('تم فتح Twitter');
  };

  const handleShareInstagram = () => {
    navigator.clipboard.writeText(shareMessage);
    showSuccess('تم نسخ الرسالة! افتح Instagram والصقها');
    InviteRewardsService.sendInvitation(currentUser?.id || '', 'instagram');
    updateStats();
  };

  const updateStats = () => {
    if (currentUser?.id) {
      const userStats = InviteRewardsService.getUserStats(currentUser.id);
      setStats(userStats);
      setProgress(InviteRewardsService.getProgressToNextReward(currentUser.id));
    }
  };

  const rewardTiers = InviteRewardsService.getRewardTiers();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-24">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-indigo-600 to-purple-600 px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/10"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h1 className="text-xl font-bold text-white" dir="rtl">
              دعم دندنة الخارق
            </h1>
          </div>

          <div className="w-10"></div>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 backdrop-blur-sm rounded-3xl p-6 border border-yellow-400/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-yellow-200 text-sm mb-1" dir="rtl">
                إجمالي الدعوات الناجحة
              </p>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-yellow-400" />
                <span className="text-4xl font-bold text-white">
                  {stats.successfulInvites}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-yellow-200 text-sm mb-1" dir="rtl">
                الألماس المكتسب
              </p>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-3xl font-bold text-yellow-400">
                  {stats.totalDiamondsEarned}
                </span>
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Progress to Next Reward */}
          {stats.nextRewardAt !== -1 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-yellow-200 text-sm" dir="rtl">
                  التقدم للمكافأة التالية
                </span>
                <span className="text-yellow-400 text-sm font-bold">
                  {stats.successfulInvites} / {stats.nextRewardAt}
                </span>
              </div>
              <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-yellow-200 text-xs mt-2 text-center" dir="rtl">
                {stats.nextRewardAt - stats.successfulInvites} دعوات متبقية للحصول على{' '}
                {stats.nextRewardAmount} 💎
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Invite Code Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold text-lg" dir="rtl">
              كود الدعوة الخاص بك
            </h3>
          </div>

          <div className="flex items-center gap-3 bg-black/20 rounded-xl p-4 border border-purple-500/30">
            <div className="flex-1">
              <p className="text-gray-400 text-xs mb-1" dir="rtl">
                شارك هذا الكود مع أصدقائك
              </p>
              <p className="text-white font-mono text-xl font-bold tracking-wider">
                {inviteCode}
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                copied
                  ? 'bg-green-500'
                  : 'bg-purple-500 hover:bg-purple-600'
              }`}
            >
              {copied ? (
                <Check className="w-6 h-6 text-white" />
              ) : (
                <Copy className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          <p className="text-gray-400 text-sm mt-3 text-center" dir="rtl">
            عدد الدعوات المعلقة: {stats.pendingInvites}
          </p>
        </div>

        {/* Share Methods */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-semibold text-lg" dir="rtl">
              شارك مع الأصدقاء
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleShareWhatsApp}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-sm font-medium">WhatsApp</span>
            </button>

            <button
              onClick={handleShareFacebook}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xl font-bold">f</span>
              </div>
              <span className="text-white text-sm font-medium">Facebook</span>
            </button>

            <button
              onClick={handleShareTwitter}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center">
                <span className="text-white text-xl font-bold">𝕏</span>
              </div>
              <span className="text-white text-sm font-medium">Twitter</span>
            </button>

            <button
              onClick={handleShareInstagram}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-sm font-medium">Instagram</span>
            </button>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="text-white font-semibold text-lg" dir="rtl">
              المكافآت المتاحة
            </h3>
          </div>

          <div className="space-y-3">
            {rewardTiers.map((tier, index) => {
              const isClaimed = stats.rewards.some(
                r => r.inviteCount === tier.requiredInvites
              );
              const canClaim = stats.successfulInvites >= tier.requiredInvites && !isClaimed;
              const isLocked = stats.successfulInvites < tier.requiredInvites;

              return (
                <div
                  key={index}
                  className={`relative p-4 rounded-xl border transition-all ${
                    isClaimed
                      ? 'bg-green-500/10 border-green-500/30'
                      : canClaim
                      ? 'bg-yellow-500/10 border-yellow-500/30 animate-pulse'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isClaimed
                            ? 'bg-green-500'
                            : canClaim
                            ? 'bg-yellow-500'
                            : 'bg-gray-500'
                        }`}
                      >
                        {isClaimed ? (
                          <Check className="w-6 h-6 text-white" />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {tier.requiredInvites}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold" dir="rtl">
                          {tier.requiredInvites} دعوات
                        </p>
                        <p className="text-gray-400 text-sm" dir="rtl">
                          {isClaimed ? 'تم الحصول عليها' : isLocked ? 'مقفلة' : 'جاهزة!'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-2xl font-bold text-yellow-400">
                          {tier.diamonds}
                        </span>
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                      </div>
                      <p className="text-gray-400 text-xs" dir="rtl">ألماسة</p>
                    </div>
                  </div>

                  {!isClaimed && !isLocked && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-xl animate-pulse pointer-events-none"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
          <h3 className="text-white font-semibold text-lg mb-4" dir="rtl">
            كيف يعمل؟
          </h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">1</span>
              </div>
              <p className="text-gray-300 text-sm" dir="rtl">
                شارك كود الدعوة الخاص بك مع الأصدقاء
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">2</span>
              </div>
              <p className="text-gray-300 text-sm" dir="rtl">
                عندما يسجل صديقك باستخدام الكود، تحصل على نقطة دعوة
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">3</span>
              </div>
              <p className="text-gray-300 text-sm" dir="rtl">
                عند الوصول لـ 10 دعوات، احصل على 1000 💎 تلقائياً!
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">4</span>
              </div>
              <p className="text-gray-300 text-sm" dir="rtl">
                عند 20 دعوة، احصل على 2500 💎 إضافية!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperSupport;

// Missing Camera import
import { Camera } from 'lucide-react';
