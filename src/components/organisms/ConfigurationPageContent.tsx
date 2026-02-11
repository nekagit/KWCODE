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
import { getOrganismClasses } from "./organism-classes";

const c = getOrganismClasses("ConfigurationPageContent.tsx");
import { ThemeSelector } from "@/components/molecules/UtilitiesAndHelpers/ThemeSelector";
import { SingleContentPage } from "@/components/organisms/SingleContentPage";

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
    <SingleContentPage
      title="Design templates"
      description="Choose a theme to change the app background, accents, and UI component colors. Your choice is saved and applied on next load."
      icon={<Palette className={c["0"]} />}
      layout="card"
      error={error}
    >
      <ThemeSelector onThemeSelect={handleThemeSelect} effectiveTheme={effectiveTheme} />
    </SingleContentPage>
  );
}
