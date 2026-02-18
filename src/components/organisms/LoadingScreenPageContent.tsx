"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RainEffect } from "@/components/molecules/VisualEffects/RainEffect";
import { CursorLightGlow } from "@/components/molecules/VisualEffects/CursorLightGlow";
import { StarField } from "@/components/molecules/VisualEffects/StarField";
import { MoonGraphic } from "@/components/molecules/VisualEffects/MoonGraphic";
import { KwcodeBranding } from "@/components/molecules/Display/KwcodeBranding";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { getOrganismClasses } from "./organism-classes";

const c = getOrganismClasses("LoadingScreenPageContent.tsx");

/** Classes so breadcrumb is visible on the dark background */
const BREADCRUMB_DARK_CLASS =
  "text-white/90 [&_ol]:text-white/90 [&_a]:text-white/80 [&_a:hover]:text-white [&_span]:text-white [&_svg]:text-white/70";

/**
 * Full-page Loading Screen (moon and stars): same look as the root loading overlay,
 * with a go-back arrow at the top left to leave.
 */
export function LoadingScreenPageContent() {
  const [mouse, setMouse] = useState({ x: -1000, y: -1000 });

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setMouse({ x: e.clientX, y: e.clientY });
  }, []);

  const onMouseLeave = useCallback(() => {
    setMouse({ x: -1000, y: -1000 });
  }, []);

  return (
    <div
      className={c["0"]}
      style={{ background: "#000" }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <RainEffect />
      <CursorLightGlow x={mouse.x} y={mouse.y} />
      <StarField />
      <MoonGraphic />
      <KwcodeBranding />

      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
        <Breadcrumb
          items={[{ label: "Dashboard", href: "/" }, { label: "Loading" }]}
          className={BREADCRUMB_DARK_CLASS}
        />
        <Link
          href="/"
          className="flex items-center justify-center size-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
          aria-label="Go back"
        >
          <ArrowLeft className={c["2"]} />
        </Link>
      </div>
    </div>
  );
}
