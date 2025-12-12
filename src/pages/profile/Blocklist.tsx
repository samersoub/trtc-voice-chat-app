import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Search, UserX, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocale } from "@/contexts";
import { showSuccess } from "@/utils/toast";

interface BlockedUser {
  id: string;
  name: string;
  avatar: string;
  blockedAt: string;
  reason?: string;
}

export default function Blocklist() {
  const { t, dir } = useLocale();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Demo data - replace with actual API call
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([
    // {
    //   id: "1",
    //   name: "مستخدم محظور 1",
    //   avatar: "/avatars/user1.jpg",
    //   blockedAt: "2024-01-15",
    //   reason: "سلوك غير لائق"
    // }
  ]);

  const filteredUsers = blockedUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUnblock = (userId: string, userName: string) => {
    if (confirm(`هل تريد إلغاء حظر ${userName}؟`)) {
      setBlockedUsers(blockedUsers.filter(user => user.id !== userId));
      showSuccess(`تم إلغاء حظر ${userName}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-rose-900 pb-20" dir={dir}>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-lg bg-black/30 border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/10"
          >
            <ArrowRight className={`w-5 h-5 ${dir === 'rtl' ? '' : 'rotate-180'}`} />
          </Button>
          <h1 className="text-xl font-bold text-white">القائمة السوداء</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في المحظورين..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 pr-10"
          />
        </div>

        {/* Stats */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">{blockedUsers.length}</p>
                <p className="text-white/60 text-sm">مستخدم محظور</p>
              </div>
            </div>
          </div>
        </div>

        {/* Blocked Users List */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
              <UserX className="w-10 h-10 text-white/40" />
            </div>
            <p className="text-white/60 text-lg mb-2">
              {searchQuery ? "لا توجد نتائج" : "لا يوجد مستخدمين محظورين"}
            </p>
            <p className="text-white/40 text-sm">
              {searchQuery ? "جرب البحث بكلمات مختلفة" : "قائمتك السوداء فارغة"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="w-12 h-12 border-2 border-white/20">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{user.name}</p>
                    <p className="text-white/60 text-xs">
                      محظور في {new Date(user.blockedAt).toLocaleDateString('ar-SA')}
                    </p>
                    {user.reason && (
                      <p className="text-white/40 text-xs mt-1 truncate">
                        السبب: {user.reason}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => handleUnblock(user.id, user.name)}
                  variant="ghost"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white shrink-0"
                >
                  إلغاء الحظر
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
