"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import AvatarWithFrame from "@/components/profile/AvatarWithFrame";
import { type User } from "@/models/User";
import { type Profile } from "@/services/ProfileService";
import { showSuccess } from "@/utils/toast";
import { useLocale } from "@/contexts";
import { cn } from "@/lib/utils";

type Props = {
  user: User | null;
  profile: Profile | null;
  className?: string;
};

const ProfileHeader: React.FC<Props> = ({ user, profile, className }) => {
  const { t, dir } = useLocale();

  const username = user?.name || profile?.username || "User";
  const level = Math.floor((profile?.coins || 0) / 100) + 1; // simple demo level by coins
  const avatarUrl = profile?.profile_image || user?.avatarUrl;
  const badges = [
    { id: "vip", label: "VIP", variant: "secondary" as const },
    { id: "verified", label: t("Verified") || "Verified", variant: "outline" as const },
    { id: "coins", label: `${profile?.coins ?? 0} coins`, variant: "default" as const },
  ];

  return (
    <div className={cn(className)}>
      <div className="p-0">
        <div className={cn("flex items-end gap-3", dir === "rtl" ? "flex-row-reverse" : "flex-row")}>
          <AvatarWithFrame name={username} imageUrl={avatarUrl} size={96} />
          <div className={cn("flex-1", dir === "rtl" ? "text-right" : "text-left")}>
            <div className="flex items-center gap-2 justify-between flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-semibold text-white drop-shadow">{username}</span>
                <Badge variant="secondary">Lv. {level}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to="/profile/settings">{t("Settings") || (dir === "rtl" ? "الإعدادات" : "Settings")}</Link>
                </Button>
                <Button size="sm" onClick={() => showSuccess(dir === "rtl" ? "تمت المتابعة" : "Followed")}>
                  {dir === "rtl" ? "متابعة" : "Follow"}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => showSuccess(dir === "rtl" ? "تم إرسال رسالة" : "Message sent")}>
                  {dir === "rtl" ? "رسالة" : "Message"}
                </Button>
              </div>
            </div>

            <ScrollArea className="mt-3 whitespace-nowrap">
              <div className={cn("flex items-center gap-2 pb-2", dir === "rtl" ? "flex-row-reverse" : "flex-row")}>
                {badges.map((b) => (
                  <Badge key={b.id} variant={b.variant}>
                    {b.label}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;