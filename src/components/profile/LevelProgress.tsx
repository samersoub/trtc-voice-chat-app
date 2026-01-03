"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { useLocale } from "@/contexts";
import { type Profile } from "@/services/ProfileService";

type Props = {
  profile: Profile | null;
  className?: string;
};

const LevelProgress: React.FC<Props> = ({ profile, className }) => {
  const { dir } = useLocale();
  const coins = profile?.coins ?? 0;
  const level = Math.floor(coins / 100) + 1;
  const progress = coins % 100;

  return (
    <div className={className || ""}>
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm font-medium">
          {dir === "rtl" ? `المستوى ${level}` : `Level ${level}`}
        </div>
        <div className="text-xs text-muted-foreground">
          {dir === "rtl" ? `${progress}/100 نقاط` : `${progress}/100 pts`}
        </div>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

export default LevelProgress;