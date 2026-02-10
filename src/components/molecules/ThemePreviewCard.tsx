"use client";

import { Check, AlertTriangle, Trash2, Info, Sparkles } from "lucide-react";
import type { UIThemeTemplate } from "@/data/ui-theme-templates";

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
      {/* Header: theme name + small swatches */}
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

      {/* Page background vs card: show both */}
      <div className="p-2 space-y-2">
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

        {/* Icons in theme colors */}
        <div
          className="flex items-center gap-1.5 flex-wrap"
          style={{ color: hsl(v.cardForeground) }}
        >
          <span
            className="text-[10px] font-medium uppercase tracking-wide w-full"
            style={{ color: hsl(v.mutedForeground) }}
          >
            Icons
          </span>
          <div className="flex gap-1">
            <Check className="h-4 w-4" style={{ color: hsl(v.primary) }} />
            <Check className="h-4 w-4" style={{ color: hsl(v.success) }} />
            <AlertTriangle className="h-4 w-4" style={{ color: hsl(v.warning) }} />
            <Info className="h-4 w-4" style={{ color: hsl(v.info) }} />
            <Trash2 className="h-4 w-4" style={{ color: hsl(v.destructive) }} />
            <Sparkles className="h-4 w-4" style={{ color: hsl(v.accent) }} />
          </div>
        </div>

        {/* Buttons (mini, theme-colored) */}
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

        {/* Badges */}
        <div className="space-y-1">
          <span
            className="text-[10px] font-medium uppercase tracking-wide"
            style={{ color: hsl(v.mutedForeground) }}
          >
            Badges
          </span>
          <div className="flex flex-wrap gap-1">
            <span
              className="rounded-md border px-2 py-0.5 text-[10px] font-semibold"
              style={{
                background: hsl(v.primary),
                color: hsl(v.primaryForeground),
                borderColor: "transparent",
              }}
            >
              Default
            </span>
            <span
              className="rounded-md border px-2 py-0.5 text-[10px] font-semibold"
              style={{
                background: hsl(v.secondary),
                color: hsl(v.secondaryForeground),
                borderColor: "transparent",
              }}
            >
              Secondary
            </span>
            <span
              className="rounded-md border px-2 py-0.5 text-[10px] font-semibold"
              style={{
                background: hsl(v.destructive),
                color: hsl(v.destructiveForeground),
                borderColor: "transparent",
              }}
            >
              Destructive
            </span>
          </div>
        </div>
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
