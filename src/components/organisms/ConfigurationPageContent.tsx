"use client";

import { useCallback, useEffect, useState } from "react";
import { GlassCard } from "@/components/atoms/GlassCard";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Alert, AlertDescription } from "@/components/shadcn/alert";
import { useRunState } from "@/context/run-state";
import { Palette } from "lucide-react";
import {
  UI_THEME_TEMPLATES,
  isValidUIThemeId,
  applyUITheme,
  type UIThemeId,
} from "@/data/ui-theme-templates";
import { useUITheme } from "@/context/ui-theme";
import { ThemePreviewCard } from "@/components/molecules/ThemePreviewCard";

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
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <GlassCard>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Design templates
          </CardTitle>
          <CardDescription className="text-base">
            Choose a theme to change the app background, accents, and UI component colors. Your choice is saved and applied on next load.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {UI_THEME_TEMPLATES.map((theme) => (
              <ThemePreviewCard
                key={theme.id}
                theme={theme}
                isSelected={effectiveTheme === theme.id}
                onSelect={() => handleThemeSelect(theme.id)}
              />
            ))}
          </div>
          </CardContent>
      </GlassCard>
    </div>
  );
}
