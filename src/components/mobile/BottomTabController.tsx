"use client";

import React from "react";
import { useLocation } from "react-router-dom";
import BottomTab from "./BottomTab";

const BottomTabController: React.FC = () => {
  const { pathname } = useLocation();

  // Hide bottom bar ONLY in voice room join pages: /voice/rooms/:id/join
  const hideForVoiceRoom = /^\/voice\/rooms\/[^/]+\/join$/.test(pathname);

  return <BottomTab visible={!hideForVoiceRoom} />;
};

export default BottomTabController;