"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts";
import { showSuccess, showError } from "@/utils/toast";
import { resizeImage } from "@/utils/image";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  onAddPhotos: (urls: string[]) => void;
};

const MomentsUploader: React.FC<Props> = ({ className, onAddPhotos }) => {
  const { dir } = useLocale();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const label = {
    title: dir === "rtl" ? "إضافة لحظات" : "Add Moments",
    button: dir === "rtl" ? "إضافة صور" : "Add Photos",
    success: (n: number) =>
      dir === "rtl" ? `تمت إضافة ${n} صورة` : `Added ${n} photo(s)`,
    invalid: dir === "rtl" ? "الملفات غير صالحة" : "Invalid files",
  };

  const handlePick = () => {
    inputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (files.length === 0) {
      showError(label.invalid);
      return;
    }
    setIsProcessing(true);
    try {
      const resized = await Promise.all(files.map((f) => resizeImage(f)));
      const urls = resized.map((f) => URL.createObjectURL(f));
      onAddPhotos(urls);
      showSuccess(label.success(urls.length));
    } finally {
      setIsProcessing(false);
      // reset input to allow re-selecting same files
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">{label.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("flex items-center justify-between gap-2", dir === "rtl" ? "flex-row-reverse" : "flex-row")}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleChange}
            className="hidden"
          />
          <Button onClick={handlePick} disabled={isProcessing}>
            {label.button}
          </Button>
          {isProcessing && (
            <span className="text-sm text-muted-foreground">
              {dir === "rtl" ? "جارٍ المعالجة…" : "Processing…"}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MomentsUploader;