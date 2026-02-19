/**
 * No-op Tauri dialog.open for non-Tauri environments.
 */
export const tauriOpen = () => {
  console.warn("Tauri dialog API is not available in this environment.");
  return Promise.resolve(undefined);
};