"use client";

import { useCallback } from "react";
import {
  isValidUIThemeId,
  applyUITheme,
  type UIThemeId,
} from "@/data/ui-theme-templates";
import { useUITheme } from "@/context/ui-theme";
import { useRunState } from "@/context/run-state";
import { Palette } from "lucide-react";
import { ThemedPageLayout } from "@/components/molecules/ThemedPageLayout/ThemedPageLayout";
import { ThemeSelector } from "@/components/molecules/ThemeSelector/ThemeSelector";

export function ConfigurationPageContent() {
  const { error } = useRunState();
  const { theme: uiTheme, setTheme: setUITheme } = useUITheme();

  const handleThemeSelect = useCallback(
    (id: UIThemeId) => {
      applyUITheme(id);
      setUITheme(id);
    },
    [setUITheme]
  );

  const effectiveTheme = isValidUIThemeId(uiTheme) ? uiTheme : "light";

  return (
    <ThemedPageLayout
      title="Design templates"
      description="Choose a theme to change the app background, accents, and UI component colors. Your choice is saved and applied on next load."
      icon={<Palette className="h-5 w-5" />}
      error={error}
    >
      <ThemeSelector onThemeSelect={handleThemeSelect} effectiveTheme={effectiveTheme} />
    </ThemedPageLayout>
  );
}
