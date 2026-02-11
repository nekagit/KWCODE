export const isTauri = process.env.NEXT_PUBLIC_IS_TAURI === 'true';

type InvokeFn = (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
type ListenFn = <T>(event: string, handler: (event: { payload: T }) => void) => Promise<() => void>;
type OpenFn = (options?: { directory?: boolean; multiple?: boolean; title?: string }) => Promise<string | string[] | null>;

let tauriInvoke: InvokeFn | undefined;
let tauriListen: ListenFn | undefined;
let tauriOpen: OpenFn | undefined;

if (isTauri) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/3a8fa5bb-85c1-4305-bdaa-558e16902420',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/lib/tauri.ts:7',message:'Entering Tauri block',data:{isTauriBuild:isTauri},timestamp:Date.now(),runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
  // #endregion
  // Dynamically import only when running in Tauri context
  import("@tauri-apps/api/core").then(module => tauriInvoke = module.invoke);
  import("@tauri-apps/api/event").then(module => tauriListen = module.listen);
  import("@tauri-apps/plugin-dialog").then((m: { open: OpenFn }) => { tauriOpen = m.open; });
} else {
// #region agent log
fetch('http://127.0.0.1:7242/ingest/3a8fa5bb-85c1-4305-bdaa-558e16902420',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/lib/tauri.ts:14',message:'Entering non-Tauri block',data:{isTauriBuild:isTauri},timestamp:Date.now(),runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
// #endregion
  // Fallback to no-op functions for non-Tauri builds
  import("@/lib/noop-tauri-api").then(module => {
    tauriInvoke = module.invoke;
    tauriListen = module.listen;
    tauriOpen = module.open;
  });
}

export const invoke = async <T>(cmd: string, args?: Record<string, unknown>): Promise<T> => {
  if (!tauriInvoke) {
    await new Promise(resolve => setTimeout(resolve, 50)); // Wait for dynamic import
  }
  if (!tauriInvoke) {
    console.warn(`Tauri 'invoke' API not available yet. Command: ${cmd}`);
    return Promise.reject(new Error(`Tauri 'invoke' API not available yet. Command: ${cmd}`));
  }
  return tauriInvoke(cmd, args) as Promise<T>;
};

export const listen = async <T>(event: string, handler: (event: { payload: T }) => void): Promise<() => void> => {
  if (!tauriListen) {
    await new Promise(resolve => setTimeout(resolve, 50)); // Wait for dynamic import
  }
  if (!tauriListen) {
    console.warn(`Tauri 'listen' API not available yet. Event: ${event}`);
    return Promise.resolve(() => {});
  }
  return tauriListen(event, handler);
};

export const showOpenDirectoryDialog = async (): Promise<string | undefined> => {
  if (!tauriOpen) {
    await new Promise(resolve => setTimeout(resolve, 50)); // Wait for dynamic import
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
