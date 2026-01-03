"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLocale } from "@/contexts";

type Props = {
  momentsSlot: React.ReactNode;
  detailsSlot: React.ReactNode;
  defaultValue?: "moments" | "details";
};

const ProfileTabs: React.FC<Props> = ({ momentsSlot, detailsSlot, defaultValue = "moments" }) => {
  const { t, dir } = useLocale();
  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="moments">{dir === "rtl" ? "اللحظات" : "Moments"}</TabsTrigger>
          <TabsTrigger value="details">{dir === "rtl" ? "الملف الشخصي" : "Personal Profile"}</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="moments">{momentsSlot}</TabsContent>
      <TabsContent value="details">{detailsSlot}</TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;