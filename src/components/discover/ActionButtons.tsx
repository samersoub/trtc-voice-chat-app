"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Mic, BarChart3 } from "lucide-react";

const ActionButtons: React.FC = () => {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <Button
        asChild
        className="h-10 sm:h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700"
      >
        <Link to="/voice/rooms">
          <Trophy className="mr-1 h-4 w-4" />
          Events
        </Link>
      </Button>
      <Button
        asChild
        className="h-10 sm:h-12 bg-gradient-to-r from-pink-500 to-red-600 text-white hover:from-pink-600 hover:to-red-700"
      >
        <Link to="/voice/create">
          <Mic className="mr-1 h-4 w-4" />
          Voice Match
        </Link>
      </Button>
      <Button
        asChild
        className="h-10 sm:h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
      >
        <Link to="/profile">
          <BarChart3 className="mr-1 h-4 w-4" />
          Rankings
        </Link>
      </Button>
    </div>
  );
};

export default ActionButtons;