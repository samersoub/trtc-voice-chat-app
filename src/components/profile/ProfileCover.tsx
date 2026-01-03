"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/contexts";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

const ProfileCover: React.FC<Props> = ({ className, children }) => {
  const { dir } = useLocale();
  // Use uploaded image as banner background. The filename is Arabic; encode the URL for safety.
  const bannerSrc = encodeURI("/الملف الشخصي.jpeg");

  return (
    <div className={cn("relative w-full rounded-xl overflow-hidden border", className)}>
      <img
        src={bannerSrc}
        alt={dir === "rtl" ? "صورة الغلاف" : "Profile cover"}
        className="h-36 sm:h-44 md:h-56 w-full object-cover"
      />
      {/* Optional decorative XML overlay (if it is an SVG XML, the browser will render it) */}
      <img
        src="/public_profile_top.xml"
        alt=""
        className="pointer-events-none absolute inset-0 w-full h-full object-cover opacity-20"
      />
      {/* Gradient overlay for better legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
      {/* Slot for header content */}
      {children && (
        <div className={cn("absolute inset-0 flex items-end", dir === "rtl" ? "justify-end" : "justify-start")}>
          <div className="p-4 sm:p-6 w-full">{children}</div>
        </div>
      )}
    </div>
  );
};

export default ProfileCover;