import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("Displays/KvStoreDisplay.tsx");

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
      <p className={classes[0]}>kv_store</p>
      <ScrollArea className={classes[1]}>
        {dataKvEntries.length === 0 && !dataLoading ? (
          <p className={classes[2]}>No kv entries.</p>
        ) : (
          dataKvEntries.map((e) => (
            <div key={e.key} className={classes[3]}>
              <span className={classes[4]}>{e.key}</span>
              <pre className={classes[5]}>{e.value}</pre>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
};
