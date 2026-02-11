import { RaindropCircle } from "@/components/atoms/VisualEffects/RaindropCircle";

const RAIN_COUNT = 80;

export function RainEffect() {
  return (
    <div className="kwcode-load-rain absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {Array.from({ length: RAIN_COUNT }, (_, i) => (
        <RaindropCircle key={i} index={i} />
      ))}
    </div>
  );
}
