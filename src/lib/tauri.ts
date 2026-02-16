/** Detect Tauri at runtime (WebView has __TAURI_INTERNALS__ or __TAURI__) or via env (when dev server is started with NEXT_PUBLIC_IS_TAURI=true). */
function detectTauri(): boolean {
  if (typeof window === "undefined") return process.env.NEXT_PUBLIC_IS_TAURI === "true";
  const w = window as unknown as { __TAURI_INTERNALS__?: unknown; __TAURI__?: unknown };
  return !!(w.__TAURI_INTERNALS__ ?? w.__TAURI__) || process.env.NEXT_PUBLIC_IS_TAURI === "true";
}
export const isTauri = typeof window === "undefined" ? process.env.NEXT_PUBLIC_IS_TAURI === "true" : detectTauri();

type InvokeFn = (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
type ListenFn = <T>(event: string, handler: (event: { payload: T }) => void) => Promise<() => void>;
type OpenFn = (options?: { directory?: boolean; multiple?: boolean; title?: string }) => Promise<string | string[] | null>;

let tauriInvoke: InvokeFn | undefined;
let tauriListen: ListenFn | undefined;
let tauriOpen: OpenFn | undefined;

const invokeReadyPromise: Promise<void> | null = isTauri
  ? import("@tauri-apps/api/core").then((module) => {
      tauriInvoke = module.invoke;
    })
  : null;
const listenReadyPromise: Promise<void> | null = isTauri
  ? import("@tauri-apps/api/event").then((module) => {
      tauriListen = module.listen;
    })
  : null;
const openReadyPromise: Promise<void> | null = isTauri
  ? import("@tauri-apps/plugin-dialog").then((m: { open: OpenFn }) => {
      tauriOpen = m.open;
    })
  : null;

if (!isTauri) {
  import("@/lib/noop-tauri-api").then((module) => {
    tauriInvoke = module.invoke;
    tauriListen = module.listen;
    tauriOpen = module.open;
  });
}

const TAURI_API_WAIT_MS = 5000;

export const invoke = async <T>(cmd: string, args?: Record<string, unknown>): Promise<T> => {
  if (isTauri && invokeReadyPromise) {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Tauri invoke API load timeout")), TAURI_API_WAIT_MS)
    );
    await Promise.race([invokeReadyPromise, timeout]);
  } else if (!tauriInvoke) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  if (!tauriInvoke) {
    const msg = `Tauri 'invoke' API not available yet. Command: ${cmd}`;
    console.warn(msg);
    return Promise.reject(new Error(msg));
  }
  return tauriInvoke(cmd, args) as Promise<T>;
};

export const listen = async <T>(event: string, handler: (event: { payload: T }) => void): Promise<() => void> => {
  if (isTauri && listenReadyPromise) {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Tauri listen API load timeout")), TAURI_API_WAIT_MS)
    );
    await Promise.race([listenReadyPromise, timeout]);
  } else if (!tauriListen) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  if (!tauriListen) {
    console.warn(`Tauri 'listen' API not available yet. Event: ${event}`);
    return Promise.resolve(() => {});
  }
  return tauriListen(event, handler);
};

export const showOpenDirectoryDialog = async (): Promise<string | undefined> => {
  if (isTauri && openReadyPromise) {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Tauri dialog API load timeout")), TAURI_API_WAIT_MS)
    );
    await Promise.race([openReadyPromise, timeout]);
  } else if (!tauriOpen) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  if (!tauriOpen) {
    console.warn("Tauri 'dialog.open' API not available yet.");
    return Promise.resolve(undefined);
  }

  try {
    const selected = await tauriOpen({
      directory: true,
      multiple: false,
      title: "Select a project repository",
    });

    if (typeof selected === "string") {
      return selected;
    } else if (Array.isArray(selected) && selected.length > 0) {
      return selected[0];
    }
    return undefined;
  } catch (error) {
    console.error("Error opening directory dialog:", error);
    return undefined;
  }
};
