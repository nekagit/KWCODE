import React from 'react';
import type { UIThemeTemplate } from "@/data/ui-theme-templates";

interface ThemeButtonPreviewProps {
  theme: UIThemeTemplate;
  hsl: (val: string) => string;
}

export const ThemeButtonPreview: React.FC<ThemeButtonPreviewProps> = ({ theme, hsl }) => {
  const v = theme.variables;
  return (
    <div className="space-y-1">
      <span
        className="text-[10px] font-medium uppercase tracking-wide"
        style={{ color: hsl(v.mutedForeground) }}
      >
        Buttons
      </span>
      <div className="flex flex-wrap gap-1">
        {[
          { bg: v.primary, fg: v.primaryForeground, label: "Primary" },
          { bg: v.secondary, fg: v.secondaryForeground, label: "Sec" },
          { bg: v.destructive, fg: v.destructiveForeground, label: "Del" },
          { bg: v.success, fg: v.successForeground, label: "Ok" },
          { bg: v.warning, fg: v.warningForeground, label: "Warn" },
          { bg: v.info, fg: v.infoForeground, label: "Info" },
        ].map(({ bg, fg, label }) => (
          <span
            key={label}
            className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium shadow-sm"
            style={{
              background: hsl(bg),
              color: hsl(fg),
              border: `1px solid ${hsl(v.border)}`,
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};
