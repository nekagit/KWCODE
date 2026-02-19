/**
 * Static page and design templates for the Design tab (landing, dashboard, etc.).
 */
import type { PageTemplate, DesignConfig, DesignSection, DesignColors, DesignTypography, DesignLayout } from "@/types/design";

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: "landing",
    name: "Landing Page",
    description: "Hero, features, social proof, CTA",
    defaultSections: [
      { kind: "nav", title: "Navigation", order: 0 },
      { kind: "hero", title: "Hero", order: 1 },
      { kind: "features", title: "Features", order: 2 },
      { kind: "testimonials", title: "Testimonials", order: 3 },
      { kind: "cta", title: "Call to Action", order: 4 },
      { kind: "footer", title: "Footer", order: 5 },
    ],
  },
  {
    id: "contact",
    name: "Contact Page",
    description: "Form, info, map placeholder",
    defaultSections: [
      { kind: "nav", title: "Navigation", order: 0 },
      { kind: "hero", title: "Header", order: 1 },
      { kind: "contact-form", title: "Contact Form", order: 2 },
      { kind: "footer", title: "Footer", order: 3 },
    ],
  },
  {
    id: "about",
    name: "About Page",
    description: "Story, team, values",
    defaultSections: [
      { kind: "nav", title: "Navigation", order: 0 },
      { kind: "hero", title: "About Header", order: 1 },
      { kind: "content", title: "Our Story", order: 2 },
      { kind: "team", title: "Team", order: 3 },
      { kind: "footer", title: "Footer", order: 4 },
    ],
  },
  {
    id: "pricing",
    name: "Pricing Page",
    description: "Plans, comparison, FAQ",
    defaultSections: [
      { kind: "nav", title: "Navigation", order: 0 },
      { kind: "hero", title: "Pricing Header", order: 1 },
      { kind: "pricing", title: "Plans", order: 2 },
      { kind: "faq", title: "FAQ", order: 3 },
      { kind: "cta", title: "CTA", order: 4 },
      { kind: "footer", title: "Footer", order: 5 },
    ],
  },
  {
    id: "blog",
    name: "Blog / Content",
    description: "List, article layout",
    defaultSections: [
      { kind: "nav", title: "Navigation", order: 0 },
      { kind: "content", title: "Content", order: 1 },
      { kind: "sidebar", title: "Sidebar", order: 2 },
      { kind: "footer", title: "Footer", order: 3 },
    ],
  },
  {
    id: "dashboard",
    name: "Dashboard",
    description: "App shell, sidebar, main content",
    defaultSections: [
      { kind: "nav", title: "Top Bar", order: 0 },
      { kind: "sidebar", title: "Sidebar", order: 1 },
      { kind: "content", title: "Main Content", order: 2 },
    ],
  },
  {
    id: "auth",
    name: "Auth (Login/Signup)",
    description: "Centered card, form",
    defaultSections: [
      { kind: "hero", title: "Branding", order: 0 },
      { kind: "content", title: "Form", order: 1 },
    ],
  },
  {
    id: "docs",
    name: "Documentation",
    description: "Sidebar nav, content area",
    defaultSections: [
      { kind: "nav", title: "Header", order: 0 },
      { kind: "sidebar", title: "Doc Nav", order: 1 },
      { kind: "content", title: "Document", order: 2 },
      { kind: "footer", title: "Footer", order: 3 },
    ],
  },
  {
    id: "product",
    name: "Product / Service",
    description: "Product highlight, benefits, CTA",
    defaultSections: [
      { kind: "nav", title: "Navigation", order: 0 },
      { kind: "hero", title: "Product Hero", order: 1 },
      { kind: "features", title: "Benefits", order: 2 },
      { kind: "cta", title: "Get Started", order: 3 },
      { kind: "footer", title: "Footer", order: 4 },
    ],
  },
  {
    id: "custom",
    name: "Custom",
    description: "Build your own section order",
    defaultSections: [],
  },
];

const defaultColors: DesignColors = {
  primary: "#0f172a",
  secondary: "#64748b",
  accent: "#3b82f6",
  background: "#ffffff",
  surface: "#f8fafc",
  text: "#0f172a",
  textMuted: "#64748b",
};

const defaultTypography: DesignTypography = {
  headingFont: "Inter, system-ui, sans-serif",
  bodyFont: "Inter, system-ui, sans-serif",
  baseSize: "16px",
  scale: "1.25",
};

const defaultLayout: DesignLayout = {
  maxWidth: "1200px",
  spacing: "1.5rem",
  borderRadius: "0.5rem",
  navStyle: "minimal",
};

function buildSectionsFromTemplate(templateId: string): DesignSection[] {
  const template = PAGE_TEMPLATES.find((t) => t.id === templateId);
  if (!template || template.defaultSections.length === 0) {
    return [
      { id: "s1", kind: "hero", title: "Hero", order: 0, enabled: true },
      { id: "s2", kind: "content", title: "Content", order: 1, enabled: true },
      { id: "s3", kind: "footer", title: "Footer", order: 2, enabled: true },
    ];
  }
  return template.defaultSections.map((s, i) => ({
    id: `s${i}-${s.kind}`,
    kind: s.kind,
    title: s.title,
    order: s.order,
    enabled: true,
  }));
}

export function createDefaultDesignConfig(templateId: string = "landing"): DesignConfig {
  return {
    projectName: "My Product",
    templateId: templateId as DesignConfig["templateId"],
    pageTitle: "Home",
    colors: { ...defaultColors },
    typography: { ...defaultTypography },
    layout: { ...defaultLayout },
    sections: buildSectionsFromTemplate(templateId),
  };
}
