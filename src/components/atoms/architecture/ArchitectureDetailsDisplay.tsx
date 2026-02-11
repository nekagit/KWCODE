import React from 'react';
import { Badge } from "@/components/ui/badge";
import type { ArchitectureRecord, ArchitectureCategory } from "@/types/architecture";

interface ArchitectureDetailsDisplayProps {
  viewItem: ArchitectureRecord;
  CATEGORY_LABELS: Record<ArchitectureCategory, string>;
}

export const ArchitectureDetailsDisplay: React.FC<ArchitectureDetailsDisplayProps> = ({
  viewItem,
  CATEGORY_LABELS,
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">{viewItem.name}</h3>
        <Badge variant="secondary">{CATEGORY_LABELS[viewItem.category]}</Badge>
      </div>
      {viewItem.description && <p className="text-sm text-muted-foreground">{viewItem.description}</p>}

      {viewItem.practices && (
        <div>
          <h4 className="text-sm font-medium mb-2">Best practices / principles</h4>
          <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 rounded-md p-3 overflow-x-auto">
            {viewItem.practices}
          </pre>
        </div>
      )}
      {viewItem.scenarios && (
        <div>
          <h4 className="text-sm font-medium mb-2">When to use / scenarios</h4>
          <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 rounded-md p-3 overflow-x-auto">
            {viewItem.scenarios}
          </pre>
        </div>
      )}
      {viewItem.references && (
        <div>
          <h4 className="text-sm font-medium mb-2">References</h4>
          <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 rounded-md p-3 overflow-x-auto">
            {viewItem.references}
          </pre>
        </div>
      )}
      {viewItem.anti_patterns && (
        <div>
          <h4 className="text-sm font-medium mb-2">Anti-patterns</h4>
          <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 rounded-md p-3 overflow-x-auto">
            {viewItem.anti_patterns}
          </pre>
        </div>
      )}
      {viewItem.examples && (
        <div>
          <h4 className="text-sm font-medium mb-2">Examples</h4>
          <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 rounded-md p-3 overflow-x-auto">
            {viewItem.examples}
          </pre>
        </div>
      )}
      {viewItem.extr-inputs && Object.keys(viewItem.extr-inputs).length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Additional inputs</h4>
          <ul className="space-y-2">
            {Object.entries(viewItem.extr-inputs).map(([key, value]) => (
              <li key={key}>
                <span className="text-sm font-medium text-muted-foreground">{key}:</span>
                <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 rounded-md p-2 mt-0.5 overflow-x-auto">
                  {value as string}
                </pre>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!viewItem.practices && !viewItem.scenarios && !viewItem.references && !viewItem.anti_patterns && !viewItem.examples && !(viewItem.extr-inputs && Object.keys(viewItem.extr-inputs).length) && (
        <p className="text-muted-foreground text-sm">No content defined. Edit to add practices, scenarios, or more inputs.</p>
      )}
    </div>
  );
};
