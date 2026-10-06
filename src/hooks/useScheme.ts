"use client";

import { useSyncExternalStore } from "react";
import {
  getSchemeSnapshot,
  getServerSchemeSnapshot,
  subscribeScheme,
  type SchemeSnapshot,
} from "@/lib/scheme";

export function useScheme(): SchemeSnapshot {
  return useSyncExternalStore(subscribeScheme, getSchemeSnapshot, getServerSchemeSnapshot);
}
