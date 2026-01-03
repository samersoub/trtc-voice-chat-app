"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/contexts";

type Props = {
  photos?: string[];
};

const ProfileMoments: React.FC<Props> = ({ photos = [] }) => {
  const { dir } = useLocale();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dir === "rtl" ? "اللحظات" : "Moments"}</CardTitle>
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            {dir === "rtl" ? "لا توجد صور حتى الآن." : "No photos yet."}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`moment-${idx}`}
                className="w-full h-28 sm:h-32 md:h-36 object-cover rounded-md"
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileMoments;