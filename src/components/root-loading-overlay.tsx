"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Root loading overlay: shown until the client has mounted, then fades out.
 * Branded kwcode screen with raindrops, mouse-reactive glow, flying stars, and moon.
 */

/** Number of rain circles; more = denser rain. Values deterministic from i to avoid hydration mismatch. */
const RAIN_COUNT = 80;

/** Number of flying stars. */
const STAR_COUNT = 12;

/** Pseudo-random 0..1 from index (different primes to avoid column/row patterns). */
function scatter(i: number, prime: number, mod: number) {
  return ((i * prime) % mod) / mod;
}

function RainCircles() {
  return (
    <div className="kwcode-load-rain absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {Array.from({ length: RAIN_COUNT }, (_, i) => {
        const size = 2 + scatter(i, 11, 97) * 6;
        const left = scatter(i, 31, 101) * 100;
        const topStart = -15 - scatter(i, 7, 53) * 25;
        const duration = 1.4 + scatter(i, 13, 89) * 2;
        const delay = scatter(i, 19, 71) * 5;
        const driftPx = -18 + scatter(i, 41, 73) * 36;
        return (
          <div
            key={i}
            className="kwcode-load-drop absolute rounded-full bg-[rgba(59,130,246,0.4)]"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              top: `${topStart}%`,
              animation: `kwcode-rain-fall ${duration}s linear infinite`,
              animationDelay: `${delay}s`,
              ["--drift-x" as string]: `${driftPx}px`,
            }}
          />
        );
      })}
    </div>
  );
}

/** Cursor-following glow so raindrops appear to react to the mouse. */
function CursorGlow({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1]"
      aria-hidden
      style={{
        background: `radial-gradient(
          circle 140px at ${x}px ${y}px,
          rgba(147, 197, 253, 0.35) 0%,
          rgba(59, 130, 246, 0.12) 35%,
          transparent 70%
        )`,
      }}
    />
  );
}

/** Flying stars that cross the screen with a flash. */
function FlyingStars() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-[1]" aria-hidden>
      {Array.from({ length: STAR_COUNT }, (_, i) => {
        const startX = scatter(i, 17, 100);
        const startY = scatter(i, 23, 100);
        const duration = 2.5 + scatter(i, 37, 31) * 2;
        const delay = scatter(i, 43, 17) * 8;
        const size = 2 + Math.floor(scatter(i, 7, 5)) * 2;
        const dx = (scatter(i, 53, 3) - 0.5) * 200;
        const dy = (scatter(i, 59, 3) - 0.8) * 120;
        const starDx = `${dx}vw`;
        const starDy = `${dy}vh`;
        return (
          <div
            key={i}
            className="kwcode-flying-star absolute rounded-full bg-white"
            style={{
              width: size,
              height: size,
              left: `${startX * 100}%`,
              top: `${startY * 100}%`,
              animation: `kwcode-star-fly ${duration}s linear infinite`,
              animationDelay: `${delay}s`,
              ["--star-dx" as string]: starDx,
              ["--star-dy" as string]: starDy,
              boxShadow: "0 0 6px 2px rgba(255,255,255,0.8)",
            }}
          />
        );
      })}
    </div>
  );
}

/** Moon with soft glow in the sky. */
function Moon() {
  return (
    <div
      className="pointer-events-none absolute top-[12%] right-[14%] z-[1] w-16 h-16 sm:w-20 sm:h-20"
      aria-hidden
    >
      <div
        className="absolute inset-0 rounded-full bg-[#fef9c3] opacity-95"
        style={{
          boxShadow: "0 0 40px 20px rgba(254,249,195,0.4), 0 0 80px 30px rgba(254,249,195,0.2)",
        }}
      />
      <div
        className="absolute rounded-full bg-[#e4e4e7] opacity-40"
        style={{
          width: "28%",
          height: "28%",
          top: "18%",
          left: "22%",
        }}
      />
    </div>
  );
}

export function RootLoadingOverlay() {
  const [loaded, setLoaded] = useState(false);
  const [mouse, setMouse] = useState({ x: -1000, y: -1000 });
  const overlayRef = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setMouse({ x: e.clientX, y: e.clientY });
  }, []);

  const onMouseLeave = useCallback(() => {
    setMouse({ x: -1000, y: -1000 });
  }, []);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div
      ref={overlayRef}
      id="root-loading"
      className="fixed inset-0 flex items-center justify-center z-[9999] transition-opacity duration-500 ease-out data-[loaded=true]:opacity-0 data-[loaded=true]:pointer-events-none"
      style={{ background: "#000" }}
      data-loaded={loaded ? "true" : undefined}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      suppressHydrationWarning
    >
      <RainCircles />
      <CursorGlow x={mouse.x} y={mouse.y} />
      <FlyingStars />
      <Moon />

      {/* kwcode branding centered */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-2 pointer-events-none" aria-label="Loading">
        <span
          className="text-4xl font-bold tracking-tight text-white drop-shadow-lg sm:text-5xl"
          style={{ fontFamily: "system-ui, -apple-system, sans-serif", letterSpacing: "-0.02em" }}
        >
          kwcode
        </span>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-white/70"
              style={{
                animation: "kwcode-loading-pulse 1s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
