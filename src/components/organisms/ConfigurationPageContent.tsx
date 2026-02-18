"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isValidUIThemeId,
  applyUITheme,
  type UIThemeId,
} from "@/data/ui-theme-templates";
import { useUITheme } from "@/context/ui-theme";
import { useRunState } from "@/context/run-state";
import { useQuickActions } from "@/context/quick-actions-context";
import { Palette, Keyboard, Copy, RefreshCw, Loader2, FolderOpen, ClipboardList, Check, XCircle } from "lucide-react";
import { getOrganismClasses } from "./organism-classes";

const c = getOrganismClasses("ConfigurationPageContent.tsx");
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { ThemeSelector } from "@/components/molecules/UtilitiesAndHelpers/ThemeSelector";
import { SingleContentPage } from "@/components/organisms/SingleContentPage";
import { Button } from "@/components/ui/button";
import { getAppVersion } from "@/lib/app-version";
import { getApiHealth } from "@/lib/api-health";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { isTauri } from "@/lib/tauri";
import { copyAppInfoToClipboard } from "@/lib/copy-app-info";
import { openAppDataFolderInFileManager } from "@/lib/open-app-data-folder";
import { toast } from "sonner";

export function ConfigurationPageContent() {
  const { error, refreshData } = useRunState();
  const { theme: uiTheme, setTheme: setUITheme } = useUITheme();
  const { openShortcutsModal } = useQuickActions();
  const [version, setVersion] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [apiHealthOk, setApiHealthOk] = useState<boolean | null>(null);

  useEffect(() => {
    getAppVersion().then(setVersion).catch(() => setVersion("—"));
  }, []);

  useEffect(() => {
    if (isTauri) return;
    getApiHealth()
      .then((data) => setApiHealthOk(data.ok === true))
      .catch(() => setApiHealthOk(false));
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
      getAppVersion().then(setVersion).catch(() => setVersion("—"));
      toast.success("Data refreshed");
    } catch {
      toast.error("Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  const handleThemeSelect = useCallback(
    (id: UIThemeId) => {
      applyUITheme(id);
      setUITheme(id);
    },
    [setUITheme]
  );

  const effectiveTheme = isValidUIThemeId(uiTheme) ? uiTheme : "light";

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 pb-12">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Configuration" },
        ]}
      />
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={refreshing}
          onClick={handleRefresh}
          className="h-9 gap-2"
          aria-label="Refresh data"
        >
          {refreshing ? (
            <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="size-4 shrink-0" aria-hidden />
          )}
          Refresh
        </Button>
      </div>
      <SingleContentPage
        title="Design templates"
        description="Choose a theme to change the app background, accents, and UI component colors. Your choice is saved and applied on next load."
        icon={<Palette className={c["0"]} />}
        layout="card"
        error={error}
      >
        <div className="space-y-8">
          <ThemeSelector onThemeSelect={handleThemeSelect} effectiveTheme={effectiveTheme} />
          <div className="pt-6 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={openShortcutsModal}
              className="h-9 gap-2"
              aria-label="Open keyboard shortcuts help"
            >
              <Keyboard className="size-4 shrink-0" aria-hidden />
              Keyboard shortcuts
            </Button>
          </div>
          <div className="pt-6 border-t border-border/60">
            <p className="text-sm font-medium text-muted-foreground mb-3">Data</p>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => openAppDataFolderInFileManager()}
                className="h-9 gap-2"
                aria-label="Open app data folder in file manager"
              >
                <FolderOpen className="size-4 shrink-0" aria-hidden />
                Open data folder
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  copyAppInfoToClipboard({
                    version: version ?? "—",
                    theme: effectiveTheme,
                  })
                }
                className="h-9 gap-2"
                aria-label="Copy app info to clipboard"
              >
                <ClipboardList className="size-4 shrink-0" aria-hidden />
                Copy app info
              </Button>
            </div>
          </div>
          {version !== null && (
            <div className="pt-6 border-t border-border/60 flex flex-wrap items-center gap-4 sm:gap-6">
              <p className="text-sm text-muted-foreground" aria-label="App version">
                Version {version}
              </p>
              {version !== "—" && version.trim() !== "" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-2 text-muted-foreground hover:text-foreground"
                  onClick={() => copyTextToClipboard(version)}
                  aria-label="Copy app version to clipboard"
                >
                  <Copy className="size-4 shrink-0" aria-hidden />
                  Copy version
                </Button>
              )}
              {!isTauri && apiHealthOk !== null && (
                <p
                  className="text-sm text-muted-foreground flex items-center gap-2"
                  aria-label="API health status"
                >
                  {apiHealthOk ? (
                    <>
                      <Check className="size-4 shrink-0 text-green-600 dark:text-green-500" aria-hidden />
                      API health: OK
                    </>
                  ) : (
                    <>
                      <XCircle className="size-4 shrink-0 text-destructive" aria-hidden />
                      API health: Unavailable
                    </>
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      </SingleContentPage>
    </div>
  );
}
