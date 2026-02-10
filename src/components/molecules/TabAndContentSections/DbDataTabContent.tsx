"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/shadcn/accordion";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { Alert, AlertDescription } from "@/components/shadcn/alert";
import { Loader2, Database, FileCode, Braces } from "lucide-react";
import { invoke, isTauri } from "@/lib/tauri";
import type { Ticket, Feature } from "@/components/organisms/HomePageContent"; // Assuming these types are available or re-defined

interface DbDataTabContentProps {
  isTauriEnv: boolean | null;
  tickets: Ticket[];
  features: Feature[];
  allProjects: string[];
  activeProjects: string[];
}

export function DbDataTabContent({
  isTauriEnv,
  tickets,
  features,
  allProjects,
  activeProjects,
}: DbDataTabContentProps) {
  const [dataScripts, setDataScripts] = useState<{ name: string; path: string }[]>([]);
  const [dataJsonFiles, setDataJsonFiles] = useState<{ name: string; path: string }[]>([]);
  const [dataFileContent, setDataFileContent] = useState<string | null>(null);
  const [dataSelectedPath, setDataSelectedPath] = useState<string | null>(null);
  const [dataKvEntries, setDataKvEntries] = useState<{ key: string; value: string }[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Data tab: Tauri — load scripts, JSON files, KV from backend
  useEffect(() => {
    if (isTauriEnv !== true) return;
    let cancelled = false;
    setDataLoading(true);
    setDataError(null);
    Promise.all([
      invoke<{ name: string; path: string }[]>("list_scripts"),
      invoke<{ name: string; path: string }[]>("list_data_files"),
      invoke<{ key: string; value: string }[]>("get_kv_store_entries"),
    ])
      .then(([scripts, jsonFiles, kvEntries]) => {
        if (!cancelled) {
          setDataScripts(scripts);
          setDataJsonFiles(jsonFiles);
          setDataKvEntries(kvEntries);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setDataError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isTauriEnv]);

  // Data tab: browser — load scripts and JSON file list from API (kvEntries set from loadData)
  useEffect(() => {
    if (isTauriEnv !== false) return;
    let cancelled = false;
    setDataLoading(true);
    setDataError(null);
    fetch("/api/data/files")
      .then((res) => (res.ok ? res.json() : res.text().then((t) => Promise.reject(new Error(t)))))
      .then((data: { scripts?: { name: string; path: string }[]; jsonFiles?: { name: string; path: string }[] }) => {
        if (!cancelled) {
          setDataScripts(data.scripts ?? []);
          setDataJsonFiles(data.jsonFiles ?? []);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setDataError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isTauriEnv]);

  const readFileContent = useCallback(async (path: string) => {
    setDataError(null);
    try {
      const content = isTauriEnv
        ? await invoke<string>("read_file_text", { path: path })
        : (await (await fetch(`/api/data/file?path=${encodeURIComponent(path)}`)).text());
      setDataFileContent(content);
      setDataSelectedPath(path);
    } catch (e) {
      setDataError(e instanceof Error ? e.message : String(e));
    }
  }, [isTauriEnv]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Database className="h-5 w-5" />
          DB Data
        </CardTitle>
        <CardDescription className="space-y-1 text-base">
          <span className="block">Scripts in script/, JSON files in data/, and DB data (kv_store, tickets, features).</span>
          {isTauriEnv ? (
            <span className="block text-muted-foreground text-xs mt-1">
              SQLite: data/app.db (created on first run; migrated from data/*.json). All app data is read/written via the DB.
            </span>
          ) : (
            <span className="block text-muted-foreground text-xs mt-1">
              Browser: data is read from data/*.json via API. Scripts and JSON list from project root. Saves require the Tauri app.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {dataError && (
          <Alert variant="destructive">
            <AlertDescription>{dataError}</AlertDescription>
          </Alert>
        )}
        {dataLoading && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </p>
        )}

        <Accordion type="multiple" className="w-full glasgmorphism" defaultValue={["scripts", "json", "db"]}>
          <AccordionItem value="scripts">
            <AccordionTrigger className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Scripts ({dataScripts.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">script/</p>
                  <ScrollArea className="h-32 rounded border bg-muted/30 p-2">
                    {dataScripts.length === 0 && !dataLoading && (
                      <p className="text-muted-foreground text-sm">No scripts found.</p>
                    )}
                    {dataScripts.map((f) => (
                      <button
                        key={f.path}
                        type="button"
                        className="block w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted truncate"
                        onClick={() => readFileContent(f.path)}
                      >
                        {f.name}
                      </button>
                    ))}
                  </ScrollArea>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Content</p>
                  <ScrollArea className="h-48 rounded border bg-muted/30 p-3 font-mono text-xs whitespace-pre-wrap break-all">
                    {dataSelectedPath && dataFileContent != null ? (
                      dataFileContent
                    ) : (
                      <span className="text-muted-foreground">Click a script to view content.</span>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="json">
            <AccordionTrigger className="flex items-center gap-2">
              <Braces className="h-4 w-4" />
              JSON files ({dataJsonFiles.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">data/*.json</p>
                  <ScrollArea className="h-32 rounded border bg-muted/30 p-2">
                    {dataJsonFiles.length === 0 && !dataLoading && (
                      <p className="text-muted-foreground text-sm">No JSON files.</p>
                    )}
                    {dataJsonFiles.map((f) => (
                      <button
                        key={f.path}
                        type="button"
                        className="block w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted truncate"
                        onClick={() => readFileContent(f.path)}
                      >
                        {f.name}
                      </button>
                    ))}
                  </ScrollArea>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Content</p>
                  <ScrollArea className="h-48 rounded border bg-muted/30 p-3 font-mono text-xs whitespace-pre-wrap break-all">
                    {dataSelectedPath && dataFileContent != null ? (
                      dataFileContent
                    ) : (
                      <span className="text-muted-foreground">Click a JSON file to view content.</span>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="db">
            <AccordionTrigger className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              DB Data (kv_store, tickets, features)
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">kv_store</p>
                <ScrollArea className="h-40 rounded border bg-muted/30 p-3 font-mono text-xs">
                  {dataKvEntries.length === 0 && !dataLoading && (
                    <p className="text-muted-foreground">No kv entries.</p>
                  )}
                  {dataKvEntries.map((e) => (
                    <div key={e.key} className="mb-3">
                      <span className="font-semibold text-foreground">{e.key}</span>
                      <pre className="mt-1 whitespace-pre-wrap break-all text-muted-foreground">{e.value}</pre>
                    </div>
                  ))}
                </ScrollArea>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">tickets ({tickets.length})</p>
                <ScrollArea className="h-48 rounded border bg-muted/30 p-3 font-mono text-xs whitespace-pre-wrap">
                  <pre>{JSON.stringify(tickets, null, 2)}</pre>
                </ScrollArea>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">features ({features.length})</p>
                <ScrollArea className="h-48 rounded border bg-muted/30 p-3 font-mono text-xs whitespace-pre-wrap">
                  <pre>{JSON.stringify(features, null, 2)}</pre>
                </ScrollArea>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">all_projects ({allProjects.length})</p>
                <ScrollArea className="h-24 rounded border bg-muted/30 p-3 font-mono text-xs">
                  <pre>{JSON.stringify(allProjects, null, 2)}</pre>
                </ScrollArea>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">cursor_projects / active ({activeProjects.length})</p>
                <ScrollArea className="h-24 rounded border bg-muted/30 p-3 font-mono text-xs">
                  <pre>{JSON.stringify(activeProjects, null, 2)}</pre>
                </ScrollArea>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
