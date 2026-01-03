"use client";

import React from "react";
import { cn } from "@/lib/utils";

type CodeLineProps = {
  text: string;
  className?: string;
};

const CodeLine: React.FC<CodeLineProps> = ({ text, className }) => {
  return (
    <div
      className={cn(
        "font-mono text-xs bg-muted/30 rounded px-2 py-1 overflow-x-auto",
        className
      )}
      aria-label="code-line"
    >
      {text}
    </div>
  );
};

export default CodeLine;