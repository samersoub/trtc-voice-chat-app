"use client";

import { useLocation } from "react-router-dom";

/**
 * Returns whether the global bottom bar should be visible for the current route.
 * Hides on voice room join and private call screens.
 */
export function useBottomBarVisibility(): boolean {
  const { pathname } = useLocation();

  // Routes where the bottom bar should be hidden.
  const hidePatterns: RegExp[] = [
    /^\/voice\/rooms\/[^/]+\/join$/, // Voice room screen
    /^\/matching\/call\/[^/]+$/,     // Private call screen
  ];

  const shouldHide = hidePatterns.some((re) => re.test(pathname));
  return !shouldHide;
}