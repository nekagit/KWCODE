import React from 'react';
import { ScrollArea } from "@/components/shadcn/scroll-area";

interface KvStoreDisplayProps {
  dataKvEntries: { key: string; value: string }[];
  dataLoading: boolean;
}

export const KvStoreDisplay: React.FC<KvStoreDisplayProps> = ({
  dataKvEntries,
  dataLoading,
}) => {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">kv_store</p>
      <ScrollArea className="h-40 rounded border bg-muted/30 p-3 font-mono text-xs">
        {dataKvEntries.length === 0 && !dataLoading ? (
          <p className="text-muted-foreground">No kv entries.</p>
        ) : (
          dataKvEntries.map((e) => (
            <div key={e.key} className="mb-3">
              <span className="font-semibold text-foreground">{e.key}</span>
              <pre className="mt-1 whitespace-pre-wrap break-all text-muted-foreground">{e.value}</pre>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
};
