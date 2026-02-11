"use client";

import type { UIThemeTemplate } from "@/data/ui-theme-templates";
import { useUITheme } from "@/context/ui-theme";
import ThemeNameHeader from "@/components/atoms/headers/ThemeNameHeader";
import { ThemeColorSwatches } from "@/components/atoms/theme/ThemeColorSwatches";
import { ThemeIconPreview } from "@/components/atoms/theme/ThemeIconPreview";
import { ThemeButtonPreview } from "@/components/atoms/theme/ThemeButtonPreview";

/** Parse HSL string "H S% L%" or "H S% L% / A" and return lightness 0–100. */
function parseHslLightness(hsl: string): number {
  const match = hsl.match(/(\d+(?:\.\d+)?)\s*%(?:\s*\/\s*[\d.]+)?\s*$/);
  return match ? Number(match[1]) : 50;
}

/** Dimmer white and dark text for card content when app is dark and preview theme is light. */
const DIMMER_WHITE = "0 0% 96%";
const DARK_TEXT = "240 10% 3.9%";
const DARK_MUTED = "240 4.8% 95.9%";
const DARK_MUTED_FG = "240 3.8% 46.1%";

export function ThemePreviewCard({
  theme,
  isSelected,
  onSelect,
}: {
  theme: UIThemeTemplate;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { theme: appTheme } = useUITheme();
  const v = theme.variables;
  const hsl = (val: string) => `hsl(${val})`;

  const cardLightness = parseHslLightness(v.card);
  const isAppDarkWithLightCard = appTheme === "dark" && cardLightness >= 90;

  const contentBg = isAppDarkWithLightCard ? `hsl(${DIMMER_WHITE})` : hsl(v.card);
  const contentFg = isAppDarkWithLightCard ? `hsl(${DARK_TEXT})` : hsl(v.cardForeground);
  const mutedBg = isAppDarkWithLightCard ? `hsl(${DARK_MUTED})` : hsl(v.muted);
  const mutedFg = isAppDarkWithLightCard ? `hsl(${DARK_MUTED_FG})` : hsl(v.mutedForeground);

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
        background: isAppDarkWithLightCard ? `hsl(${DIMMER_WHITE})` : hsl(v.background),
        color: isAppDarkWithLightCard ? `hsl(${DARK_TEXT})` : hsl(v.foreground),
        borderColor: isSelected ? undefined : hsl(v.border),
      }}
    >
      <ThemeNameHeader themeName={theme.name} />

      <div
        className="p-2 space-y-2"
        style={{
          background: contentBg,
          color: contentFg,
        }}
      >
        <ThemeColorSwatches
          theme={theme}
          hsl={hsl}
          overrideCardBg={isAppDarkWithLightCard ? DIMMER_WHITE : undefined}
          overrideCardFg={isAppDarkWithLightCard ? DARK_TEXT : undefined}
          overrideMutedFg={isAppDarkWithLightCard ? DARK_MUTED_FG : undefined}
        />

        <ThemeIconPreview
          theme={theme}
          hsl={hsl}
          overrideFg={isAppDarkWithLightCard ? DARK_TEXT : undefined}
          overrideMutedFg={isAppDarkWithLightCard ? DARK_MUTED_FG : undefined}
        />

        <ThemeButtonPreview theme={theme} hsl={hsl} />
      </div>

      <span
        className="block px-3 py-2 text-[11px] line-clamp-2"
        style={{ color: mutedFg, background: mutedBg }}
      >
        {theme.description}
      </span>
    </div>
  );
}
