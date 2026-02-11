import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileCode } from "lucide-react";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("Displays/ScriptListDisplay.tsx");

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
    <div className={classes[0]}>
      <div className={classes[1]}>
        <p className={classes[2]}>script/</p>
        <ScrollArea className={classes[3]}>
          {dataScripts.length === 0 && !dataLoading ? (
            <p className={classes[4]}>No scripts found.</p>
          ) : (
            dataScripts.map((f) => (
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
            <span className={classes[9]}>Click a script to view content.</span>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
