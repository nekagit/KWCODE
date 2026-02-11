import React from 'react';
import type { UIThemeTemplate } from "@/data/ui-theme-templates";

interface ThemeNameHeaderProps {
  theme: UIThemeTemplate;
  hsl: (val: string) => string;
}

export const ThemeNameHeader: React.FC<ThemeNameHeaderProps> = ({ theme, hsl }) => {
  const v = theme.variables;
  return (
    <div
      className="flex items-center justify-between gap-2 px-3 py-2 border-b"
      style={{ borderColor: hsl(v.border) }}
    >
      <span className="font-semibold text-sm truncate" style={{ color: hsl(v.foreground) }}>
        {theme.name}
      </span>
      <div className="flex gap-0.5 shrink-0">
        {[
          { key: "primary", val: v.primary },
          { key: "success", val: v.success },
          { key: "warning", val: v.warning },
          { key: "info", val: v.info },
          { key: "destructive", val: v.destructive },
        ].map(({ key, val }) => (
          <div
            key={key}
            className="h-4 w-4 rounded border"
            style={{
              background: hsl(val),
              borderColor: hsl(v.border),
              boxShadow: "inset 0 0 0 1px hsla(0,0%,0%,0.1)",
            }}
            title={key}
          />
        ))}
      </div>
    </div>
  );
};
