"use client";

import { createContext, useContext } from "react";

export const ForcedDarkPortalContext = createContext(false);
export const ForcedLightPortalContext = createContext(false);
export function useForcedDarkPortal() {
  return useContext(ForcedDarkPortalContext);
}
export function useForcedLightPortal() {
  return useContext(ForcedLightPortalContext);
}
