"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { PhoneCall, Gift, Share2, MoreHorizontal } from "lucide-react";
import { useLocale } from "@/contexts";
import { showSuccess } from "@/utils/toast";

type Props = {
  className?: string;
  onShare?: () => void;
};

const QuickActionsBar: React.FC<Props> = ({ className, onShare }) => {
  const { dir } = useLocale();

  const label = {
    call: dir === "rtl" ? "اتصال" : "Call",
    gift: dir === "rtl" ? "هدية" : "Gift",
    share: dir === "rtl" ? "مشاركة" : "Share",
    more: dir === "rtl" ? "المزيد" : "More",
  };

  return (
    <div className={`flex items-center justify-between gap-2 ${className || ""}`}>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => showSuccess(label.call)}>
          <PhoneCall className="mr-2 h-4 w-4" />
          {label.call}
        </Button>
        <Button variant="default" size="sm" onClick={() => showSuccess(label.gift)}>
          <Gift className="mr-2 h-4 w-4" />
          {label.gift}
        </Button>
        <Button variant="outline" size="sm" onClick={() => (typeof onShare === "function" ? onShare() : showSuccess(label.share))}>
          <Share2 className="mr-2 h-4 w-4" />
          {label.share}
        </Button>
      </div>
      <Button variant="ghost" size="sm" onClick={() => showSuccess(label.more)}>
        <MoreHorizontal className="mr-2 h-4 w-4" />
        {label.more}
      </Button>
    </div>
  );
};

export default QuickActionsBar;