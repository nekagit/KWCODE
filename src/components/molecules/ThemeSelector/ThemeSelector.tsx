"use client";

import { useCallback } from "react";
import {
  UI_THEME_TEMPLATES,
  isValidUIThemeId,
  applyUITheme,
  type UIThemeId,
} from "@/data/ui-theme-templates";
import { useUITheme } from "@/context/ui-theme";
import { ThemePreviewCard } from "@/components/molecules/CardsAndDisplay/ThemePreviewCard";

interface ThemeSelectorProps {
  onThemeSelect: (id: UIThemeId) => void;
  effectiveTheme: UIThemeId;
}

export function ThemeSelector({ onThemeSelect, effectiveTheme }: ThemeSelectorProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {UI_THEME_TEMPLATES.map((theme) => (
        <ThemePreviewCard
          key={theme.id}
          theme={theme}
          isSelected={effectiveTheme === theme.id}
          onSelect={() => onThemeSelect(theme.id)}
        />
      ))}
    </div>
  );
}
