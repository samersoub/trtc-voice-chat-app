"use client";

import React from "react";
import BottomTab from "./BottomTab";
import { useBottomBarVisibility } from "@/hooks/useBottomBarVisibility";

const BottomTabController: React.FC = () => {
  const visible = useBottomBarVisibility();
  return <BottomTab visible={visible} />;
};

export default BottomTabController;