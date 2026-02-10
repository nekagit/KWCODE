"use client";

import { useCallback, useEffect, useState } from "react";
import { GlassCard } from "@/components/atoms/GlassCard";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Alert, AlertDescription } from "@/components/shadcn/alert";
import { useRunState } from "@/context/run-state";
import { Palette, KeyRound } from "lucide-react";
import {
  UI_THEME_TEMPLATES,
  isValidUIThemeId,
  applyUITheme,
  type UIThemeId,
} from "@/data/ui-theme-templates";
import { useUITheme } from "@/context/ui-theme";
import { ThemePreviewCard } from "@/components/molecules/ThemePreviewCard";

export default function ConfigurationPage() {
  const { error } = useRunState();
  const { theme: uiTheme, setTheme: setUITheme } = useUITheme();
  const [openaiConfigured, setOpenaiConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/check-openai")
      .then((res) => res.json())
      .then((data: { configured?: boolean }) => setOpenaiConfigured(data.configured ?? false))
      .catch(() => setOpenaiConfigured(false));
  }, []);

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

      {openaiConfigured === false && (
        <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/10">
          <KeyRound className="h-4 w-4 shrink-0" />
          <AlertDescription>
            <strong>OPENAI_API_KEY is not set.</strong> Add it in <code className="rounded bg-muted px-1">.env.local</code> to use AI
            generate (prompts, tickets, ideas, designs, architectures). Generate endpoints will return 500 until configured.
          </AlertDescription>
        </Alert>
      )}

      <GlassCard>
        <ShadcnCardHeader>
          <ShadcnCardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Design templates
          </ShadcnCardTitle>
          <ShadcnCardDescription className="text-base">
            Choose a theme to change the app background, accents, and UI component colors. Your choice is saved and applied on next load.
          </ShadcnCardDescription>
        </ShadcnCardHeader>
        <ShadcnCardContent>
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
          </ShadcnCardContent>
      </GlassCard>
    </div>
  );
}
