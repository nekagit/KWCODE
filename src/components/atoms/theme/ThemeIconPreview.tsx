import React from 'react';
import type { UIThemeTemplate } from "@/data/ui-theme-templates";
import { Check, AlertTriangle, Trash2, Info, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ThemeIconPreviewProps {
  theme: UIThemeTemplate;
  hsl: (val: string) => string;
}

export const ThemeIconPreview: React.FC<ThemeIconPreviewProps> = ({ theme, hsl }) => {
  const v = theme.variables;
  return (
    <div
      className="flex items-center gap-1.5 flex-wrap"
      style={{ color: hsl(v.cardForeground) }}
    >
      <Badge
        className="text-[10px] font-medium uppercase tracking-wide w-full"
        style={{ color: hsl(v.mutedForeground) }}
        variant="outline"
      >
        Icons
      </Badge>
      <div className="flex gap-1">
        <Check className="h-4 w-4" style={{ color: hsl(v.primary) }} />
        <Check className="h-4 w-4" style={{ color: hsl(v.success) }} />
        <AlertTriangle className="h-4 w-4" style={{ color: hsl(v.warning) }} />
        <Info className="h-4 w-4" style={{ color: hsl(v.info) }} />
        <Trash2 className="h-4 w-4" style={{ color: hsl(v.destructive) }} />
        <Sparkles className="h-4 w-4" style={{ color: hsl(v.accent) }} />
      </div>
    </div>
  );
};
