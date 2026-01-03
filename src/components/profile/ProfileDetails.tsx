"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type User } from "@/models/User";
import { type Profile, ProfileService } from "@/services/ProfileService";
import { showError, showSuccess } from "@/utils/toast";
import { useLocale } from "@/contexts";

type Props = {
  user: User | null;
  profile: Profile | null;
  onProfileUpdated?: (p: Profile) => void;
};

const ProfileDetails: React.FC<Props> = ({ user, profile, onProfileUpdated }) => {
  const [file, setFile] = React.useState<File | undefined>(undefined);
  const { dir } = useLocale();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dir === "rtl" ? "تفاصيل المستخدم" : "User Details"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="text-xs text-muted-foreground">{dir === "rtl" ? "البريد الإلكتروني" : "Email"}</div>
              <div className="text-sm">{user.email}</div>
            </div>
            {user.name && (
              <div>
                <div className="text-xs text-muted-foreground">{dir === "rtl" ? "اسم المستخدم" : "Username"}</div>
                <div className="text-sm">{user.name}</div>
              </div>
            )}
            {profile?.phone && (
              <div>
                <div className="text-xs text-muted-foreground">{dir === "rtl" ? "الهاتف" : "Phone"}</div>
                <div className="text-sm">{profile.phone}</div>
              </div>
            )}
            {typeof profile?.coins === "number" && (
              <div>
                <div className="text-xs text-muted-foreground">{dir === "rtl" ? "العملات" : "Coins"}</div>
                <div className="text-sm">{profile.coins}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">{dir === "rtl" ? "لا يوجد مستخدم حالياً." : "No user logged in."}</div>
        )}

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">{dir === "rtl" ? "صورة الملف الشخصي" : "Profile Image"}</div>
          <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} />
          <Button
            variant="outline"
            onClick={async () => {
              if (!user?.id || !file) return;
              try {
                const url = await ProfileService.uploadProfileImage(user.id, file);
                if (url) {
                  const p = await ProfileService.getByUserId(user.id);
                  if (p) onProfileUpdated?.(p);
                  showSuccess(dir === "rtl" ? "تم تحديث صورة الملف" : "Profile image updated");
                } else {
                  showError(dir === "rtl" ? "المخزن غير مُعد" : "Storage not configured");
                }
              } catch (e: any) {
                showError(e.message || (dir === "rtl" ? "فشل رفع الصورة" : "Failed to upload image"));
              }
            }}
          >
            {dir === "rtl" ? "رفع" : "Upload"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileDetails;