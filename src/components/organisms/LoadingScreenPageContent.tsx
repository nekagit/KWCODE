"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RainEffect } from "@/components/molecules/VisualEffects/RainEffect";
import { CursorLightGlow } from "@/components/molecules/VisualEffects/CursorLightGlow";
import { StarField } from "@/components/molecules/VisualEffects/StarField";
import { MoonGraphic } from "@/components/molecules/VisualEffects/MoonGraphic";
import { KwcodeBranding } from "@/components/molecules/Display/KwcodeBranding";

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
      className="fixed inset-0 flex items-center justify-center z-0"
      style={{ background: "#000" }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <RainEffect />
      <CursorLightGlow x={mouse.x} y={mouse.y} />
      <StarField />
      <MoonGraphic />
      <KwcodeBranding />

      <Link
        href="/"
        className="absolute top-4 left-4 z-[10] flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>
    </div>
  );
}
