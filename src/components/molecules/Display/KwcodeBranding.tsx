import { LoadingPulseDot } from "@/components/atoms/VisualEffects/LoadingPulseDot";

export function KwcodeBranding() {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center gap-2 pointer-events-none" aria-label="Loading">
      <span
        className="text-4xl font-bold tracking-tight text-white drop-shadow-lg sm:text-5xl"
        style={{ fontFamily: "system-ui, -apple-system, sans-serif", letterSpacing: "-0.02em" }}
      >
        kwcode
      </span>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <LoadingPulseDot key={i} index={i} />
        ))}
      </div>
    </div>
  );
}
