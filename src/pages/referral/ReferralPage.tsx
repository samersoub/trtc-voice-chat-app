import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReferralService } from '@/services/ReferralService';
import { AuthService } from '@/services/AuthService';
import { showSuccess } from '@/utils/toast';
import { useLocale } from '@/contexts';
import {
  Users, Share2, Gift, Trophy, Copy, Star, TrendingUp,
  Facebook, Twitter, MessageCircle, Link2, ArrowLeft
} from 'lucide-react';

export default function ReferralPage() {
  const { dir } = useLocale();
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const userId = currentUser?.id || '';
  
  const [stats, setStats] = useState(ReferralService.getStats(userId));
  const [referrals, setReferrals] = useState(ReferralService.getReferrals(userId));
  const [rewards] = useState(ReferralService.getAllRewards());

  const handleCopy = () => {
    if (ReferralService.copyToClipboard(stats.referralLink)) {
      showSuccess('تم نسخ الرابط! 📋');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white p-6" dir={dir}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">دعوة الأصدقاء</h1>
              <p className="text-gray-400">اربح مكافآت مع كل صديق تدعوه</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/5 border-white/10 p-6">
            <Users className="w-8 h-8 text-blue-400 mb-2" />
            <div className="text-3xl font-bold">{stats.totalReferrals}</div>
            <div className="text-sm text-gray-400">إجمالي الدعوات</div>
          </Card>
          
          <Card className="bg-white/5 border-white/10 p-6">
            <Gift className="w-8 h-8 text-yellow-400 mb-2" />
            <div className="text-3xl font-bold">{stats.totalEarned.coins}</div>
            <div className="text-sm text-gray-400">عملات مكتسبة</div>
          </Card>
          
          <Card className="bg-white/5 border-white/10 p-6">
            <Star className="w-8 h-8 text-purple-400 mb-2" />
            <div className="text-3xl font-bold">Lv.{stats.currentLevel}</div>
            <div className="text-sm text-gray-400">المستوى الحالي</div>
          </Card>
          
          <Card className="bg-white/5 border-white/10 p-6">
            <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
            <div className="text-3xl font-bold">{stats.activeReferrals}</div>
            <div className="text-sm text-gray-400">نشطين</div>
          </Card>
        </div>

        {/* Share Section */}
        <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">شارك رابط الدعوة</h2>
          
          <div className="flex gap-2 mb-4">
            <input 
              value={stats.referralLink}
              readOnly
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
            />
            <Button onClick={handleCopy} className="bg-purple-600 hover:bg-purple-700">
              <Copy className="w-4 h-4 mr-2" />
              نسخ
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => ReferralService.shareViaWhatsApp(userId, currentUser?.name || '')} className="flex-1 bg-green-600 hover:bg-green-700">
              <MessageCircle className="w-4 h-4 mr-2" />
              واتساب
            </Button>
            <Button onClick={() => ReferralService.shareViaFacebook(userId)} className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Facebook className="w-4 h-4 mr-2" />
              فيسبوك
            </Button>
            <Button onClick={() => ReferralService.shareViaTwitter(userId)} className="flex-1 bg-sky-500 hover:bg-sky-600">
              <Twitter className="w-4 h-4 mr-2" />
              تويتر
            </Button>
          </div>
        </Card>

        {/* Rewards Progress */}
        <Card className="bg-white/5 border-white/10 p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">مستويات المكافآت</h3>
          <div className="space-y-3">
            {rewards.map((reward) => (
              <div key={reward.level} className={`p-4 rounded-lg ${stats.currentLevel >= reward.level ? 'bg-green-500/20 border-2 border-green-500' : 'bg-white/5'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{reward.badge}</div>
                    <div>
                      <div className="font-bold">المستوى {reward.level}</div>
                      <div className="text-sm text-gray-400">{reward.referralsRequired} دعوات</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold">{reward.coins} 💰</div>
                    {reward.diamonds > 0 && <div className="text-purple-400 text-sm">{reward.diamonds} 💎</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Referrals List */}
        {referrals.length > 0 && (
          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-xl font-bold mb-4">أصدقائك ({referrals.length})</h3>
            <div className="space-y-2">
              {referrals.map((ref) => (
                <div key={ref.userId} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <img src={ref.userAvatar} alt={ref.userName} className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <div className="font-bold">{ref.userName}</div>
                    <div className="text-sm text-gray-400">انضم منذ {Math.floor((Date.now() - ref.joinedAt) / (24*60*60*1000))} يوم</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs ${ref.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {ref.isActive ? 'نشط' : 'غير نشط'}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
