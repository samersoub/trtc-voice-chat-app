import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Gamepad2 } from "lucide-react";
import { AuthService } from "@/services/AuthService";

const GamesPage = () => {
  const nav = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const userName = currentUser?.name || "مستخدم";

  const games = [
    {
      id: 1,
      title: "لودو",
      titleEn: "Ludo",
      icon: "🎲",
      bgColor: "bg-gradient-to-br from-red-500 to-pink-500",
      players: "2-4 لاعبين",
      route: "/games/ludo"
    },
    {
      id: 2,
      title: "أونو",
      titleEn: "UNO",
      icon: "🎴",
      bgColor: "bg-gradient-to-br from-yellow-500 via-red-500 to-blue-500",
      players: "2-10 لاعبين",
      route: "/games/uno"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-indigo-600 to-purple-600 px-4 py-6">
        {/* Back Button */}
        <button 
          onClick={() => nav("/")}
          className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/10"
          aria-label="Back"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Title */}
        <div className="text-center pt-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Gamepad2 className="w-8 h-8 text-white" />
            <h1 className="text-white font-bold text-2xl" dir="rtl">الألعاب</h1>
          </div>
          <p className="text-white/80 text-sm" dir="rtl">العب واستمتع مع أصدقائك</p>
        </div>
      </div>

      {/* Games Grid */}
      <div className="px-4 py-6 pb-24">
        <div className="grid gap-4">
          {games.map((game) => (
            <div
              key={game.id}
              onClick={() => nav(game.route)}
              className={`${game.bgColor} rounded-3xl p-6 cursor-pointer transform hover:scale-105 transition-all shadow-2xl`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{game.icon}</div>
                  <div>
                    <h3 className="text-white font-bold text-2xl mb-1" dir="rtl">{game.title}</h3>
                    <p className="text-white/90 text-sm mb-2">{game.titleEn}</p>
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <span dir="rtl">{game.players}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-white" />
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm" dir="rtl">المزيد من الألعاب قريباً...</p>
        </div>
      </div>
    </div>
  );
};

export default GamesPage;
