"use client";

/**
 * Re-exports from Zustand run store. Run state is now managed by Zustand
 * (src/store/run-store.ts). Use RunStoreHydration in layout instead of RunStateProvider.
 */
export { useRunState } from "@/store/run-store";
export { RunStoreHydration } from "@/store/run-store-hydration";
