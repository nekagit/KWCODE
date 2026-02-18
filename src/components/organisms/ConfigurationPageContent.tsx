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
import { Palette, Keyboard, Copy, FileText, FileJson, RefreshCw, Loader2, FolderOpen, ClipboardList, Check, XCircle, ExternalLink, Printer } from "lucide-react";
import { getOrganismClasses } from "./organism-classes";

const c = getOrganismClasses("ConfigurationPageContent.tsx");
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { ThemeSelector } from "@/components/molecules/UtilitiesAndHelpers/ThemeSelector";
import { SingleContentPage } from "@/components/organisms/SingleContentPage";
import { Button } from "@/components/ui/button";
import { getAppVersion } from "@/lib/app-version";
import { getApiHealth } from "@/lib/api-health";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { invoke, isTauri } from "@/lib/tauri";
import { copyAppDataFolderPath } from "@/lib/copy-app-data-folder-path";
import { copyAppInfoToClipboard } from "@/lib/copy-app-info";
import {
  downloadAppInfoAsMarkdown,
  copyAppInfoAsMarkdownToClipboard,
} from "@/lib/download-app-info-md";
import { copyAppInfoAsJsonToClipboard, downloadAppInfoAsJson } from "@/lib/download-app-info-json";
import { openAppDataFolderInFileManager } from "@/lib/open-app-data-folder";
import { getAppRepositoryUrl } from "@/lib/app-repository";
import { toast } from "sonner";

export function ConfigurationPageContent() {
  const { error, refreshData } = useRunState();
  const { theme: uiTheme, setTheme: setUITheme } = useUITheme();
  const { openShortcutsModal } = useQuickActions();
  const [version, setVersion] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [apiHealthOk, setApiHealthOk] = useState<boolean | null>(null);
  const [apiHealthChecking, setApiHealthChecking] = useState(false);
  const [dataDir, setDataDir] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState<string | null>(null);

  useEffect(() => {
    setRepoUrl(getAppRepositoryUrl());
  }, []);

  useEffect(() => {
    getAppVersion().then(setVersion).catch(() => setVersion("—"));
  }, []);

  useEffect(() => {
    if (!isTauri) {
      setDataDir("—");
      return;
    }
    invoke<string>("get_data_dir")
      .then((p) => setDataDir(p?.trim() ?? "—"))
      .catch(() => setDataDir("—"));
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

  const handleCheckApiHealth = useCallback(async () => {
    if (isTauri) return;
    setApiHealthChecking(true);
    try {
      const data = await getApiHealth();
      setApiHealthOk(data.ok === true);
      if (data.ok) {
        toast.success(data.version ? `API health: OK (${data.version})` : "API health: OK");
      } else {
        toast.error("API health: Unavailable");
      }
    } catch {
      setApiHealthOk(false);
      toast.error("API health: Unavailable");
    } finally {
      setApiHealthChecking(false);
    }
  }, []);

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
          onClick={() => window.print()}
          className="h-9 gap-2"
          aria-label="Print current page"
          title="Print configuration page (⌘P)"
        >
          <Printer className="size-4 shrink-0" aria-hidden />
          Print
        </Button>
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
            {dataDir !== null && (
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs text-muted-foreground">Data directory:</span>
                <code className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded break-all">
                  {dataDir}
                </code>
                {isTauri && dataDir !== "—" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                    onClick={() => void copyAppDataFolderPath()}
                    aria-label="Copy data directory path to clipboard"
                  >
                    <Copy className="size-3.5 shrink-0" aria-hidden />
                    Copy path
                  </Button>
                )}
              </div>
            )}
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
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  void copyAppInfoAsMarkdownToClipboard({
                    version: version ?? "—",
                    theme: effectiveTheme,
                  })
                }
                className="h-9 gap-2"
                aria-label="Copy app info as Markdown to clipboard"
                title="Copy as Markdown (same content as Download as Markdown)"
              >
                <Copy className="size-4 shrink-0" aria-hidden />
                Copy as Markdown
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  downloadAppInfoAsMarkdown({
                    version: version ?? "—",
                    theme: effectiveTheme,
                  })
                }
                className="h-9 gap-2"
                aria-label="Download app info as Markdown"
                title="Download app info as Markdown (same data as Copy app info)"
              >
                <FileText className="size-4 shrink-0" aria-hidden />
                Download as Markdown
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  copyAppInfoAsJsonToClipboard({
                    version: version ?? "—",
                    theme: effectiveTheme,
                  })
                }
                className="h-9 gap-2"
                aria-label="Copy app info as JSON to clipboard"
                title="Copy as JSON (same data as Download as JSON)"
              >
                <Copy className="size-4 shrink-0" aria-hidden />
                Copy as JSON
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  downloadAppInfoAsJson({
                    version: version ?? "—",
                    theme: effectiveTheme,
                  })
                }
                className="h-9 gap-2"
                aria-label="Download app info as JSON"
                title="Download app info as JSON (same data as Copy app info)"
              >
                <FileJson className="size-4 shrink-0" aria-hidden />
                Download as JSON
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
              {repoUrl && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-2 text-muted-foreground hover:text-foreground"
                    onClick={async () => {
                      const ok = await copyTextToClipboard(repoUrl);
                      if (ok) toast.success("Repository URL copied to clipboard");
                    }}
                    aria-label="Copy repository URL to clipboard"
                    title="Copy repository URL"
                  >
                    <Copy className="size-4 shrink-0" aria-hidden />
                    Copy repository URL
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2"
                    onClick={() => window.open(repoUrl, "_blank", "noopener,noreferrer")}
                    aria-label="Open app repository in browser"
                    title={repoUrl}
                  >
                    <ExternalLink className="size-4 shrink-0" aria-hidden />
                    View source
                  </Button>
                </>
              )}
              {!isTauri && (
                <div className="flex flex-wrap items-center gap-2">
                  {apiHealthOk !== null && (
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={apiHealthChecking}
                    onClick={() => void handleCheckApiHealth()}
                    className="h-8 gap-1.5"
                    aria-label="Check API health"
                    title="Re-check API health (browser mode)"
                  >
                    {apiHealthChecking ? (
                      <RefreshCw className="size-3.5 shrink-0 animate-spin" aria-hidden />
                    ) : (
                      <RefreshCw className="size-3.5 shrink-0" aria-hidden />
                    )}
                    Check API health
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </SingleContentPage>
    </div>
  );
}
