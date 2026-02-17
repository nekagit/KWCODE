/**
 * Map tech names (from tech-stack.json values) to Simple Icons slugs for cdn.simpleicons.org.
 * Used for badges and logos on the Technologies page.
 * @see https://cdn.simpleicons.org/
 */
const TECH_LOGO_SLUGS: Record<string, string> = {
  "Next.js": "nextdotjs",
  "Tailwind CSS": "tailwindcss",
  "Zustand": "zustand",
  "shadcn/ui": "shadcn",
  "Next.js App Router": "nextdotjs",
  "Vitest + Testing Library": "vitest",
  "Vitest": "vitest",
  "Testing Library": "testinglibrary",
  "Turbopack / Vite": "vite",
  "Vite": "vite",
  "Turbopack": "vite",
  "Node.js": "nodedotjs",
  "Express": "express",
  "Next.js API Routes / Express": "express",
  "sqlite": "sqlite",
  "Prisma": "prisma",
  "Prisma or Drizzle": "prisma",
  "Drizzle": "drizzle",
  "Clerk": "clerk",
  "Vitest + Supertest": "vitest",
  "Supertest": "supertest",
  "Zod": "zod",
  "ESLint": "eslint",
  "Prettier": "prettier",
  "Playwright": "playwright",
  "pnpm": "pnpm",
  "npm": "npm",
  "pnpm or npm": "npm",
  "React": "react",
  "TypeScript": "typescript",
  "JavaScript": "javascript",
  "PostgreSQL": "postgresql",
  "MongoDB": "mongodb",
  "Redis": "redis",
  "Docker": "docker",
  "Git": "git",
  "GitHub": "github",
};

const CDN_BASE = "https://cdn.simpleicons.org";

/**
 * Resolve a tech label (e.g. "Next.js", "Tailwind CSS") to a Simple Icons CDN URL.
 * Tries exact match first, then match on first word / known slug.
 */
export function getTechLogoUrl(label: string): string | null {
  if (!label || typeof label !== "string") return null;
  const trimmed = label.trim();
  const exact = TECH_LOGO_SLUGS[trimmed];
  if (exact) return `${CDN_BASE}/${exact}`;
  // Try first segment (e.g. "Vitest + Testing Library" -> "Vitest")
  const first = trimmed.split(/[\s+&/]+/)[0]?.trim();
  if (first && TECH_LOGO_SLUGS[first]) return `${CDN_BASE}/${TECH_LOGO_SLUGS[first]}`;
  return null;
}

/**
 * Get icon slug for a tech (for optional use with color).
 */
export function getTechLogoSlug(label: string): string | null {
  if (!label || typeof label !== "string") return null;
  const trimmed = label.trim();
  const exact = TECH_LOGO_SLUGS[trimmed];
  if (exact) return exact;
  const first = trimmed.split(/[\s+&/]+/)[0]?.trim();
  return (first && TECH_LOGO_SLUGS[first]) ? TECH_LOGO_SLUGS[first] : null;
}
