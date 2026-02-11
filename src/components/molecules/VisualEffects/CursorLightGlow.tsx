type CursorLightGlowProps = {
  x: number;
  y: number;
};

export function CursorLightGlow({ x, y }: CursorLightGlowProps) {
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
