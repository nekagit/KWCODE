import { FlyingStarItem } from "@/components/atoms/visual-effects/FlyingStarItem";

const STAR_COUNT = 12;

export function StarField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-[1]" aria-hidden>
      {Array.from({ length: STAR_COUNT }, (_, i) => (
        <FlyingStarItem key={i} index={i} />
      ))}
    </div>
  );
}
