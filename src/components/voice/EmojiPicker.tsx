"use client";

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

type EmojiPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (emoji: string) => void;
};

const EMOJIS = [
  "😀","😄","😁","😂","🤣","😊","😍","😘","😎","🤩",
  "👍","👏","🙌","🙏","💪","🔥","💯","✨","🎉","🥳",
  "🎶","🎵","🎧","🪩","❤️","💖","💜","💙","💚","💛",
  "😇","🤗","🤔","😴","🤐","😅","😤","😮‍💨","😱","🤯",
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ open, onOpenChange, onPick }) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Choose an emoji</SheetTitle>
        </SheetHeader>
        <ScrollArea className="mt-3 max-h-64">
          <div className="grid grid-cols-8 gap-2">
            {EMOJIS.map((e) => (
              <Button
                key={e}
                variant="outline"
                className="h-10 w-10 p-0 text-xl"
                onClick={() => onPick(e)}
                aria-label={`Send ${e}`}
              >
                {e}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default EmojiPicker;