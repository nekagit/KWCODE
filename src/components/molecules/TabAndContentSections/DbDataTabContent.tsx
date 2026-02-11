"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/shared/Card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { Loader2, Database, FileCode, Braces } from "lucide-react";
import { invoke, isTauri } from "@/lib/tauri";
import type { Ticket } from "@/types/ticket";
import type { Feature } from "@/types/project";
import { ScriptListDisplay } from "@/components/atoms/ScriptListDisplay";
import { JsonFileListDisplay } from "@/components/atoms/JsonFileListDisplay";
import { KvStoreDisplay } from "@/components/atoms/KvStoreDisplay";
import { TicketsDisplay } from "@/components/atoms/TicketsDisplay";
import { FeaturesDisplay } from "@/components/atoms/FeaturesDisplay";
import { AllProjectsDisplay } from "@/components/atoms/AllProjectsDisplay";
import { ActiveProjectsDisplay } from "@/components/atoms/ActiveProjectsDisplay";

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
    <Card
      title={
        <>
          <Database className="h-5 w-5" />
          DB Data
        </>
      }
      subtitle={
        <>
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
        </>
      }
    >
      {dataError && (
        <ErrorDisplay message={dataError} />
      )}
      {dataLoading && (
        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-4">
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
            <ScriptListDisplay
              dataScripts={dataScripts}
              dataLoading={dataLoading}
              readFileContent={readFileContent}
              dataFileContent={dataFileContent}
              dataSelectedPath={dataSelectedPath}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="json">
          <AccordionTrigger className="flex items-center gap-2">
            <Braces className="h-4 w-4" />
            JSON files ({dataJsonFiles.length})
          </AccordionTrigger>
          <AccordionContent>
            <JsonFileListDisplay
              dataJsonFiles={dataJsonFiles}
              dataLoading={dataLoading}
              readFileContent={readFileContent}
              dataFileContent={dataFileContent}
              dataSelectedPath={dataSelectedPath}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="db">
          <AccordionTrigger className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            DB Data (kv_store, tickets, features)
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <KvStoreDisplay dataKvEntries={dataKvEntries} dataLoading={dataLoading} />
            <TicketsDisplay tickets={tickets} />
            <FeaturesDisplay features={features} />
            <AllProjectsDisplay allProjects={allProjects} />
            <ActiveProjectsDisplay activeProjects={activeProjects} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
