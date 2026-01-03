"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts";
import { showSuccess, showError } from "@/utils/toast";
import { type User } from "@/models/User";
import { type Profile } from "@/services/ProfileService";
import { Copy, Share2 } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  profile: Profile | null;
};

const ShareProfileDialog: React.FC<Props> = ({ open, onOpenChange, user, profile }) => {
  const { dir } = useLocale();
  const username = profile?.username || user?.name || "user";
  const id = user?.id || profile?.id || "0";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${origin}/profile/${encodeURIComponent(id)}`;
  const shareTitle = dir === "rtl" ? "الملف الشخصي" : "Profile";
  const shareText = dir === "rtl" ? `تعرف على ${username}` : `Check out ${username}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showSuccess(dir === "rtl" ? "تم نسخ الرابط" : "Link copied");
    } catch {
      showError(dir === "rtl" ? "تعذر نسخ الرابط" : "Failed to copy link");
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        showSuccess(dir === "rtl" ? "تمت المشاركة" : "Shared successfully");
        onOpenChange(false);
      } catch {
        // User canceled or share failed; no toast needed
      }
    } else {
      copyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dir === "rtl" ? "مشاركة الملف الشخصي" : "Share Profile"}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Input value={shareUrl} readOnly className="flex-1" />
          <Button variant="outline" onClick={copyLink}>
            <Copy className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
            {dir === "rtl" ? "نسخ" : "Copy"}
          </Button>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button onClick={nativeShare}>
            <Share2 className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
            {dir === "rtl" ? "مشاركة" : "Share"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareProfileDialog;