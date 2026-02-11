import React from 'react';
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { Braces } from "lucide-react";

interface JsonFileListDisplayProps {
  dataJsonFiles: { name: string; path: string }[];
  dataLoading: boolean;
  readFileContent: (path: string) => Promise<void>;
  dataFileContent: string | null;
  dataSelectedPath: string | null;
}

export const JsonFileListDisplay: React.FC<JsonFileListDisplayProps> = ({
  dataJsonFiles,
  dataLoading,
  readFileContent,
  dataFileContent,
  dataSelectedPath,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">data/*.json</p>
        <ScrollArea className="h-32 rounded border bg-muted/30 p-2">
          {dataJsonFiles.length === 0 && !dataLoading ? (
            <p className="text-muted-foreground text-sm">No JSON files.</p>
          ) : (
            dataJsonFiles.map((f) => (
              <button
                key={f.path}
                type="button"
                className="block w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted truncate"
                onClick={() => readFileContent(f.path)}
              >
                {f.name}
              </button>
            ))
          )}
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
  );
};
