/** Json File List Display component. */
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Braces } from "lucide-react";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("Displays/JsonFileListDisplay.tsx");

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
    <div className={classes[0]}>
      <div className={classes[1]}>
        <p className={classes[2]}>data/*.json</p>
        <ScrollArea className={classes[3]}>
          {dataJsonFiles.length === 0 && !dataLoading ? (
            <p className={classes[4]}>No JSON files.</p>
          ) : (
            dataJsonFiles.map((f) => (
              <button
                key={f.path}
                type="button"
                className={classes[5]}
                onClick={() => readFileContent(f.path)}
              >
                {f.name}
              </button>
            ))
          )}
        </ScrollArea>
      </div>
      <div className={classes[1]}>
        <p className={classes[2]}>Content</p>
        <ScrollArea className={classes[8]}>
          {dataSelectedPath && dataFileContent != null ? (
            dataFileContent
          ) : (
            <span className={classes[9]}>Click a JSON file to view content.</span>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
