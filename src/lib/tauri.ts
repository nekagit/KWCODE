export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI__" in window;
}

export async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (!isTauri()) {
    throw new Error("Not running in Tauri");
  }
  const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
  return tauriInvoke(cmd, args);
}

export async function listen<T>(
  event: string,
  handler: (payload: T) => void
): Promise<() => void> {
  if (!isTauri()) {
    return () => {};
  }
  const { listen: tauriListen } = await import("@tauri-apps/api/event");
  return tauriListen(event, (e) => handler(e.payload as T));
}
