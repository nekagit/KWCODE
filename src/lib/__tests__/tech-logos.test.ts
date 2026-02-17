/**
 * Unit tests for tech-logos: mapping tech labels to Simple Icons CDN URLs/slugs.
 */
import { describe, it, expect } from "vitest";
import { getTechLogoUrl, getTechLogoSlug } from "../tech-logos";

describe("getTechLogoUrl", () => {
  it("returns CDN URL for exact tech label", () => {
    expect(getTechLogoUrl("Next.js")).toBe("https://cdn.simpleicons.org/nextdotjs");
    expect(getTechLogoUrl("Tailwind CSS")).toBe("https://cdn.simpleicons.org/tailwindcss");
    expect(getTechLogoUrl("Vitest")).toBe("https://cdn.simpleicons.org/vitest");
  });

  it("returns URL for compound label using first-word fallback", () => {
    expect(getTechLogoUrl("Vitest + Testing Library")).toBe("https://cdn.simpleicons.org/vitest");
    expect(getTechLogoUrl("Next.js App Router")).toBe("https://cdn.simpleicons.org/nextdotjs");
  });

  it("trims whitespace before lookup", () => {
    expect(getTechLogoUrl("  React  ")).toBe("https://cdn.simpleicons.org/react");
  });

  it("returns null for empty or falsy input", () => {
    expect(getTechLogoUrl("")).toBe(null);
    expect(getTechLogoUrl("   ")).toBe(null);
  });

  it("returns null for non-string input", () => {
    expect(getTechLogoUrl(null as unknown as string)).toBe(null);
    expect(getTechLogoUrl(undefined as unknown as string)).toBe(null);
  });

  it("returns null for unknown tech label", () => {
    expect(getTechLogoUrl("Unknown Tech")).toBe(null);
    expect(getTechLogoUrl("FooBar")).toBe(null);
  });
});

describe("getTechLogoSlug", () => {
  it("returns slug for exact tech label", () => {
    expect(getTechLogoSlug("Next.js")).toBe("nextdotjs");
    expect(getTechLogoSlug("Zustand")).toBe("zustand");
    expect(getTechLogoSlug("TypeScript")).toBe("typescript");
  });

  it("returns slug for compound label using first-word fallback", () => {
    expect(getTechLogoSlug("Vitest + Testing Library")).toBe("vitest");
    expect(getTechLogoSlug("Turbopack / Vite")).toBe("vite");
  });

  it("trims whitespace before lookup", () => {
    expect(getTechLogoSlug("  Git  ")).toBe("git");
  });

  it("returns null for empty or falsy input", () => {
    expect(getTechLogoSlug("")).toBe(null);
    expect(getTechLogoSlug("   ")).toBe(null);
  });

  it("returns null for unknown tech label", () => {
    expect(getTechLogoSlug("Unknown Tech")).toBe(null);
  });

  it("returns null for non-string input", () => {
    expect(getTechLogoSlug(null as unknown as string)).toBe(null);
    expect(getTechLogoSlug(undefined as unknown as string)).toBe(null);
  });
});
