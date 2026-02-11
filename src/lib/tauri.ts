const IS_TAURI_BUILD = process.env.NEXT_PUBLIC_IS_TAURI === 'true';

let tauriInvoke;
let tauriListen;
let tauriOpen;

if (IS_TAURI_BUILD) {
  // Dynamically import only when running in Tauri context
  import("@tauri-apps/api/core").then(module => tauriInvoke = module.invoke);
  import("@tauri-apps/api/event").then(module => tauriListen = module.listen);
  import { open } from "@tauri-apps/api/dialog";
tauriOpen = open;
} else {
  // Fallback to no-op functions for non-Tauri builds
  import("./noop-tauri-api").then(module => {
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
  return tauriInvoke(cmd, args);
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
