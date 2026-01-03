"use client";

import React from "react";
import { Link } from "react-router-dom";
import { IceCream, Users, Trophy } from "lucide-react";

const Item: React.FC<{ to: string; color: "pink" | "blue" | "gold"; icon: React.ElementType; label: string }> = ({
  to,
  color,
  icon: Icon,
  label,
}) => {
  const bg =
    color === "pink"
      ? "from-pink-500/80 to-rose-500/80"
      : color === "blue"
      ? "from-sky-500/80 to-indigo-500/80"
      : "from-yellow-500/90 to-amber-500/90";
  return (
    <Link
      to={to}
      className={`rounded-xl p-3 sm:p-4 text-white bg-gradient-to-br ${bg} shadow-md hover:opacity-95 transition`}
    >
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-sm font-semibold">{label}</div>
      </div>
    </Link>
  );
};

const ArabicQuickActions: React.FC = () => {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4" dir="rtl">
      <Item to="/plaza" color="pink" icon={IceCream} label="حدث بلازا" />
      <Item to="/matching" color="blue" icon={Users} label="مطابقة الصوت" />
      <Item to="/rankings" color="gold" icon={Trophy} label="قائمة الترتيب" />
    </div>
  );
};

export default ArabicQuickActions;