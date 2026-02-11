"use client";

import { Check, AlertTriangle, Trash2, Info, Sparkles } from "lucide-react";
import type { UIThemeTemplate } from "@/data/ui-theme-templates";
import { ThemeNameHeader } from "@/components/atoms/ThemeNameHeader";
import { ThemeColorSwatches } from "@/components/atoms/ThemeColorSwatches";
import { ThemeIconPreview } from "@/components/atoms/ThemeIconPreview";
import { ThemeButtonPreview } from "@/components/atoms/ThemeButtonPreview";

export function ThemePreviewCard({
  theme,
  isSelected,
  onSelect,
}: {
  theme: UIThemeTemplate;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const v = theme.variables;
  const hsl = (val: string) => `hsl(${val})`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={
        isSelected
          ? "ring-2 ring-primary border-primary shadow-lg scale-[1.02] flex flex-col rounded-xl border-2 overflow-hidden text-left transition-all hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
          : "border-border flex flex-col rounded-xl border-2 overflow-hidden text-left transition-all hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
      }
      style={{
        background: hsl(v.background),
        color: hsl(v.foreground),
        borderColor: isSelected ? undefined : hsl(v.border),
      }}
    >
      <ThemeNameHeader theme={theme} hsl={hsl} />

      <div className="p-2 space-y-2">
        <ThemeColorSwatches theme={theme} hsl={hsl} />

        <ThemeIconPreview theme={theme} hsl={hsl} />

        <ThemeButtonPreview theme={theme} hsl={hsl} />
      </div>

      <span
        className="block px-3 py-2 text-[11px] line-clamp-2"
        style={{ color: hsl(v.mutedForeground), background: hsl(v.muted) }}
      >
        {theme.description}
      </span>
    </div>
  );
}
