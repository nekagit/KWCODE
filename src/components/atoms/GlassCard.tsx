import { Card, CardProps } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GlassCardProps extends CardProps {}

export function GlassCard({ className, ...props }: GlassCardProps) {
  return (
    <Card
      className={cn("glasgmorphism", className)}
      {...props}
    />
  );
}
