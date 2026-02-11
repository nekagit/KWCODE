import React from 'react';
import type { UIThemeTemplate } from "@/data/ui-theme-templates";

interface ThemeColorSwatchesProps {
  theme: UIThemeTemplate;
  hsl: (val: string) => string;
}

export const ThemeColorSwatches: React.FC<ThemeColorSwatchesProps> = ({ theme, hsl }) => {
  const v = theme.variables;
  return (
    <div
      className="rounded-md p-2 min-h-[48px] border"
      style={{
        background: hsl(v.card),
        borderColor: hsl(v.border),
        color: hsl(v.cardForeground),
      }}
    >
      <div
        className="text-[10px] font-medium uppercase tracking-wide mb-1.5"
        style={{ color: hsl(v.mutedForeground) }}
      >
        Card
      </div>
      <div className="flex flex-wrap gap-1">
        {[
          { label: "Bg", val: v.background },
          { label: "Card", val: v.card },
          { label: "Pri", val: v.primary },
          { label: "Sec", val: v.secondary },
          { label: "Acc", val: v.accent },
          { label: "Muted", val: v.muted },
          { label: "Dest", val: v.destructive },
          { label: "Ok", val: v.success },
          { label: "Warn", val: v.warning },
          { label: "Info", val: v.info },
          { label: "Border", val: v.border },
        ].map(({ label, val }) => (
          <div
            key={label}
            className="rounded h-5 w-5 border shrink-0"
            style={{
              background: hsl(val),
              borderColor: hsl(v.border),
            }}
            title={label}
          />
        ))}
      </div>
    </div>
  );
};
