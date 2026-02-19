"use client";

/** Sidebar Theme Label component. */
import { useUITheme } from "@/context/ui-theme";
import { getUIThemeById, isValidUIThemeId } from "@/data/ui-theme-templates";

export type SidebarThemeLabelProps = {
  /** When true (sidebar collapsed), label is hidden. */
  collapsed: boolean;
};

/**
 * Displays the current UI theme name in the sidebar footer (e.g. "Light", "Dark", "Ocean").
 * Hidden when sidebar is collapsed. Uses useUITheme() and getUIThemeById() for display name.
 */
export function SidebarThemeLabel({ collapsed }: SidebarThemeLabelProps) {
  const { theme } = useUITheme();
  const effectiveId = isValidUIThemeId(theme) ? theme : "light";
  const template = getUIThemeById(effectiveId);
  const displayName = template?.name ?? effectiveId;

  if (collapsed) return null;

  return (
    <div
      className="px-2 py-0.5 text-center"
      aria-label={`Current theme: ${displayName}`}
    >
      <span className="text-[10px] text-muted-foreground">
        {displayName}
      </span>
    </div>
  );
}
