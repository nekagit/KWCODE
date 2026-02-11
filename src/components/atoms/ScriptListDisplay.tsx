import React from 'react';
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { FileCode } from "lucide-react";

interface ScriptListDisplayProps {
  dataScripts: { name: string; path: string }[];
  dataLoading: boolean;
  readFileContent: (path: string) => Promise<void>;
  dataFileContent: string | null;
  dataSelectedPath: string | null;
}

export const ScriptListDisplay: React.FC<ScriptListDisplayProps> = ({
  dataScripts,
  dataLoading,
  readFileContent,
  dataFileContent,
  dataSelectedPath,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">script/</p>
        <ScrollArea className="h-32 rounded border bg-muted/30 p-2">
          {dataScripts.length === 0 && !dataLoading ? (
            <p className="text-muted-foreground text-sm">No scripts found.</p>
          ) : (
            dataScripts.map((f) => (
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
            <span className="text-muted-foreground">Click a script to view content.</span>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
