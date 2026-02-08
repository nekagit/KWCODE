"use client";

import { useCallback, useEffect, useState } from "react";
import { invoke, isTauri } from "@/lib/tauri";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRunState } from "@/context/run-state";
import { FileCode, Palette } from "lucide-react";
import type { FileEntry } from "@/types/run";
import {
  UI_THEME_TEMPLATES,
  applyUITheme,
  getStoredUITheme,
  isValidUIThemeId,
  type UIThemeId,
} from "@/data/ui-theme-templates";

export default function ConfigurationPage() {
  const { error, timing, setTiming } = useRunState();
  const [scripts, setScripts] = useState<FileEntry[]>([]);
  const [uiTheme, setUITheme] = useState<UIThemeId | undefined>(undefined);

  useEffect(() => {
    const stored = getStoredUITheme();
    setUITheme(stored ?? "light");
  }, []);

  const handleThemeSelect = useCallback((id: UIThemeId) => {
    applyUITheme(id);
    setUITheme(id);
  }, []);

  const loadScripts = useCallback(async () => {
    if (!isTauri()) return;
    try {
      const list = await invoke<FileEntry[]>("list_scripts");
      setScripts(list);
    } catch {
      setScripts([]);
    }
  }, []);

  useEffect(() => {
    loadScripts();
  }, [loadScripts]);

  const effectiveTheme = uiTheme && isValidUIThemeId(uiTheme) ? uiTheme : "light";

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Design templates
          </CardTitle>
          <CardDescription>
            Choose a theme to change the app background, accents, and UI component colors. Your choice is saved and applied on next load.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {UI_THEME_TEMPLATES.map((theme) => {
              const isSelected = effectiveTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleThemeSelect(theme.id)}
                  className={`flex flex-col items-stretch rounded-lg border p-3 text-left transition-colors hover:bg-accent/50 ${
                    isSelected ? "ring-2 ring-primary border-primary bg-accent/30" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-8 w-8 shrink-0 rounded-md border border-border"
                      style={{
                        background: `hsl(${theme.variables.background})`,
                        boxShadow: `inset 0 0 0 1px hsl(${theme.variables.border})`,
                      }}
                    />
                    <div className="flex shrink-0 gap-0.5">
                      <div
                        className="h-5 w-3 rounded border border-border"
                        style={{ background: `hsl(${theme.variables.primary})` }}
                        title="Primary"
                      />
                      <div
                        className="h-5 w-3 rounded border border-border"
                        style={{ background: `hsl(${theme.variables.success})` }}
                        title="Success"
                      />
                      <div
                        className="h-5 w-3 rounded border border-border"
                        style={{ background: `hsl(${theme.variables.warning})` }}
                        title="Warning"
                      />
                      <div
                        className="h-5 w-3 rounded border border-border"
                        style={{ background: `hsl(${theme.variables.info})` }}
                        title="Info"
                      />
                      <div
                        className="h-5 w-3 rounded border border-border"
                        style={{ background: `hsl(${theme.variables.destructive})` }}
                        title="Destructive"
                      />
                    </div>
                    <span className="font-medium text-sm truncate min-w-0">{theme.name}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{theme.description}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Scripts
          </CardTitle>
          <CardDescription>
            Files in the <code className="rounded bg-muted px-1">script/</code>{" "}
            directory. The main script{" "}
            <code className="rounded bg-muted px-1">
              run_prompts_all_projects.sh
            </code>{" "}
            is used when you run from Prompts or a Feature.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scripts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No scripts found in script/ or app not running in Tauri.
            </p>
          ) : (
            <ScrollArea className="h-[120px] rounded-md border p-3">
              <ul className="space-y-1.5">
                {scripts.map((s) => (
                  <li
                    key={s.path}
                    className="flex items-center gap-2 text-sm font-mono"
                  >
                    <FileCode className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate" title={s.path}>
                      {s.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={s.path}>
                      {s.path}
                    </span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timing (seconds)</CardTitle>
          <CardDescription>
            Env vars passed to the script. Adjust for your machine and network.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>After open project</Label>
            <Input
              type="number"
              step="0.5"
              value={timing.sleep_after_open_project}
              onChange={(e) =>
                setTiming((t) => ({
                  ...t,
                  sleep_after_open_project: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>After window focus</Label>
            <Input
              type="number"
              step="0.1"
              value={timing.sleep_after_window_focus}
              onChange={(e) =>
                setTiming((t) => ({
                  ...t,
                  sleep_after_window_focus: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Between Shift+Tabs</Label>
            <Input
              type="number"
              step="0.1"
              value={timing.sleep_between_shift_tabs}
              onChange={(e) =>
                setTiming((t) => ({
                  ...t,
                  sleep_between_shift_tabs: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>After all Shift+Tabs</Label>
            <Input
              type="number"
              step="0.1"
              value={timing.sleep_after_all_shift_tabs}
              onChange={(e) =>
                setTiming((t) => ({
                  ...t,
                  sleep_after_all_shift_tabs: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>After Cmd+N</Label>
            <Input
              type="number"
              step="0.1"
              value={timing.sleep_after_cmd_n}
              onChange={(e) =>
                setTiming((t) => ({
                  ...t,
                  sleep_after_cmd_n: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Before paste</Label>
            <Input
              type="number"
              step="0.1"
              value={timing.sleep_before_paste}
              onChange={(e) =>
                setTiming((t) => ({
                  ...t,
                  sleep_before_paste: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>After paste</Label>
            <Input
              type="number"
              step="0.1"
              value={timing.sleep_after_paste}
              onChange={(e) =>
                setTiming((t) => ({
                  ...t,
                  sleep_after_paste: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>After Enter</Label>
            <Input
              type="number"
              step="0.1"
              value={timing.sleep_after_enter}
              onChange={(e) =>
                setTiming((t) => ({
                  ...t,
                  sleep_after_enter: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Between projects</Label>
            <Input
              type="number"
              step="0.5"
              value={timing.sleep_between_projects}
              onChange={(e) =>
                setTiming((t) => ({
                  ...t,
                  sleep_between_projects: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Between rounds</Label>
            <Input
              type="number"
              value={timing.sleep_between_rounds}
              onChange={(e) =>
                setTiming((t) => ({
                  ...t,
                  sleep_between_rounds: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
