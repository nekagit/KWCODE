/**
 * UI theme templates for the app. Used by the Configuration page to let users
 * change colors, accents, and background. Stored in localStorage and applied
 * via data-theme attribute; CSS in globals.css defines [data-theme="..."] overrides.
 */

export const UI_THEME_STORAGE_KEY = "app-ui-theme";

export type UIThemeId =
  | "light"
  | "dark"
  | "ocean"
  | "forest"
  | "warm"
  | "red";

/** Unified schema: every theme uses this exact set of CSS variable values (HSL: "H S% L%"). */
export interface UIThemeVariables {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  info: string;
  infoForeground: string;
  border: string;
  input: string;
  ring: string;
  radius: string;
}

export interface UIThemeTemplate {
  id: UIThemeId;
  name: string;
  description: string;
  /** HSL values for CSS vars (e.g. "0 0% 100%"). Keys match --var names in kebab-case. */
  variables: UIThemeVariables;
  /** Hex fallback for loading overlay / first paint (optional; CSS vars used when available). */
  fallbackBackground?: string;
  fallbackForeground?: string;
}

const varKeys = [
  "background",
  "foreground",
  "card",
  "cardForeground",
  "popover",
  "popoverForeground",
  "primary",
  "primaryForeground",
  "secondary",
  "secondaryForeground",
  "muted",
  "mutedForeground",
  "accent",
  "accentForeground",
  "destructive",
  "destructiveForeground",
  "success",
  "successForeground",
  "warning",
  "warningForeground",
  "info",
  "infoForeground",
  "border",
  "input",
  "ring",
  "radius",
] as const;

function toCssVarKey(key: string): string {
  return key.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "");
}

export function themeVariablesToCss(variables: UIThemeVariables): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of varKeys) {
    const v = variables[k as keyof UIThemeVariables];
    if (v != null) out[`--${toCssVarKey(k)}`] = v;
  }
  return out;
}

export const UI_THEME_TEMPLATES: UIThemeTemplate[] = [
  {
    id: "light",
    name: "Light default",
    description: "Neutral light background, dark text.",
    fallbackBackground: "#fafafa",
    fallbackForeground: "#171717",
    variables: {
      background: "0 0% 100%",
      foreground: "240 10% 3.9%",
      card: "0 0% 100%",
      cardForeground: "240 10% 3.9%",
      popover: "0 0% 100%",
      popoverForeground: "240 10% 3.9%",
      primary: "240 5.9% 10%",
      primaryForeground: "0 0% 98%",
      secondary: "240 4.8% 95.9%",
      secondaryForeground: "240 5.9% 10%",
      muted: "240 4.8% 95.9%",
      mutedForeground: "240 3.8% 46.1%",
      accent: "240 4.8% 95.9%",
      accentForeground: "240 5.9% 10%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      success: "142 71% 45%",
      successForeground: "0 0% 100%",
      warning: "38 92% 50%",
      warningForeground: "0 0% 100%",
      info: "217 91% 60%",
      infoForeground: "0 0% 100%",
      border: "240 5.9% 90%",
      input: "240 5.9% 90%",
      ring: "240 5.9% 10%",
      radius: "0.5rem",
    },
  },
  {
    id: "dark",
    name: "Dark",
    description: "Dark background, light text.",
    fallbackBackground: "#0a0a0f",
    fallbackForeground: "#fafafa",
    variables: {
      background: "240 10% 3.9%",
      foreground: "0 0% 98%",
      card: "240 10% 5%",
      cardForeground: "0 0% 98%",
      popover: "240 10% 5%",
      popoverForeground: "0 0% 98%",
      primary: "0 0% 98%",
      primaryForeground: "240 5.9% 10%",
      secondary: "240 3.7% 15.9%",
      secondaryForeground: "0 0% 98%",
      muted: "240 3.7% 15.9%",
      mutedForeground: "240 5% 64.9%",
      accent: "240 3.7% 15.9%",
      accentForeground: "0 0% 98%",
      destructive: "0 62.8% 30.6%",
      destructiveForeground: "0 0% 98%",
      success: "142 70% 50%",
      successForeground: "0 0% 100%",
      warning: "38 92% 55%",
      warningForeground: "0 0% 100%",
      info: "217 91% 65%",
      infoForeground: "0 0% 100%",
      border: "240 3.7% 15.9%",
      input: "240 3.7% 15.9%",
      ring: "240 4.9% 83.9%",
      radius: "0.5rem",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Blue accent, light background.",
    fallbackBackground: "#f0f4f9",
    fallbackForeground: "#1a2332",
    variables: {
      background: "210 20% 98%",
      foreground: "220 20% 12%",
      card: "0 0% 100%",
      cardForeground: "220 20% 12%",
      popover: "0 0% 100%",
      popoverForeground: "220 20% 12%",
      primary: "217 91% 60%",
      primaryForeground: "0 0% 100%",
      secondary: "210 30% 92%",
      secondaryForeground: "220 20% 20%",
      muted: "210 25% 93%",
      mutedForeground: "220 15% 45%",
      accent: "217 70% 92%",
      accentForeground: "217 91% 40%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      success: "142 71% 42%",
      successForeground: "0 0% 100%",
      warning: "38 92% 48%",
      warningForeground: "0 0% 100%",
      info: "217 91% 60%",
      infoForeground: "0 0% 100%",
      border: "214 25% 88%",
      input: "214 25% 88%",
      ring: "217 91% 60%",
      radius: "0.5rem",
    },
  },
  {
    id: "forest",
    name: "Forest",
    description: "Green accent, light background.",
    fallbackBackground: "#f2f8f4",
    fallbackForeground: "#1a2620",
    variables: {
      background: "140 25% 98%",
      foreground: "140 20% 12%",
      card: "0 0% 100%",
      cardForeground: "140 20% 12%",
      popover: "0 0% 100%",
      popoverForeground: "140 20% 12%",
      primary: "142 71% 45%",
      primaryForeground: "0 0% 100%",
      secondary: "140 25% 92%",
      secondaryForeground: "140 20% 20%",
      muted: "140 20% 93%",
      mutedForeground: "140 15% 45%",
      accent: "142 55% 90%",
      accentForeground: "142 71% 35%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      success: "142 71% 45%",
      successForeground: "0 0% 100%",
      warning: "38 92% 48%",
      warningForeground: "0 0% 100%",
      info: "217 91% 55%",
      infoForeground: "0 0% 100%",
      border: "140 20% 88%",
      input: "140 20% 88%",
      ring: "142 71% 45%",
      radius: "0.5rem",
    },
  },
  {
    id: "warm",
    name: "Warm",
    description: "Amber accent, cream background.",
    fallbackBackground: "#faf8f5",
    fallbackForeground: "#1f1b17",
    variables: {
      background: "40 33% 98%",
      foreground: "25 25% 12%",
      card: "0 0% 100%",
      cardForeground: "25 25% 12%",
      popover: "0 0% 100%",
      popoverForeground: "25 25% 12%",
      primary: "25 95% 53%",
      primaryForeground: "0 0% 100%",
      secondary: "38 30% 92%",
      secondaryForeground: "25 25% 20%",
      muted: "38 25% 93%",
      mutedForeground: "25 15% 45%",
      accent: "38 70% 90%",
      accentForeground: "25 95% 40%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      success: "142 71% 42%",
      successForeground: "0 0% 100%",
      warning: "25 95% 53%",
      warningForeground: "0 0% 100%",
      info: "217 91% 55%",
      infoForeground: "0 0% 100%",
      border: "35 25% 88%",
      input: "35 25% 88%",
      ring: "25 95% 53%",
      radius: "0.5rem",
    },
  },
  {
    id: "red",
    name: "Red",
    description: "Strong red background, white text.",
    fallbackBackground: "#ef4444",
    fallbackForeground: "#ffffff",
    variables: {
      background: "0 100% 50%",
      foreground: "0 0% 100%",
      card: "0 0% 100%",
      cardForeground: "240 10% 3.9%",
      popover: "0 0% 100%",
      popoverForeground: "240 10% 3.9%",
      primary: "0 0% 100%",
      primaryForeground: "0 100% 40%",
      secondary: "0 80% 60%",
      secondaryForeground: "0 0% 100%",
      muted: "0 70% 55%",
      mutedForeground: "0 0% 95%",
      accent: "0 90% 55%",
      accentForeground: "0 0% 100%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      success: "142 70% 45%",
      successForeground: "0 0% 100%",
      warning: "38 92% 55%",
      warningForeground: "0 0% 100%",
      info: "217 91% 65%",
      infoForeground: "0 0% 100%",
      border: "0 60% 65%",
      input: "0 60% 65%",
      ring: "0 0% 100%",
      radius: "0.5rem",
    },
  },
];

const themeIds: UIThemeId[] = ["light", "dark", "ocean", "forest", "warm", "red"];

export function isValidUIThemeId(value: string): value is UIThemeId {
  return themeIds.includes(value as UIThemeId);
}

export function getUIThemeById(id: UIThemeId): UIThemeTemplate | undefined {
  return UI_THEME_TEMPLATES.find((t) => t.id === id);
}

/** Apply theme to document (set data-theme and localStorage). Call from client. */
export function applyUITheme(themeId: UIThemeId): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(UI_THEME_STORAGE_KEY, themeId);
  document.documentElement.setAttribute("data-theme", themeId);
}

/** Read current theme id from localStorage. Returns undefined if not set or invalid. */
export function getStoredUITheme(): UIThemeId | undefined {
  if (typeof window === "undefined") return undefined;
  const stored = window.localStorage.getItem(UI_THEME_STORAGE_KEY);
  return stored && isValidUIThemeId(stored) ? (stored as UIThemeId) : undefined;
}
